const express = require("express");
const router = express.Router();
const multer = require("multer");
const controllers = require("../../controllers/admin/my-account.controller") ;
const upload = multer(); 
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/", controllers.index);

router.get("/edit", controllers.edit);

router.patch(
    "/edit",
    upload.single("avatar"),
    uploadCloud.upload,
    controllers.editPatch);



module.exports = router;