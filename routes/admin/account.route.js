const express = require("express");
const multer = require("multer");
const router = express.Router();
const controllers = require("../../controllers/admin/account.controller") ;
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validates = require("../../validates/admin/account.validate");

router.get("/", controllers.index);

router.get("/create", controllers.create);

router.post("/create",
    upload.single("avatar"), 
    uploadCloud.upload,
    validates.createPost,
    controllers.createPost
);
    
router.get("/edit/:id", controllers.edit);

router.patch("/edit/:id",
    upload.single("avatar"), 
    uploadCloud.upload,
    validates.editPatch,
    controllers.editPatch
);

router.patch("/change-status/:status/:id", controllers.changeStatus);

router.delete("/delete/:id", controllers.deleteItem);

router.get("/detail/:id", controllers.detail);



module.exports = router;