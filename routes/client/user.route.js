const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/client/user.controller")
const validate = require("../../validates/client/user.validate");

router.get("/register",controllers.register );

router.get("/login",controllers.login );

router.get("/logout",controllers.logout );

router.get("/password/forgot",controllers.forgotPassword );

router.post("/register", validate.registerPost, controllers.registerPost );

router.post("/login", validate.loginPost, controllers.loginPost );

router.post("/password/forgot", validate.forgotPasswordPost, controllers.forgotPasswordPost );

module.exports = router;