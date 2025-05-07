const Product = require("../../models/product.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelpers = require("../../helpers/pagination");
const searchHelpers = require("../../helpers/search");


// [GET]/admin/products

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

  const products = await Product.find(find)
    .sort({position: "desc"})
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

   
  // console.log(products);

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

// [PATCH]/change-status/:status/:id

 module.exports.changeStatus = async(req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  const back = req.get("referer");

  await Product.updateOne({ _id: id}, { status: status});

  req.flash("success", "Cập nhật trạng thái sản phẩm thành công");
  res.redirect(back);
   

};

// [PATCH]/change-multi

module.exports.changeMulti = async(req, res) => {
   const type = req.body.type;
   const ids = req.body.ids.split(", ");

   switch(type){
    case "active":
      await Product.updateMany({ _id: { $in: ids}}, { status: "active"});
      req.flash("success", `Cập nhật trạng thái ${ids.length} sản phẩm thành công`);
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids}}, { status: "inactive"});
      req.flash("success",   `Cập nhật trạng thái ${ids.length} sản phẩm thành công`);
      break;
    case "delete-all":
      await Product.updateMany({ _id: { $in: ids}}, { deleted: true, deletedAt: new Date()});
      req.flash("success",   `Xóa ${ids.length} sản phẩm thành công`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id}, { position: position});
      }
      req.flash("success",   `Cập nhật vị trí ${ids.length} sản phẩm thành công`);
      break;

    default:
      break;
   }

   res.redirect(req.get("referer"));
};

// [DELETE]/delete/:id

module.exports.deleteItem = async(req, res) => {
   const id = req.params.id;
    
  //  await Product.deleteOne({_id: id});
  await Product.updateOne({_id: id}, {deleted: true},{deletedAt: new Date()});
  req.flash("success", "Xóa sản phẩm thành công");

   res.redirect(req.get("referer"));
}


