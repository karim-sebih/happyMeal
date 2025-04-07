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


  <aside class="sidebar"> 
        <header class="sidebar-header">
            <a href="../index.html" class="header-logo">
                <img src="../assets/HappyMeal_logo-removebg-preview.png" alt="logo bg transparent">
            </a>
            <a href="../index.html">
                <h1>Happy Meal</h1>
            </a>
            <button class="toggler sidebar-toggler">
                <span class="material-symbols-rounded">chevron_left</span>
            </button>
            <button class="toggler menu-toggler">
                <span class="material-symbols-rounded">menu</span>
            </button>
        </header>
        <nav class="sidebar-nav">
            <ul class="nav-list primary-nav">
                <li class="nav-item">
                    <a href="./explorer.html" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">explore</span>
                        <span class="nav-label">Explorer</span>
                    </a>
                    <span class="nav-tooltip">Explorer</span>
                </li>
                <li class="nav-item">
                    <a href="./happymeal.html" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">favorite</span>
                        <span class="nav-label">Favoris</span>
                    </a>
                    <span class="nav-tooltip">Favoris</span>
                </li>
                <li class="nav-item">
                    <a href="./happymeal.html" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">shopping_cart</span>
                        <span class="nav-label">Liste des courses</span>
                    </a>
                    <span class="nav-tooltip">Liste des courses</span>
                </li>
                <li class="nav-item">
                    <a href="./calendrier.html" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">calendar_month</span>
                        <span class="nav-label">Menu de la semaine</span>
                    </a>
                    <span class="nav-tooltip">Menu de la semaine</span>
                </li>
            </ul>
            <ul class="nav-list secondary-nav">
                <li class="nav-item">
                    <a href="" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">account_circle</span>
                        <span class="nav-label">Login</span>
                    </a>
                    <span class="nav-tooltip">Login</span>
                </li>
                <li class="nav-item">
                    <a href="" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">logout</span>
                        <span class="nav-label">Logout</span>
                    </a>
                    <span class="nav-tooltip">Logout</span>
                </li>
            </ul>
        </nav>
    </aside>