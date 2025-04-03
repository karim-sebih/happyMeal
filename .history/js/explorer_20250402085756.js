document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    try {
        const response = await fetch("../json/data.json");
        const data = await response.json();
        const recettes = data.recettes;

        const categories = { "Plat principal": [], "Entrée": [], "Dessert": [] };

        // Trier les recettes par catégorie
        recettes.forEach(recipe => {
            if (categories[recipe.categorie]) {
                categories[recipe.categorie].push(recipe);
            }
        });

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

        displayRecipes(principalContainer, categories["Plat principal"]);
        displayRecipes(entreeContainer, categories["Entrée"]);
        displayRecipes(dessertContainer, categories["Dessert"]);

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




//Paginati