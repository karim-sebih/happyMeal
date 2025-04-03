const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".s.toggler");

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})