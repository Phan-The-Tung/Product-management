const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const controllers = require("../../controllers/admin/product-category.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validates = require("../../validates/admin/product-category.validate"); 


router.get("/", controllers.index);

router.get("/create", controllers.create);

router.post("/create", 
    upload.single("thumbnail"), 
    uploadCloud.upload,
    // validates.createPost,
    controllers.createPost
);

module.exports = router;