const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
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

    await User.updateOne({
      tokenUser: user.tokenUser
    }, {
      statusOnline: "online"
    });

    res.redirect("/");
}


// [GET] /user/logout
module.exports.logout = async (req, res) => {

    await User.updateOne({
      tokenUser: req.cookies.tokenUser
    }, {
      statusOnline: "offline"
    });
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
  const user = req.user;
  // console.log(user);

  const cart = await Cart.findOne({
    user_id: user._id
  });
  // console.log(cart);

  let totalOrder = 0;
  if (cart) {
    totalOrder = await Order.countDocuments({
      cart_id: cart._id,
      deleted: false
    });
  }

  let order = 0;
  if (cart) {
    order = await Order.countDocuments({
      cart_id: cart._id,
      deleted: false,
      status: "delivered"
    });
  }
  // console.log(totalOrder);

   
  res.render("client/pages/user/info", {
      pageTitle: "Thông tin tài khoản",
      user: user,
      totalOrder: totalOrder,
      Order: order
  });
};

// [POST] /user/profile
module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      birthday: req.body.birthday,
      gender: req.body.gender
    };

    // Loại bỏ các trường undefined hoặc null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
        delete updateData[key];
      }
    });

    await User.updateOne(
      { _id: userId },
      updateData
    );

    req.flash("success", "Cập nhật thông tin  thành công");

    res.redirect(req.get("referer"));
  } catch (error) {
    // console.error("Error updating profile:", error);
    req.flash("success", "Cập nhật thông tin  thất bại");

    res.redirect(req.get("referer"));
  }
};

// [POST] /user/upload-avatar
module.exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.body.avatar) {
      return res.json({
        success: false,
        message: "Không có file được upload"

      });
    }
    console.log(req.body.avatar);
    const avatarUrl = req.body.avatar;
     
    
    await User.updateOne(
      { _id: userId },
      { avatar: avatarUrl }
    );

    res.redirect(req.get("referer"));

    

  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.redirect(req.get("referer"));
     
  }
};

// [GET] /user/change-password
module.exports.changePassword = async (req, res) => {
  res.render("client/pages/user/change-password", {
    pageTitle: "Đổi mật khẩu"
  });
};

// [POST] /user/change-password
module.exports.changePasswordPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra mật khẩu hiện tại
    const user = await User.findById(userId);
    if (md5(currentPassword) !== user.password) {
      return res.json({
        success: false,
        message: "Mật khẩu hiện tại không đúng"
      });
    }

    // Kiểm tra mật khẩu mới
    if (newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: "Mật khẩu xác nhận không khớp"
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      });
    }

    // Cập nhật mật khẩu mới
    await User.updateOne(
      { _id: userId },
      { password: md5(newPassword) }
    );

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công!"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.json({
      success: false,
      message: "Có lỗi xảy ra khi đổi mật khẩu"
    });
  }
};



