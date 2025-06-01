const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const controllers = require("../../controllers/admin/product-category.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validates = require("../../validates/admin/product-category.validate"); 


router.get("/", controllers.index);

router.patch("/change-status/:status/:id", controllers.changeStatus);

router.patch("/change-multi", controllers.changeMulti);

router.delete("/delete/:id", controllers.deleteItem);

router.get("/create", controllers.create);

router.post("/create", 
    upload.single("thumbnail"), 
    uploadCloud.upload,
    validates.createPost,
    controllers.createPost
);

router.get("/edit/:id", controllers.edit);

router.patch("/edit/:id", 
    upload.single("thumbnail"), 
    uploadCloud.upload,
    validates.createPost,
    controllers.editPatch
);


router.get("/detail/:id", controllers.detail);


module.exports = router;