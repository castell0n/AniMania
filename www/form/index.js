const contentBtn = document.getElementById("contentBtn");
const content = document.querySelector("iframe");

const buttons = contentBtn.querySelectorAll("button");
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {

    content.src = e.target.getAttribute("data-index");
  });
});