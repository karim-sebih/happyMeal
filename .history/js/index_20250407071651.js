// Définir recipes comme une variable globale
let recipes = [];

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("./json/data.json");
        const data = await response.json();
        recipes = data.recettes;

        console.log(`Nombre total de recettes chargées : ${recipes.length}`);

    } catch (error) {
        console.error("Erreur lors du chargement des recettes :", error);
    }
});

// Fonction pour ouvrir la pop-up
function openModal(recipe) {
    const modal = document.getElementById("recipeModal");
    document.getElementById("modal-title").textContent = recipe.nom;
    const modalImage = document.getElementById("modal-image");
    modalImage.src = recipe.image?.src || recipe.image || "default.jpg";
    modalImage.alt = recipe.image?.alt || "Image de la recette";
    document.getElementById("modal-time").textContent = recipe.temps_preparation;

    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    const storedShoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

    recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `ingredient-${ing.nom}`;
        checkbox.dataset.name = ing.nom;
        const label = document.createElement("label");
        if (typeof ing === "object") {
            label.textContent = `${ing.quantite} - ${ing.nom}`;
        } else {
            label.textContent = ing;
        }
        label.setAttribute("for", checkbox.id);
        if (storedShoppingList.includes(ing.nom)) {
            checkbox.checked = true;
        }
        checkbox.addEventListener("change", function () {
            let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
            const ingredientName = this.dataset.name;
            if (this.checked) {
                if (!shoppingList.includes(ingredientName)) {
                    shoppingList.push(ingredientName);
                }
            } else {
                shoppingList = shoppingList.filter(item => item !== ingredientName);
            }
            localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
            displayStoredIngredients();
        });
        li.appendChild(checkbox);
        li.appendChild(label);
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
    displayStoredIngredients();
}

// Fermer la pop-up
document.addEventListener("click", function (event) {
    const modal = document.getElementById("recipeModal");
    if (event.target.classList.contains("close-btn") || event.target === modal) {
        modal.style.display = "none";
    }
});

// Favoris (utilise "likedRecipes")
document.addEventListener("DOMContentLoaded", function () {
    const favoriteBtn = document.getElementById("favorite-btn");
    const modalTitle = document.getElementById("modal-title");
    const likedRecipesContainer = document.getElementById("liked-recipes");

    function loadFavorites() {
        return JSON.parse(localStorage.getItem("likedRecipes")) || [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem("likedRecipes", JSON.stringify(favorites));
    }

    function updateFavoriteIcon(isFavorite) {
        if (favoriteBtn) {
            favoriteBtn.style.color = isFavorite ? "red" : "black";
        }
    }

    function displayFavorites() {
        const favorites = loadFavorites();
        likedRecipesContainer.innerHTML = "";
        if (favorites.length > 0) {
            likedRecipesContainer.style.display = "block";
            favorites.forEach(recipe => {
                const recipeCard = document.createElement("div");
                recipeCard.className = "recipe-card";
                const imageSrc = recipe.image?.src || recipe.image || "default.jpg";
                const imageAlt = recipe.image?.alt || "Image de la recette";
                recipeCard.innerHTML = `
                    <h3>${recipe.nom}</h3>
                    <img src="${imageSrc}" alt="${imageAlt}">
                    <p><strong>Temps :</strong> ${recipe.temps_preparation}</p>
                    <button class="details-btn" data-recipe="${encodeURIComponent(JSON.stringify(recipe))}">Voir Détails</button>
                `;
                likedRecipesContainer.appendChild(recipeCard);
            });
        } else {
            likedRecipesContainer.style.display = "none";
        }
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", function () {
            let favorites = loadFavorites();
            const mealName = modalTitle.textContent;
            const recipe = recipes.find(r => r.nom === mealName);
            const index = favorites.findIndex(fav => fav.nom === mealName);

            if (index === -1 && recipe) {
                favorites.push(recipe);
            } else {
                favorites.splice(index, 1);
            }

            saveFavorites(favorites);
            updateFavoriteIcon(index === -1);
            displayFavorites();
        });
    }

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.some(fav => fav.nom === mealName));
    }

    const observer = new MutationObserver(checkFavoriteStatus);
    observer.observe(modalTitle, { childList: true });

    // Afficher les favoris au chargement
    displayFavorites();

    // Événement pour les boutons "Voir Détails"
    likedRecipesContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("details-btn")) {
            const recipe = JSON.parse(decodeURIComponent(event.target.dataset.recipe));
            openModal(recipe);
        }
    });
});

// Liste des courses (utilise "shoppingList")
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const shoppingListElement = document.getElementById("shopping-list");
    const shoppingListSection = document.getElementById("shopping-list-section");
    if (shoppingListElement && shoppingListSection) {
        shoppingListElement.innerHTML = "";
        shoppingListSection.style.display = storedIngredients.length > 0 ? "block" : "none";

        if (storedIngredients.length > 0) {
            storedIngredients.forEach((ingredient, index) => {
                const li = document.createElement("li");
                li.textContent = ingredient;
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "🗑️";
                deleteBtn.classList.add("delete-btn");
                deleteBtn.addEventListener("click", function () {
                    storedIngredients.splice(index, 1);
                    localStorage.setItem("shoppingList", JSON.stringify(storedIngredients));
                    displayStoredIngredients();
                    const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']");
                    checkboxes.forEach(checkbox => {
                        if (checkbox.dataset.name === ingredient) {
                            checkbox.checked = false;
                        }
                    });
                });
                li.appendChild(deleteBtn);
                shoppingListElement.appendChild(li);
            });
        }
    }
}

// Afficher la liste au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});

// Soumettre la liste
document.getElementById("submit-list-btn").addEventListener("click", function () {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    if (storedIngredients.length > 0) {
        alert("La liste a été soumise !");
        const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        displayStoredIngredients();
    } else {
        alert("Aucun ingrédient à soumettre.");
    }
});