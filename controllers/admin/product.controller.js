const Product = require("../../models/product.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
const paginationHelpers = require("../../helpers/pagination");
const searchHelpers = require("../../helpers/search");
const systemConfig = require("../../config/system");
const Account = require("../../models/account.model");

const ProductCategory = require("../../models/product-category.model");
 
const createTreeHelper= require("../../helpers/createTree");



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


  //Sort
  let sort = {};

  if(req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  //End Sort

  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

   
  // console.log(products);
  for(const product of products) {
    const user = await Account.findOne({
      _id: product.createdBy.account_id
    });

    if(user) {
      product.accountFullName = user.fullName;
    }

    //Lấy ra thông tin người cập nhật gần nhất

    const updatedBy = product.updatedBy.slice(-1)[0];
    if(updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      })

      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  console.log(products);

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

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }

  const back = req.get("referer");

  await Product.updateOne({ _id: id}, { status: status, $push: { updatedBy: updatedBy}});

  req.flash("success", "Cập nhật trạng thái sản phẩm thành công");
  res.redirect(back);
   

};

// [PATCH]/change-multi

module.exports.changeMulti = async(req, res) => {
   const type = req.body.type;
   const ids = req.body.ids.split(", ");
   const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }

   switch(type){
    case "active":
      await Product.updateMany({ _id: { $in: ids}}, { status: "active", $push: { updatedBy: updatedBy}});
      req.flash("success", `Cập nhật trạng thái ${ids.length} sản phẩm thành công`);
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids}}, { status: "inactive", $push: { updatedBy: updatedBy}});
      req.flash("success",   `Cập nhật trạng thái ${ids.length} sản phẩm thành công`);
      break;
    case "delete-all":
      await Product.updateMany({ _id: { $in: ids}}, { deleted: true, deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date()
      }});
      req.flash("success",   `Xóa ${ids.length} sản phẩm thành công`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id}, { position: position, $push: { updatedBy: updatedBy}});
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
  await Product.updateOne({_id: id}, 
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date()
      }

    }
    
  );req.flash("success", "Xóa sản phẩm thành công");

   res.redirect(req.get("referer"));
   
}

// [GET]/admin/products/create

module.exports.create = async(req, res) => {

    let find ={
      deleted: false,
    };

     const category = await ProductCategory.find(find);

     const newCategory = createTreeHelper.tree(category);

     res.render("admin/pages/products/create", {
      pageTitle: "Thêm sản phẩm",
      category: newCategory
     });
}

// [POST]/admin/products/create
module.exports.createPost = async(req, res) => {
  // console.log(req.file);
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if(req.body.position == ""){
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  req.body.createdBy = {
    account_id: res.locals.user.id,
    createdAt: new Date()
  };
 
   

  const product = new Product(req.body);
  await product.save();

  // res.redirect(req.get("referer"));
  req.flash("success", "Thêm  sản phẩm thành công");
  res.redirect(`${systemConfig.prefixAdmin}/products`);

  
}       


// [GET]/admin/products/edit/:id
module.exports.edit = async(req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };
  
    const product = await Product.findOne(find);

    const category = await ProductCategory.find({
      deleted: false,
    });

    const newCategory = createTreeHelper.tree(category);


    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      category: newCategory
    });
    
  } catch (error) {
    req.flash("error", "Sửa sản phẩm lỗi");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
     
  }

   
}



// [PATCH]/admin/products/edit/:id
module.exports.editPatch = async(req, res) => {

  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

   

 
   try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date()
    }

     


    await Product.updateOne({_id: req.params.id}, 
      {...req.body,
      $push: { updatedBy: updatedBy}}
    );
    req.flash("success", "Sửa sản phẩm thành công");
   } catch (error) {
    req.flash("error", "Sửa sản phẩm thất bại");
    
   }

  // res.redirect(req.get("referer"));
  
  res.redirect(req.get("referer"));

   
}


// [GET]/admin/products/detail/:id
module.exports.detail = async(req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };
  
    const product = await Product.findOne(find);
  
    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: product
    });
    
  } catch (error) {
    req.flash("error", "Chi tiết  sản phẩm lỗi");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
     
  }
}





