const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar .toggler");
const menuToggler = document.querySelector(".menu-toggler");



const collapsedSidebarHeight = "56px";
const fullSideHeight = "calc(100vh -32px)";


sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
})


const toggleMenu = (isMenuActive) => {
    sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : collapsedSidebarHeight;
    menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
}

menuToggler.addEventListener("click", () => {
    toggleMenu(sidebar.classList.toggle("menu-active"))
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
        sidebar.style.height = fullSideHeight;
    } else {
        sidebar.classList.remove("collapsed");
        sidebar.style.height = "auto";
        toggleMenu(sidebar.classList.contains("menu-active"));
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const storedLikedRecipes = localStorage.getItem('likedRecipes');
    if (storedLikedRecipes) {
      likedRecipes = JSON.parse(storedLikedRecipes);
      updateLikedRecipes();
    }
  
    const storedShoppingList = localStorage.getItem('shoppingList');
    if (storedShoppingList) {
      shoppingList = JSON.parse(storedShoppingList);
    }
  
    // Lire le paramètre d'URL pour déterminer la vue initiale
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view === 'shopping-list') {
      showShoppingListPage();
    } else {
      renderLikedRecipes(); // Par défaut, afficher Favoris
    }
  });