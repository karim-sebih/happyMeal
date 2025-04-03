const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".side.toggler");

sidebarToggler.addEventListener("click", () => {
    alert("ok");
    sidebar.classList.toggle("collapsed");
})