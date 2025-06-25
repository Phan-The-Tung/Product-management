const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/client/user.controller")
const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const uploadMiddleware = require("../../middlewares/client/uploadCloud.middleware");

router.get("/register",controllers.register );

router.get("/info", authMiddleware.requireAuth, controllers.info );

router.get("/login",controllers.login );

router.get("/logout",controllers.logout );

router.get("/password/otp",controllers.otpPassword );

router.get("/password/forgot",controllers.forgotPassword );

router.get("/password/reset",controllers.resetPassword );

router.get("/change-password", authMiddleware.requireAuth, controllers.changePassword );

router.post("/register", validate.registerPost, controllers.registerPost );

router.post("/login", validate.loginPost, controllers.loginPost );

router.post("/password/forgot", validate.forgotPasswordPost, controllers.forgotPasswordPost );

router.post("/password/otp", controllers.otpPasswordPost );

router.post("/password/reset", validate.resetPasswordPost,controllers.resetPasswordPost );

// Thêm routes mới
router.post("/profile", authMiddleware.requireAuth, controllers.updateProfile);

router.post("/upload-avatar", authMiddleware.requireAuth, uploadMiddleware.upload.single("avatar"), controllers.uploadAvatar);

router.post("/change-password", authMiddleware.requireAuth, controllers.changePasswordPost);

module.exports = router;