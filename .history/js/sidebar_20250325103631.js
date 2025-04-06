const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebartoggler");

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})