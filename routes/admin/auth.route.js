const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/admin/auth.controller") ;
const validates = require("../../validates/admin/auth.validate");

router.get("/login", controllers.login);

router.post("/login",
    validates.loginPost,
    controllers.loginPost
);

router.get("/logout", controllers.logout);

module.exports = router;