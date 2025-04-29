const Product = require("../../models/product.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelpers = require("../../helpers/pagination");
const searchHelpers = require("../../helpers/search");




module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelpers(req.query);
  
  const objectSearch = searchHelpers(req.query);



   
  let find ={
    deleted: false,
  };
  
  if(req.query.status){
    find.status = req.query.status;
  };


  if(objectSearch.regex){
    find.title = objectSearch.regex;
  }

  //Phân trang
   const countProducts = await Product.countDocuments(find);

   let objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitItems: 4
    },
    req.query,
    countProducts
   );


  //End phân trang

  const products = await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip);

   
  console.log(products);

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

 module.exports.changeStatus = async(req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  const back = req.get("referer");

  await Product.updateOne({ _id: id}, { status: status});
  res.redirect(back);
   

};


