
document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search-bar");
    const searchBtn = document.getElementById("search-btn");
    const suggestionBox = document.getElementById("suggestions");
    const resultsContainer = document.getElementById("search-results");
    const clearButton = document.getElementById("clear-search");

    let recipes = [];

    // Charger les recettes depuis le fichier JSON
    async function loadRecipes() {
        try {
            const response = await fetch("./json/data.json");
            const data = await response.json();
            recipes = data.recettes;
        } catch (error) {
            console.error("Erreur de chargement des recettes :", error);
        }
    }

    await loadRecipes();

    // Fonction pour générer les suggestions
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

    // Afficher les suggestions
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
                clearButton.style.display = "block"; // Afficher le bouton X après la sélection
            });

            suggestionBox.appendChild(div);
        });
    }

    // Fonction pour afficher les résultats
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

    // Gérer la saisie dans la barre de recherche
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            clearButton.style.display = "block"; // Afficher le bouton de suppression
            const suggestions = getSuggestions(query);
            showSuggestions(suggestions);
        } else {
            suggestionBox.innerHTML = "";
            resultsContainer.innerHTML = "";
            clearButton.style.display = "none"; // Cacher le bouton de suppression
        }
    });

    // Gérer le clic sur le bouton de recherche
    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            const query = searchInput.value.trim();
            if (query) {
                displayResults(query);
            }
        });
    }

    // Effacer la recherche et masquer les suggestions/résultats
    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        suggestionBox.innerHTML = "";
        resultsContainer.innerHTML = "";
        clearButton.style.display = "none"; // Cacher le bouton après suppression
    });

    // Cacher la liste des suggestions si on clique ailleurs
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = "";
        }
    });

    // Gestion des pop-ups de détail
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("details-btn")) {
            const recipe = JSON.parse(decodeURIComponent(event.target.dataset.recipe));
            openModal(recipe);
        }
    });
});
