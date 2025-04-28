const Product = require("../../models/product.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");

module.exports.index = async (req, res) => {
  let filterStatus = filterStatusHelpers(req.query);
  
  let objectSearch = searchHelpers(req.query);



   
  let find ={
    deleted: false,
  };
  
  if(req.query.status){
    find.status = req.query.status;
  };


  if(objectSearch.regex){
    find.title = objectSearch.regex;
  }

  const products = await Product.find(find);

   
  console.log(products);

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword
  });
};


