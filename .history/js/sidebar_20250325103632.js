const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sitoggler");

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})