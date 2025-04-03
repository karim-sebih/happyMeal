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

        // Créer la checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `ingredient-${ing.nom}`;

        // Ajouter l'étiquette pour l'ingrédient
        const label = document.createElement("label");
        if (typeof ing === "object") {
            label.textContent = `${ing.quantite} - ${ing.nom}`;
        } else {
            label.textContent = ing;
        }
        label.setAttribute("for", checkbox.id);

        // Ajouter la checkbox et l'étiquette à l'élément de la liste
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

        // Vérification si le plat a déjà été ajouté à cette date
        let mealReminders = JSON.parse(localStorage.getItem("mealReminders")) || {};
        
        // Si la date a déjà un repas, vérifier si ce repas est déjà ajouté
        if (mealReminders[selectedDate] && mealReminders[selectedDate].includes(mealName)) {
            messageDiv.textContent = "Ce plat a déjà été ajouté à cette date.";
            return;  // Sortir de la fonction si le plat est déjà ajouté
        }

        // Si le plat n'est pas encore ajouté, on le rajoute
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
    const requestsList2 = document.getElementById("requests-list2");

    function loadFavorites() {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    function updateFavoriteIcon(isFavorite) {
        favoriteBtn.style.color = isFavorite ? "red" : "black";
    }

//Affiché les favoris (optionel juste pour savoir que sa marche)

    function displayFavorites() {
        const favorites = loadFavorites();
        requestsList2.innerHTML = "";
        if (favorites.length === 0) {
            requestsList2.innerHTML = "<p>Aucun plat en favoris.</p>";
        } else {
            favorites.forEach(meal => {
                const item = document.createElement("p");
                item.textContent = meal;
                requestsList2.appendChild(item);
            });
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
        displayFavorites(); // Met à jour l'affichage
    });

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.includes(mealName));
        displayFavorites(); // Met à jour l'affichage au chargement
    }

    const observer = new MutationObserver(checkFavoriteStatus);
    observer.observe(modalTitle, { childList: true });

    displayFavorites(); // Affiche les favoris au chargement
});


// Ajouté les ingrédients dans la liste
// Fonction pour afficher les ingrédients stockés avec un bouton de suppression
// Fonction pour afficher les ingrédients stockés avec un bouton de suppression
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];
    const ingredientListContainer = document.getElementById("stored-ingredients-list");
    ingredientListContainer.innerHTML = ""; // Effacer la liste avant de la remplir à nouveau

    if (storedIngredients.length > 0) {
        storedIngredients.forEach((ingredient, index) => {
            const li = document.createElement("li");
            li.textContent = ingredient;

            // Créer un bouton de suppression
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Supprimer";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", function () {
                // Supprimer l'ingrédient du localStorage
                storedIngredients.splice(index, 1); // Retirer l'ingrédient de la liste
                localStorage.setItem("selectedIngredients", JSON.stringify(storedIngredients)); // Sauvegarder la nouvelle liste

                // Supprimer la checkbox correspondante
                const checkboxToDelete = document.getElementById(`ingredient-checkbox-${index}`);
                if (checkboxToDelete) {
                    checkboxToDelete.checked = false; // Décocher la checkbox
                }

                // Mettre à jour l'affichage
                displayStoredIngredients();
            });

            // Ajouter le bouton de suppression à l'élément de la liste
            li.appendChild(deleteBtn);
            ingredientListContainer.appendChild(li);
        });
    } else {
        ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
    }
}

// Ajouter à la liste des ingrédients dans le localStorage
document.getElementById("add-to-list-btn").addEventListener("click", function () {
    // Récupérer toutes les checkboxes de la pop-up
    const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']:checked");
    const selectedIngredients = [];
    
    checkboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        if (label) {
            const ingredientName = label.textContent.split(' - ')[1];
            selectedIngredients.push(ingredientName);
        }
    });

    let currentIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];
    currentIngredients = [...currentIngredients, ...selectedIngredients];
    localStorage.setItem("selectedIngredients", JSON.stringify(currentIngredients));

    alert("Ingrédients ajoutés à la liste !");
    displayStoredIngredients();  // Mise à jour de l'affichage
});


// Appeler cette fonction au chargement de la page pour afficher les ingrédients déjà stockés
document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});

// Fonction pour afficher les ingrédients stockés avec un bouton de suppression
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];
    const ingredientListContainer = document.getElementById("stored-ingredients-list");
    ingredientListContainer.innerHTML = ""; // Effacer la liste avant de la remplir à nouveau

    if (storedIngredients.length > 0) {
        storedIngredients.forEach((ingredient, index) => {
            const li = document.createElement("li");
            li.textContent = ingredient;

            // Créer un bouton de suppression
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Supprimer";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", function () {
                storedIngredients.splice(index, 1);  // Supprimer l'ingrédient
                localStorage.setItem("selectedIngredients", JSON.stringify(storedIngredients));
                displayStoredIngredients();  // Mise à jour de l'affichage
            });
            

            // Ajouter le bouton de suppression à l'élément de la liste
            li.appendChild(deleteBtn);
            ingredientListContainer.appendChild(li);
        });
    } else {
        ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
    }
}



// Fonction pour soumettre la liste
document.getElementById("submit-list-btn").addEventListener("click", function () {
    const storedIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];

    if (storedIngredients.length > 0) {
        // Enregistrer la liste dans localStorage ou effectuer une autre action
        alert("La liste a été soumise !");

        // Effacer la liste après soumission
        localStorage.removeItem("selectedIngredients");

        // Réinitialiser les checkboxes dans le modal
        const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false; // Décocher toutes les checkboxes
        });

        // Mettre à jour l'affichage
        displayStoredIngredients();
    } else {
        alert("Aucun ingrédient à soumettre.");
    }
});

// Appeler cette fonction au chargement de la page pour afficher les ingrédients déjà stockés
document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});




//Barre de Recherche
document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search-bar");
    const searchBtn = document.getElementById("search-btn");
    const suggestionBox = document.getElementById("suggestions");
    const resultsContainer = document.getElementById("search-results");

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

        return Array.from(suggestions).slice(0, 5); // Max 5 suggestions
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
                displayResults(suggestion); // Lancer directement la recherche
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
        if (query.length > 1) {
            const suggestions = getSuggestions(query);
            showSuggestions(suggestions);
        } else {
            suggestionBox.innerHTML = "";
        }
    });

    // Gérer le clic sur le bouton de recherche
    searchBtn.addEventListener("click", function () {
        const query = searchInput.value.trim();
        if (query) {
            displayResults(query);
        }
    });

    // Cacher la liste des suggestions si on clique ailleurs
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = "";
        }
    });

    // Gestion des pop-ups de détail (si tu veux ouvrir la pop-up en cliquant sur "Voir Détails")
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("details-btn")) {
            const recipe = JSON.parse(decodeURIComponent(event.target.dataset.recipe));
            openModal(recipe);
        }
    });
});

//supprimer la recherche document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("search-bar");
    const suggestionBox = document.getElementById("suggestions");
    const clearButton = document.getElementById("clear-search");

    let recipes = [];

    // Charger les recettes
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

    // Fonction pour obtenir les suggestions
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
            });

            suggestionBox.appendChild(div);
        });
    }

    // Écouteur de saisie
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            clearButton.style.display = "block"; // Afficher le bouton de suppression
            const suggestions = getSuggestions(query);
            showSuggestions(suggestions);
        } else {
            suggestionBox.innerHTML = "";
            clearButton.style.display = "none"; // Cacher le bouton de suppression
        }
    });

    // Effacer la recherche et masquer les suggestions
    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        suggestionBox.innerHTML = "";
        clearButton.style.display = "none"; // Cacher le bouton après suppression
    });

    // Cacher la liste des suggestions si on clique ailleurs
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = "";
        }
    });
});
