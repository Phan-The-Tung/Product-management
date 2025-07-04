const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/client/product.controller")


router.get("/",controllers.index );

router.get("/detail/:slugProduct",controllers.detail );

router.get("/:slugCategory",controllers.category );

module.exports = router;