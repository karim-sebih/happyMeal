document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    try {
        const response = await fetch("./json/data.json");
        const data = await response.json();
        const recettes = data.recettes;

        const categories = { "Plat principal": [], "Entrée": [], "Dessert": [] };

        // Trier les recettes par catégorie
        recettes.forEach(recipe => {
            if (categories[recipe.categorie]) {
                categories[recipe.categorie].push(recipe);
            }
        });

        // Mélanger et sélectionner 4 recettes aléatoires par catégorie
        // Mélanger et sélectionner 4 recettes aléatoires par catégorie sans doublons
        function getRandomRecipes(arr, count = 4) {
            const shuffled = [...arr].sort(() => 0.5 - Math.random()); // Mélange les recettes
            const selected = new Set(); // Utilisation d'un Set pour éviter les doublons
            const result = [];

            for (let recipe of shuffled) {
                if (!selected.has(recipe.nom)) { // Vérifie si le nom de la recette est déjà pris
                    selected.add(recipe.nom);
                    result.push(recipe);
                }
                if (result.length === count) break; // Stopper une fois qu'on a le bon nombre
            }

            return result;
        }

        function displayRecipes(container, recipes) {
            container.innerHTML = "";
            recipes.forEach(recipe => {
                const recipeCard = document.createElement("div");
                recipeCard.className = "recipe-card";

                // Vérifier si l'image est un objet ou une simple URL
                const imageSrc = recipe.image?.src || recipe.image || "default.jpg";
                const imageAlt = recipe.image?.alt || "Image de la recette";

                recipeCard.innerHTML = `
                    <h3>${recipe.nom}</h3>
                    <img src="${imageSrc}" alt="${imageAlt}">
                    <p><strong>Temps :</strong> ${recipe.temps_preparation}</p>
<button class="details-btn" data-recipe="${encodeURIComponent(JSON.stringify(recipe))}">Voir Détails</button>
                `;
                container.appendChild(recipeCard);
            });
        }

        displayRecipes(principalContainer, getRandomRecipes(categories["Plat principal"]));
        displayRecipes(entreeContainer, getRandomRecipes(categories["Entrée"]));
        displayRecipes(dessertContainer, getRandomRecipes(categories["Dessert"]));

        console.log(`Nombre total de recettes chargées : ${recettes.length}`);

        // Gestion de la pop-up
        document.addEventListener("click", function (event) {
            if (event.target.classList.contains("details-btn")) {
                const recipe = JSON.parse(decodeURIComponent(event.target.dataset.recipe));
                openModal(recipe);
            }
        });

    } catch (error) {
        console.error("Erreur lors du chargement des recettes :", error);
    }
});

// Fonction pour ouvrir la pop-up
function openModal(recipe) {
    const modal = document.getElementById("recipeModal");
    document.getElementById("modal-title").textContent = recipe.nom;

    // Vérification de l'image
    const modalImage = document.getElementById("modal-image");
    modalImage.src = recipe.image?.src || recipe.image || "default.jpg";
    modalImage.alt = recipe.image?.alt || "Image de la recette";

    document.getElementById("modal-time").textContent = recipe.temps_preparation;

    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        if (typeof ing === "object") {
            li.textContent = `${ing.quantite} - ${ing.nom}`;
        } else {
            li.textContent = ing;
        }
        ingredientsList.appendChild(li);
    });
    

    const stepsList = document.getElementById("modal-steps");
    stepsList.innerHTML = "";
    recipe.etapes.forEach((etape, index) => {
        const li = document.createElement("li");
        li.textContent = `Étape ${index + 1} : ${etape}`;
        stepsList.appendChild(li);
    });

    modal.style.display = "flex";
}

// Fermer la pop-up
document.addEventListener("click", function (event) {
    const modal = document.getElementById("recipeModal");
    if (event.target.classList.contains("close-btn") || event.target === modal) {
        modal.style.display = "none";
    }
});


// Le calendrier

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("presence-form");
    const dateInput = document.getElementById("date");
    const messageDiv = document.getElementById("message");
    const requestsList = document.getElementById("requests-list");

    function loadRequests() {
        requestsList.innerHTML = "";
        const requests = JSON.parse(localStorage.getItem("mealReminders")) || {};
        
        for (const [date, meals] of Object.entries(requests)) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${date}</strong>: ${meals.join(", ")}`;
            requestsList.appendChild(div);
        }
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const selectedDate = dateInput.value;
        const mealName = document.getElementById("modal-title").textContent;

        if (!selectedDate) {
            messageDiv.textContent = "Veuillez choisir une date.";
            return;
        }

        let mealReminders = JSON.parse(localStorage.getItem("mealReminders")) || {};
        
        if (!mealReminders[selectedDate]) {
            mealReminders[selectedDate] = [];
        }
        mealReminders[selectedDate].push(mealName);

        localStorage.setItem("mealReminders", JSON.stringify(mealReminders));

        messageDiv.textContent = "Plat ajouté au calendrier !";
        loadRequests();
    });

    loadRequests();
});

// Favoris 

document.addEventListener("DOMContentLoaded", function () {
    const favoriteBtn = document.getElementById("favorite-btn");
    const modalTitle = document.getElementById("modal-title");
    
    function loadFavorites() {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    function updateFavoriteIcon(isFavorite) {
        if (isFavorite) {
            favoriteBtn.style.color = "red"; // Indique que c'est en favoris
        } else {
            favoriteBtn.style.color = "black"; // Normal
        }
    }

    favoriteBtn.addEventListener("click", function () {
        let favorites = loadFavorites();
        const mealName = modalTitle.textContent;

        const index = favorites.indexOf(mealName);
        if (index === -1) {
            favorites.push(mealName);
        } else {
            favorites.splice(index, 1);
        }

        saveFavorites(favorites);
        updateFavoriteIcon(index === -1);
    });

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.includes(mealName));
    }

    // Vérifier si la recette est déjà en favoris à chaque ouverture du modal
    const observer = new MutationObserver(checkFavoriteStatus);
    observer.observe(modalTitle, { childList: true });

});
