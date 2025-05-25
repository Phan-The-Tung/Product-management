module.exports.registerPost = (req, res, next) => {
    if(!req.body.fullName) {
        req.flash("error", `Vui lòng nhập họ tên!`);
        res.redirect(req.get("referer"));
        return;
    }

    if(!req.body.email) {
        req.flash("error", `Vui lòng nhập email!`);
        res.redirect(req.get("referer"));
        return;
    }

    if(!req.body.password) {
        req.flash("error", `Vui lòng nhập password!`);
        res.redirect(req.get("referer"));
        return;
    }
    next();
}

module.exports.loginPost = (req, res, next) => {
    if(!req.body.email) {
        req.flash("error", `Vui lòng nhập email!`);
        res.redirect(req.get("referer"));
        return;
    }

    if(!req.body.password) {
        req.flash("error", `Vui lòng nhập password!`);
        res.redirect(req.get("referer"));
        return;
    }
    next();
}

module.exports.forgotPasswordPost = (req, res, next) => {
    if(!req.body.email) {
        req.flash("error", `Vui lòng nhập email!`);
        res.redirect(req.get("referer"));
        return;
    }

     
    next();
}


module.exports.resetPasswordPost = (req, res, next) => {
    // Kiểm tra các trường bắt buộc
    if (!req.body.password) {
        req.flash("error", 'Vui lòng nhập mật khẩu!');
        res.redirect(req.get("referer"));
        return ;
    }

    if (!req.body.confirmpassword) {
        req.flash("error", 'Vui lòng xác nhận mật khẩu!');
        res.redirect(req.get("referer"));
        return ;
    }

    // Kiểm tra mật khẩu khớp nhau
    if (req.body.password !== req.body.confirmpassword) {
        req.flash("error", 'Mật khẩu không khớp!');
        res.redirect(req.get("referer"));
        return;
         
    }

    // Nếu tất cả validation passed, chuyển sang middleware tiếp theo
    next();
};