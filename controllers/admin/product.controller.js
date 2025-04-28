const Product = require("../../models/product.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
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
  let objectPagination ={
    currentPage: 1,
    limitItems: 4
  };

  if(req.query.page){
    objectPagination.currentPage = parseInt(req.query.page);
  }

   objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    const countProducts = await Product.countDocuments(find);
    const totalPages = Math.ceil(countProducts / objectPagination.limitItems);
    objectPagination.totalPage = totalPages;

    console.log(objectPagination.totalPage);



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


