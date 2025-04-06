// Définir recipes comme une variable globale
let recipes = [];

document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    // Charger les recettes
    try {
        const response = await fetch("./json/data.json");
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();
        recipes = data.recettes;

        const categories = { "Plat principal": [], "Entrée": [], "Dessert": [] };

        recipes.forEach(recipe => {
            if (categories[recipe.categorie]) {
                categories[recipe.categorie].push(recipe);
            }
        });

        function getRandomRecipes(arr, count = 4) {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            const selected = new Set();
            const result = [];
            for (let recipe of shuffled) {
                if (!selected.has(recipe.nom)) {
                    selected.add(recipe.nom);
                    result.push(recipe);
                }
                if (result.length === count) break;
            }
            return result;
        }

        function displayRecipes(container, recipes) {
            if (!container) return;
            container.innerHTML = "";
            recipes.forEach(recipe => {
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
                container.appendChild(recipeCard);
            });
        }

        displayRecipes(principalContainer, getRandomRecipes(categories["Plat principal"]));
        displayRecipes(entreeContainer, getRandomRecipes(categories["Entrée"]));
        displayRecipes(dessertContainer, getRandomRecipes(categories["Dessert"]));

        console.log(`Nombre total de recettes chargées : ${recipes.length}`);

        document.addEventListener("click", function (event) {
            if (event.target.classList.contains("details-btn")) {
                const recipe = JSON.parse(decodeURIComponent(event.target.dataset.recipe));
                openModal(recipe);
            }
        });

    } catch (error) {
        console.error("Erreur lors du chargement des recettes :", error);
    }

    // Favoris (utilise "likedRecipes")
    const favoriteBtn = document.getElementById("favorite-btn");
    const modalTitle = document.getElementById("modal-title");

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

    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", function () {
            let favorites = loadFavorites();
            const mealName = modalTitle?.textContent || "";
            const recipe = recipes.find(r => r.nom === mealName);
            const index = favorites.findIndex(fav => fav.nom === mealName);

            if (index === -1 && recipe) {
                favorites.push(recipe);
            } else {
                favorites.splice(index, 1);
            }

            saveFavorites(favorites);
            updateFavoriteIcon(index === -1);
        });
    }

    function checkFavoriteStatus() {
        const mealName = modalTitle?.textContent || "";
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.some(fav => fav.nom === mealName));
    }

    if (modalTitle) {
        const observer = new MutationObserver(checkFavoriteStatus);
        observer.observe(modalTitle, { childList: true });
    }

    // Liste des courses (utilise "shoppingList")
    function displayStoredIngredients() {
        const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
        const ingredientListContainer = document.getElementById("stored-ingredients-list");
        if (ingredientListContainer) {
            ingredientListContainer.innerHTML = "";

            if (storedIngredients.length > 0) {
                storedIngredients.forEach((ingredient, index) => {
                    const li = document.createElement("li");
                    li.textContent = ingredient;
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Supprimer";
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
                    ingredientListContainer.appendChild(li);
                });
            } else {
                ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
            }
        }
    }

    const addToListBtn = document.getElementById("add-to-list-btn");
    if (addToListBtn) {
        addToListBtn.addEventListener("click", function () {
            const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']:checked");
            let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
            const newIngredients = [];

            checkboxes.forEach(checkbox => {
                const ingredientName = checkbox.dataset.name;
                if (!shoppingList.includes(ingredientName)) {
                    newIngredients.push(ingredientName);
                }
            });

            if (newIngredients.length > 0) {
                shoppingList = [...shoppingList, ...newIngredients];
                localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
                alert("Ingrédients ajoutés à la liste !");
                displayStoredIngredients();
            }
        });
    }

    displayStoredIngredients();

    const submitListBtn = document.getElementById("submit-list-btn");
    if (submitListBtn) {
        submitListBtn.addEventListener("click", function () {
            const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
            if (storedIngredients.length > 0) {
                alert("La liste a été soumise !");
                localStorage.removeItem("shoppingList");
                const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                displayStoredIngredients();
            } else {
                alert("Aucun ingrédient à soumettre.");
            }
        });
    }

    // Barre de recherche
    const searchInput = document.getElementById("search-bar");
    const searchBtn = document.getElementById("search-btn");
    const suggestionBox = document.getElementById("suggestions");
    const resultsContainer = document.getElementById("search-results");
    const clearButton = document.getElementById("clear-search");

    async function loadRecipes() {
        try {
            const response = await fetch("./json/data.json");
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            recipes = data.recettes;
        } catch (error) {
            console.error("Erreur de chargement des recettes :", error);
        }
    }

    await loadRecipes();

    function getSuggestions(query) {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        const suggestions = new Set();
        recipes.forEach(recipe => {
            if (recipe.nom.toLowerCase().includes(lowerQuery)) {
                suggestions.add(recipe.nom);
            }
            recipe.ingredients.forEach(ing => {
                if (typeof ing === "object" && ing.nom.toLowerCase().includes(lowerQuery)) {
                    suggestions.add(recipe.nom);
                } else if (typeof ing === "string" && ing.toLowerCase().includes(lowerQuery)) {
                    suggestions.add(recipe.nom);
                }
            });
        });
        return Array.from(suggestions).slice(0, 5);
    }

    function showSuggestions(suggestions) {
        if (!suggestionBox) return;
        suggestionBox.innerHTML = "";
        if (suggestions.length === 0) return;
        suggestions.forEach(suggestion => {
            const div = document.createElement("div");
            div.textContent = suggestion;
            div.classList.add("suggestion-item");
            div.addEventListener("click", () => {
                if (searchInput) searchInput.value = suggestion;
                suggestionBox.innerHTML = "";
                displayResults(suggestion);
                if (clearButton) clearButton.style.display = "block";
            });
            suggestionBox.appendChild(div);
        });
    }

    function displayResults(query) {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = "";
        const lowerQuery = query.toLowerCase();
        const filteredRecipes = recipes.filter(recipe =>
            recipe.nom.toLowerCase().includes(lowerQuery) ||
            recipe.ingredients.some(ing =>
                (typeof ing === "object" ? ing.nom : ing).toLowerCase().includes(lowerQuery)
            )
        );

        if (filteredRecipes.length === 0) {
            resultsContainer.innerHTML = "<p>Aucune recette trouvée.</p>";
            return;
        }

        filteredRecipes.forEach(recipe => {
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
            resultsContainer.appendChild(recipeCard);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                if (clearButton) clearButton.style.display = "block";
                const suggestions = getSuggestions(query);
                showSuggestions(suggestions);
            } else {
                if (suggestionBox) suggestionBox.innerHTML = "";
                if (resultsContainer) resultsContainer.innerHTML = "";
                if (clearButton) clearButton.style.display = "none";
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            const query = searchInput?.value.trim() || "";
            if (query) {
                displayResults(query);
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            if (suggestionBox) suggestionBox.innerHTML = "";
            if (resultsContainer) resultsContainer.innerHTML = "";
            clearButton.style.display = "none";
        });
    }

    document.addEventListener("click", (event) => {
        if (searchInput && suggestionBox && !searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = "";
        }
    });
});

// Fonction pour ouvrir la pop-up
function openModal(recipe) {
    const modal = document.getElementById("recipeModal");
    if (!modal) return;
    const modalTitle = document.getElementById("modal-title");
    const modalImage = document.getElementById("modal-image");
    const modalTime = document.getElementById("modal-time");

    if (modalTitle) modalTitle.textContent = recipe.nom;
    if (modalImage) {
        modalImage.src = recipe.image?.src || recipe.image || "default.jpg";
        modalImage.alt = recipe.image?.alt || "Image de la recette";
    }
    if (modalTime) modalTime.textContent = recipe.temps_preparation;

    const ingredientsList = document.getElementById("modal-ingredients");
    if (ingredientsList) {
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
    }

    const stepsList = document.getElementById("modal-steps");
    if (stepsList) {
        stepsList.innerHTML = "";
        recipe.etapes.forEach((etape, index) => {
            const li = document.createElement("li");
            li.textContent = `Étape ${index + 1} : ${etape}`;
            stepsList.appendChild(li);
        });
    }

    modal.style.display = "flex";
    displayStoredIngredients();
}

// Fermer la pop-up
document.addEventListener("click", function (event) {
    const modal = document.getElementById("recipeModal");
    if (modal && (event.target.classList.contains("close-btn") || event.target === modal)) {
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
        if (!requestsList) return;
        requestsList.innerHTML = "";
        const requests = JSON.parse(localStorage.getItem("mealReminders")) || {};
        for (const [date, meals] of Object.entries(requests)) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${date}</strong>: ${meals.join(", ")}`;
            requestsList.appendChild(div);
        }
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const selectedDate = dateInput?.value || "";
            const modalTitle = document.getElementById("modal-title");
            const mealName = modalTitle?.textContent || "";

            if (!selectedDate) {
                if (messageDiv) messageDiv.textContent = "Veuillez choisir une date.";
                return;
            }

            let mealReminders = JSON.parse(localStorage.getItem("mealReminders")) || {};
            if (mealReminders[selectedDate] && mealReminders[selectedDate].includes(mealName)) {
                if (messageDiv) messageDiv.textContent = "Ce plat a déjà été ajouté à cette date.";
                return;
            }

            if (!mealReminders[selectedDate]) {
                mealReminders[selectedDate] = [];
            }
            mealReminders[selectedDate].push(mealName);

            localStorage.setItem("mealReminders", JSON.stringify(mealReminders));
            if (messageDiv) messageDiv.textContent = "Plat ajouté au calendrier !";
            loadRequests();
        });
    }

    loadRequests();
});