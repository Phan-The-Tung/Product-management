const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const createTreeHelper= require("../../helpers/createTree");
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");
const paginationHelpers = require("../../helpers/pagination");
const Account = require("../../models/account.model");


// [GET] /admin/products-category
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
   const countProductsCategory = await ProductCategory.countDocuments(find);

   let currentPage = 1;

   if(req.query.page){
      currentPage = parseInt(req.query.page);
   }
  
      

   const start_index = (currentPage - 1) * 4 + 1;

  //  console.log(currentPage);
  //  console.log(start_index);

   const totalPages = Math.ceil(countProductsCategory / 4);

   let objectPagination =  
    {
       start_index: start_index,
       totalPage: totalPages,
       currentPage: currentPage
    }

    
        objectPagination.totalPage = totalPages;

    console.log(objectPagination);
     
  //End phân trang

    const records = await ProductCategory.find(find)

    const newRecords = createTreeHelper.tree(records);

    for(const record of records) {
      const user = await Account.findOne({
        _id: record.createdBy.account_id
      });
  
      if(user) {
        record.accountFullName = user.fullName;
      }
    }

    // res.locals.count = 0;


    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        objectPagination: objectPagination
    });
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {

    let find ={
        deleted: false,
    };

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords
    });
};


// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {

    if(req.body.position == ""){
        const countProducts = await ProductCategory.countDocuments();
        req.body.position = countProducts + 1;
      } else {
        req.body.position = parseInt(req.body.position);
      }
     
      req.body.createdBy = {
        account_id: res.locals.user.id
      };
    
      const product = new ProductCategory(req.body);
      await product.save();
    
      // res.redirect(req.get("referer"));
      
      res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    
      
};



// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {

    try {
        const id = req.params.id;

        let find ={
            deleted: false,
            _id: id
        };

        const data = await ProductCategory.findOne(find);


        const records = await ProductCategory.find({
            deleted: false,
        });

        const newRecords = createTreeHelper.tree(records);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};


// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {

    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    await ProductCategory.updateOne({_id: id}, req.body);

    res.redirect(req.get("referer"));
 
};

// [PATCH]/change-status/:status/:id

module.exports.changeStatus = async(req, res) => {
    const status = req.params.status;
    const id = req.params.id;
  
    const back = req.get("referer");
  
    await ProductCategory.updateOne({ _id: id}, { status: status});
  
    req.flash("success", "Cập nhật trạng thái danh mục sản phẩm thành công");
    res.redirect(back);
  };

  // [PATCH]/change-multi

module.exports.changeMulti = async(req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
 
    switch(type){
     case "active":
       await ProductCategory.updateMany({ _id: { $in: ids}}, { status: "active"});
       req.flash("success", `Cập nhật trạng thái danh mục ${ids.length} sản phẩm thành công`);
       break;
     case "inactive":
       await ProductCategory.updateMany({ _id: { $in: ids}}, { status: "inactive"});
       req.flash("success",   `Cập nhật trạng thái danh mục ${ids.length} sản phẩm thành công`);
       break;
     case "delete-all":
       await ProductCategory.updateMany({ _id: { $in: ids}}, { deleted: true, deletedBy: {
         account_id: res.locals.user.id,
         deletedAt: new Date()
       }});
       req.flash("success",   `Xóa danh mục ${ids.length} sản phẩm thành công`);
       break;
     case "change-position":
       for (const item of ids) {
         let [id, position] = item.split("-");
         position = parseInt(position);
         await ProductCategory.updateOne({ _id: id}, { position: position});
       }
       req.flash("success",   `Cập nhật vị trí danh mục ${ids.length} sản phẩm thành công`);
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
   await ProductCategory.updateOne({_id: id}, 
     {
       deleted: true,
       deletedBy: {
         account_id: res.locals.user.id,
         deletedAt: new Date()
       }
 
     }
     
   );
   req.flash("success", "Xóa danh mục sản phẩm thành công");
 
    res.redirect(req.get("referer"));
 }

 