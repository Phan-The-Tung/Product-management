const Order = require('../../models/order.model');
const Product = require('../../models/product.model');
const productsHelper = require('../../helpers/product');

module.exports.index = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const orders = await Order.find({ cart_id: cartId, deleted: false }).sort({ createdAt: -1 });

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        let total = 0;
        const products = await Promise.all(
          order.products.map(async (item) => {
            const productInfo = await Product.findById(item.product_id);
            item.priceNew = productsHelper.priceNewProduct(item);
            item.totalPrice = item.priceNew * item.quantity;
            item.productInfo = productInfo || { title: 'Sản phẩm đã bị xóa' };
            total += item.totalPrice;
            return item;
          })
        );
        return {
          ...order.toObject(),
          products,
          total,
        };
      })
    );

    res.render('client/pages/user/orders', {
      pageTitle: 'Đơn hàng của tôi',
      orders: ordersWithDetails,
    });
  } catch (error) {
    req.flash('error', 'Có lỗi xảy ra!');
    res.redirect('/');
  }
}; 