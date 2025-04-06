const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar .toggler");


const collapsedSidebar

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})


const toggleMenu = (isMenuActive) => {
 sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` :`` ; 
}

menuToggler.addEventListener("click", () =>{
    toggleMenu(sidebar.classList.toggle("menu-active"))
})