const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sideba.toggler");

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})