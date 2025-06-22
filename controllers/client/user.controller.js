const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const Cart = require("../../models/cart.model");
const md5 = require("md5");

// [GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký"
    })

}

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    // console.log(req.body);
    
    const existEmail = await User.findOne({
      email: req.body.email
    });
  
    if (existEmail) {
      req.flash("error", "Email đã tồn tại!");
      res.redirect(req.get("referer"));
      return;
    }
  
    req.body.password = md5(req.body.password);
  
    const user = new User(req.body);
    await user.save();

    const cart = new Cart();
    cart.user_id = user.id;
    await cart.save();
  
     res.cookie("tokenUser", user.tokenUser);
     res.cookie("cartId", cart.id);

     res.redirect("/");
  };

// [GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập"
    })

}

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    const user = await User.findOne({
      email: email,
      deleted: false
    });
    
    if (!user) {
      req.flash("error", "Email không tồn tại!");
      res.redirect(req.get("referer"));
      return;
    }

    if (md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu!");
        res.redirect(req.get("referer"));
        return;
    }

    if (user.status === "inactive") {
        req.flash("error", "Tài khoản đang bị khóa!");
        res.redirect(req.get("referer"));
        return;
    }

    const cart = await Cart.findOne({
      user_id: user.id
    });
  
    // if(cart) {
    //     res.cookie("cartId", cart.id);
    // } else {
        // await Cart.updateOne({
        //     __id: req.cookies.cartId
        // }, {
        //     user_id: user.id
        // });

        // const cart = new Cart();
        // cart.user_id = user.id;
        // cart.save();
    // }

    res.cookie("tokenUser", user.tokenUser);
    res.cookie("cartId", cart.id);

    res.redirect("/");
}


// [GET] /user/logout
module.exports.logout = async (req, res) => {
     res.clearCookie("tokenUser");
     console.log(req.cookies.cartId);
     res.clearCookie("cartId");
     res.redirect("/");
}

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Lấy lại mật khẩu"
    })
}


// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;
  
    const user = await User.findOne({
      email: email,
      deleted: false
    });
  
    if (!user) {
      req.flash("error", "Email không tồn tại!");
      res.redirect(req.get("referer"));
      return;
    }

    // Lưu thông tin vào DB
    const otp = generateHelper.generateRandomNumber(8);

    const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() 
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();


  
    // Nếu tồn tại email thì gửi mã OTP qua email

    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `Mã OTP để lấy lại mật khẩu là <b style="color: red;">${otp}</b>. Thời hạn sử dụng là 3 phút.`;
    sendMailHelper.sendMail(email, subject, html);
  
    res.redirect(`/user/password/otp?email=${email}`);
  };

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email,
  });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  // console.log(email);
  // console.log(otp);

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if (!result) {
    req.flash("error", "OTP không hợp lệ!");
    res.redirect(req.get("referer"));
    return;
  }

  const user = await User.findOne({
    email: email
  });
  // console.log(user);

  // const cart = await Cart.findOne({
  //   user_id: user.id
  // });

  // console.log(cart);

  res.cookie("tokenUser", user.tokenUser);
  // res.cookie("cardId", cart.id);

  res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;
  console.log(password);
  console.log(tokenUser);

  await User.updateOne({
      tokenUser: tokenUser
  }, {
      password: md5(password)
  });

  const user = await User.findOne({
    tokenUser: tokenUser
  })

  const cart = await Cart.findOne({
    user_id: user.id
  });

  console.log(cart);
  // console.log(cart.id);

  res.cookie("cartId", cart.id);
  res.redirect("/");
};
  
// [GET] /user/info
module.exports.info = async (req, res) => {
   
  res.render("client/pages/user/info", {
      pageTitle: "Thông tin tài khoản",
  });
};


