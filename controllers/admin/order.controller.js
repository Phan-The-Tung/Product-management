const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const paginationHelper = require("../../helpers/pagination");
const productsHelper = require("../../helpers/product");
// const validateOrder = require("../../validates/admin/order.validate");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Filter
  if (req.query.status) {
    find.status = req.query.status;
  }

  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.$or = [
      { "userInfo.fullName": regex },
      { "userInfo.phone": regex },
      { "userInfo.address": regex },
    ];
  }

  // Pagination
  const countOrders = await Order.countDocuments(find);
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 10,
    },
    req.query,
    countOrders
  );

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.createdAt = "desc";
  }

  const orders = await Order.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  // Populate user information
  const ordersWithUserInfo = await Promise.all(
    orders.map(async (order) => {
      const user = await User.findOne({ _id: order.user_id });
      return {
        ...order.toObject(),
        user: user ? user.fullName : "Unknown User",
      };
    })
  );

  if (ordersWithUserInfo.length > 0) {
    ordersWithUserInfo.forEach(order => {
      for (const item of order.products) {

        item.priceNew = productsHelper.priceNewProduct(item);
  
        item.totalPrice = item.priceNew * item.quantity;
      }
      order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
    });
  }



  // cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
  // console.log(ordersWithUserInfo);

  res.render("admin/pages/orders/index", {
    pageTitle: "Quản lý đơn hàng",
    orders: ordersWithUserInfo,
    pagination: objectPagination,
    keyword: req.query.keyword || "",
    status: req.query.status || "",
  });
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      deleted: false,
    });

    if (!order) {
      req.flash("error", "Đơn hàng không tồn tại!");
      res.redirect("/admin/orders");
    }
     

    const cart = await Cart.findOne({
      _id: order.cart_id
    });

    console.log(order);


    // Get user information
    const users = await User.findOne({ _id: cart.user_id });

    console.log(users);

    // Get product information
    const productsWithInfo = await Promise.all(
      order.products.map(async (product) => {
        const productInfo = await Product.findOne({ _id: product.product_id });
        return {
          ...product.toObject(),
          productInfo: productInfo || { title: "Sản phẩm đã bị xóa" },
        };
      })
    );

    console.log(productsWithInfo);
    let total = 0;

    if ( productsWithInfo.length > 0) {
     
        for (const item of productsWithInfo) {
  
          item.priceNew = productsHelper.priceNewProduct(item);
    
          item.totalPrice = item.priceNew * item.quantity;
        }
          total =  productsWithInfo.reduce((sum, item) => sum + item.totalPrice, 0);
         
      
    }
   console.log(total);


    res.render("admin/pages/orders/detail", {
      pageTitle: "Chi tiết đơn hàng",
      order: order,
      users: users,
      products: productsWithInfo,
      totalPrice: total,
    });
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect("/admin/orders");
  }
};

// [PATCH] /admin/orders/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.params.id;

    // Validate
    // const validation = validateOrder.validateOrder({ status });
    // if (validation) {
    //   req.flash("error", "Dữ liệu không hợp lệ!");
    //   return res.redirect("back");
    // }

    await Order.updateOne(
      { _id: orderId },
      { status: status }
    );

    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect(req.get("referer"));
  } catch (error) {
    req.flash("error", "Cập nhật trạng thái thất bại!");
    res.redirect(req.get("referer"));
  }
};

// [DELETE] /admin/orders/delete/:id
module.exports.delete = async (req, res) => {
  try {
    await Order.updateOne(
      { _id: req.params.id },
      {
        deleted: true,
        deletedAt: new Date(),
      }
    );

    req.flash("success", "Xóa đơn hàng thành công!");
    res.redirect(req.get("referer"));
  } catch (error) {
    req.flash("error", "Xóa đơn hàng thất bại!");
    res.redirect(req.get("referer"));
  }
};

// [PATCH] /admin/orders/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
      case "processing":
        await Order.updateMany(
          { _id: { $in: ids } },
          { status: "processing" }
        );
        req.flash("success", `Cập nhật trạng thái thành công ${ids.length} đơn hàng!`);
        break;
      case "shipped":
        await Order.updateMany(
          { _id: { $in: ids } },
          { status: "shipped" }
        );
        req.flash("success", `Cập nhật trạng thái thành công ${ids.length} đơn hàng!`);
        break;
      case "delivered":
        await Order.updateMany(
          { _id: { $in: ids } },
          { status: "delivered" }
        );
        req.flash("success", `Cập nhật trạng thái thành công ${ids.length} đơn hàng!`);
        break;
      case "cancelled":
        await Order.updateMany(
          { _id: { $in: ids } },
          { status: "cancelled" }
        );
        req.flash("success", `Cập nhật trạng thái thành công ${ids.length} đơn hàng!`);
        break;
      case "delete":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
          }
        );
        req.flash("success", `Xóa thành công ${ids.length} đơn hàng!`);
        break;
      default:
        break;
    }
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
  }

  res.redirect(req.get("referer"));
}; 