const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar > .toggler");

sidebarToggler.addEventListener("click", () => {
    alert("ok")
    sidebar.classList.toggle("collapsed");
})