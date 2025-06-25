const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');
const authMiddleware = require('../../middlewares/client/auth.middleware');

router.get("/orders", authMiddleware.requireAuth, orderController.index);

router.get("/orders", authMiddleware.requireAuth, orderController.index);

module.exports = router; 