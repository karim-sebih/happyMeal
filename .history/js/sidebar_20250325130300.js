const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar .toggler");


const collapsedSidebarHeight = "56px";

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})


const toggleMenu = (isMenuActive) => {
 sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` :c ; 
}

menuToggler.addEventListener("click", () =>{
    toggleMenu(sidebar.classList.toggle("menu-active"))
})