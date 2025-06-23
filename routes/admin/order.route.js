const express = require("express");
const router = express.Router();

const orderController = require("../../controllers/admin/order.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.use(authMiddleware.requireAuth);

// [GET] /admin/orders
router.get("/", orderController.index);

// [GET] /admin/orders/detail/:id
router.get("/detail/:id", orderController.detail);

// [PATCH] /admin/orders/change-status/:id
router.patch("/change-status/:id", orderController.changeStatus);

// [DELETE] /admin/orders/delete/:id
router.delete("/delete/:id", orderController.delete);

// [PATCH] /admin/orders/change-multi
router.patch("/change-multi", orderController.changeMulti);

module.exports = router; 