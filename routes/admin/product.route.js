const express = require("express");
const multer = require("multer");
const router = express.Router();
const storageMulter = require("../../helpers/storageMulter");
const upload = multer({ storage : storageMulter()});

const controllers = require("../../controllers/admin/product.controller") ;


router.get("/", controllers.index);

router.patch("/change-status/:status/:id", controllers.changeStatus);

router.patch("/change-multi", controllers.changeMulti);

router.delete("/delete/:id", controllers.deleteItem);

router.get("/create", controllers.create);

router.post("/create", upload.single("thumbnail"), controllers.createPost);

module.exports = router;