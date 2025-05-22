 const Product = require("../../models/product.model");
 const productsHelper = require("../../helpers/product");

module.exports.index = async (req, res) => {

     const productsFeatured = await Product.find({
        feadtured: "1",
        deleted: false,
        status: "active"
     })

      const newProducts = productsHelper.priceNewProducts(productsFeatured);

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        productsFeatured: newProducts
    });
};