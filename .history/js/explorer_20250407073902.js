let recipes = [];

document.addEventListener("DOMContentLoaded", async function () {
    const recettesContainer = document.querySelector(".recettes-container");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumberSpan = document.getElementById("page-number");

    try {
        const response = await fetch("../json/data.json");
        const data = await response.json();
        recipes = data.recettes;

        let currentPage = 1;
        const recipesPerPage = 5;
        const totalPages = Math.ceil(recipes.length / recipesPerPage);

        function displayRecipes(page) {
            recettesContainer.innerHTML = "";
            const start = (page - 1) * recipesPerPage;
            const end = start + recipesPerPage;
            const recipesToDisplay = recipes.slice(start, end);

            recipesToDisplay.forEach(recipe => {
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
                recettesContainer.appendChild(recipeCard);
            });
            pageNumberSpan.textContent = `Page ${page} / ${totalPages}`;
        }

        prevBtn.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                displayRecipes(currentPage);
            }
        });

        nextBtn.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                displayRecipes(currentPage);
            }
        });

        displayRecipes(currentPage);

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

// Le calendrier
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("presence-form");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    const messageDiv = document.getElementById("message");
    const requestsList = document.getElementById("requests-list");

    function loadRequests() {
        requestsList.innerHTML = "";
        const savedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
        savedEvents.forEach(event => {
            const date = event.start.split('T')[0];
            const time = event.start.split('T')[1]?.slice(0, 5) || "N/A"; // Extrait l'heure (HH:MM)
            const div = document.createElement("div");
            div.innerHTML = `<strong>${date} à ${time}</strong>: ${event.title}`;
            requestsList.appendChild(div);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const selectedDate = dateInput.value;
        const selectedTime = timeInput.value;
        const mealName = document.getElementById("modal-title").textContent;

        if (!selectedDate || !selectedTime) {
            messageDiv.textContent = "Veuillez choisir une date et une heure.";
            return;
        }

        let savedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
        const dateTime = `${selectedDate}T${selectedTime}:00`;
        const eventExists = savedEvents.some(event => event.start === dateTime && event.title === mealName);
        if (eventExists) {
            messageDiv.textContent = "Ce plat a déjà été ajouté à cette date et heure.";
            return;
        }

        const newEvent = {
            title: mealName,
            start: dateTime,
            id: Date.now().toString()
        };
        savedEvents.push(newEvent);
        localStorage.setItem("calendarEvents", JSON.stringify(savedEvents));
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
        });
    }

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.some(fav => fav.nom === mealName));
    }

    const observer = new MutationObserver(checkFavoriteStatus);
    observer.observe(modalTitle, { childList: true });
});

// Liste des courses
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const shoppingListElement = document.getElementById("shopping-list");
    if (shoppingListElement) {
        shoppingListElement.innerHTML = "";

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
        } else {
            shoppingListElement.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});

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

// Barre de recherche
document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search-bar");
    const suggestionBox = document.getElementById("suggestions");
    const resultsContainer = document.getElementById("search-results");
    const clearButton = document.getElementById("clear-search");

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
        suggestionBox.innerHTML = "";
        if (suggestions.length === 0) return;
        suggestions.forEach(suggestion => {
            const div = document.createElement("div");
            div.textContent = suggestion;
            div.classList.add("suggestion-item");
            div.addEventListener("click", () => {
                searchInput.value = suggestion;
                suggestionBox.innerHTML = "";
                displayResults(suggestion);
                clearButton.style.display = "block";
            });
            suggestionBox.appendChild(div);
        });
    }

    function displayResults(query) {
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

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            clearButton.style.display = "block";
            const suggestions = getSuggestions(query);
            showSuggestions(suggestions);
        } else {
            suggestionBox.innerHTML = "";
            resultsContainer.innerHTML = "";
            clearButton.style.display = "none";
        }
    });

    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        suggestionBox.innerHTML = "";
        resultsContainer.innerHTML = "";
        clearButton.style.display = "none";
    });

    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = "";
        }
    });
});
