// Order management JavaScript

// Delete order
const buttonDelete = document.querySelectorAll("[button-delete]");

if (buttonDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc chắn muốn xóa đơn hàng này?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=DELETE`;
        formDeleteItem.action = action;
        formDeleteItem.submit();
      }
    });
  });
}

// Change status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");

if (buttonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status");
  const path = formChangeStatus.getAttribute("data-path");

  buttonChangeStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const statusCurrent = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");
      let statusChange = statusCurrent == "active" ? "inactive" : "active";

      const action = `${path}/${id}?_method=PATCH`;
      const formData = new FormData(formChangeStatus);
      formData.append("status", statusChange);

      fetch(action, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code == 200) {
            button.setAttribute("data-status", statusChange);
            button.innerHTML = statusChange == "active" ? "Hoạt động" : "Dừng hoạt động";
            button.classList.remove("badge-success", "badge-danger");
            button.classList.add(
              statusChange == "active" ? "badge-success" : "badge-danger"
            );
          }
        });
    });
  });
}

// Checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]");

if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
  const formChangeMulti = document.querySelector("#form-change-multi");

  inputCheckAll.addEventListener("change", () => {
    inputsId.forEach((input) => {
      input.checked = inputCheckAll.checked;
    });
    renderCheckedInputs();
  });

  inputsId.forEach((input) => {
    input.addEventListener("change", () => {
      const countChecked = checkboxMulti.querySelectorAll(
        "input[name='id']:checked"
      ).length;
      const countTotal = inputsId.length;

      if (countChecked == countTotal) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }

      renderCheckedInputs();
    });
  });
}

function renderCheckedInputs() {
  const inputsId = checkboxMulti.querySelectorAll("input[name='id']:checked");
  const select = formChangeMulti.querySelector("select[name='type']");
  const inputIds = formChangeMulti.querySelector("input[name='ids']");
  const btnApply = formChangeMulti.querySelector("[type='submit']");

  if (inputsId.length > 0) {
    select.disabled = false;
    btnApply.disabled = false;

    const ids = Array.from(inputsId).map((input) => input.value);
    inputIds.value = ids.join(", ");
  } else {
    select.disabled = true;
    btnApply.disabled = true;
  }
}

// Form change multi
const formChangeMulti = document.querySelector("#form-change-multi");

if (formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();

    if (confirm("Bạn có chắc chắn muốn áp dụng thao tác này?")) {
      const formData = new FormData(formChangeMulti);
      const path = formChangeMulti.getAttribute("data-path");

      fetch(path, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code == 200) {
            window.location.reload();
          } else {
            alert("Có lỗi xảy ra!");
          }
        });
    }
  });
} 