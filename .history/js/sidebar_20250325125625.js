const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar .toggler");

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})


const toggleMenu = (isMenuActive) => {
 sidebar.style.height = isMenuActive
}

menuToggler.addEventListener("click", () =>{
    toggleMenu(sidebar.classList.toggle("menu-active"))
})