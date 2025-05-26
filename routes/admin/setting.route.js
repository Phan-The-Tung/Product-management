const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controllers = require("../../controllers/admin/setting.controller") ;
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/general", controllers.general);

router.patch("/general", 
    upload.single("logo"), 
    uploadCloud.upload,
    controllers.generalPatch
);

module.exports = router;