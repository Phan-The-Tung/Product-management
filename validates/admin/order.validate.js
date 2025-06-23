const validate = require("validate.js");

const constraints = {
  status: {
    presence: {
      allowEmpty: false,
      message: "^Trạng thái không được để trống"
    },
    inclusion: {
      within: ["pending", "processing", "shipped", "delivered", "cancelled"],
      message: "^Trạng thái không hợp lệ"
    }
  }
};

module.exports = {
  validateOrder: (data) => {
    return validate(data, constraints);
  }
}; 