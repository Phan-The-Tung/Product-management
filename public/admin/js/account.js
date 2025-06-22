const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonChangeStatus){
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");
     buttonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            
            let statusChange = statusCurrent === "active" ? "inactive" : "active";
            
            const action = path + `/${statusChange}/${id}?_method=PATCH`;
            formChangeStatus.action = action;
            formChangeStatus.submit();
        
        
        });
     });
}
// End Button Change Status

// Button Delete
const buttonsDelete = document.querySelectorAll("[button-delete]");

if (buttonsDelete.length > 0) {
  buttonsDelete.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc chắn muốn xóa không?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");

        const path = `${prefixAdmin}/accounts/delete/${id}`;

        fetch(path, {
          method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
          if (data.code == 200) {
            window.location.reload();
          }
        });
      }
    });
  });
}
// End Button Delete