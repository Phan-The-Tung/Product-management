const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helpers/product");

//[GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
    const statistic = {
        categoryProduct: {
          total: 0,
          active: 0,
          inactive: 0,
        },
        product: {
          total: 0,
          active: 0,
          inactive: 0,
        },
        account: {
          total: 0,
          active: 0,
          inactive: 0,
        },
        order: {
          total: 0,
          totalRevenue: 0,
        }
    };
    // Danh mục sản phẩm
    statistic.categoryProduct.total = await ProductCategory.countDocuments({ deleted: false });
    statistic.categoryProduct.active = await ProductCategory.countDocuments({ status: "active", deleted: false });
    statistic.categoryProduct.inactive = await ProductCategory.countDocuments({ status: "inactive", deleted: false });
    // Sản phẩm
    statistic.product.total = await Product.countDocuments({ deleted: false });
    statistic.product.active = await Product.countDocuments({ status: "active", deleted: false });
    statistic.product.inactive = await Product.countDocuments({ status: "inactive", deleted: false });
    // Tài khoản
    statistic.account.total = await Account.countDocuments({ deleted: false });
    statistic.account.active = await Account.countDocuments({ status: "active", deleted: false });
    statistic.account.inactive = await Account.countDocuments({ status: "inactive", deleted: false });
    // Đơn hàng
    statistic.order.total = await Order.countDocuments({ deleted: false });
    const orders = await Order.find({ deleted: false });
    for (const order of orders) {
      for (const item of order.products) {
        // const productId = item.product_id;
        // const productInfo = await Product.findOne({
        //   _id: productId,
        // }).select("title thumbnail slug price discountPercentage");
        const productInfo  = {
          price: item.price,
          discountPercentage: item.discountPercentage
        }
        console.log(productInfo);
        productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
        item.total = productInfo.priceNew * item.quantity;
        console.log(productInfo);
      }
      order.totalPrice = order.products.reduce((sum, item) => sum + item.total, 0);

    };
    // console.log(orders);
    statistic.order.totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    // Top 5 sản phẩm bán chạy
    const productSales = {};
    orders.forEach(order => {
      order.products.forEach(item => {
        if (!productSales[item.product_id]) productSales[item.product_id] = 0;
        productSales[item.product_id] += item.quantity;
      });
    });
    // console.log(productSales);
    const topProductIds = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
    const topProducts = await Product.find({ _id: { $in: topProductIds } });
    // Top 5 đơn hàng mới nhất
    const latestOrders = await Order.find({ deleted: false }).sort({ createdAt: -1 }).limit(5);
    if (latestOrders.length > 0) {
      latestOrders.forEach(order => {
        for (const item of order.products) {
  
          item.priceNew = productsHelper.priceNewProduct(item);
    
          item.totalPrice = item.priceNew * item.quantity;
        }
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
      });
    }
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan",
        statistic,
        topProducts,
        latestOrders,
        user: res.locals.user,
        role: res.locals.role
    });
};
