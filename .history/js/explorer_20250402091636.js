

document.addEventListener("DOMContentLoaded", async function () {
    const recettesContainer = document.querySelector(".recettes-container");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumberSpan = document.getElementById("page-number");
    const favoriteBtn = document.getElementById("favorite-btn");
    const modalTitle = document.getElementById("modal-title");
    const requestsList2 = document.getElementById("requests-list2");

    try {
        const response = await fetch("../json/data.json");
        const data = await response.json();
        const recettes = data.recettes;

        let currentPage = 1;
        const recipesPerPage = 5;
        const totalPages = Math.ceil(recettes.length / recipesPerPage);

        function displayRecipes(page) {
            recettesContainer.innerHTML = "";
            const start = (page - 1) * recipesPerPage;
            const end = start + recipesPerPage;
            const recipesToDisplay = recettes.slice(start, end);

            recipesToDisplay.forEach(recipe => {
                const recipeCard = document.createElement("div");
                recipeCard.className = "recipe-card";

                let imageSrc = "default.jpg";
                let imageAlt = "Image de la recette";

                if (typeof recipe.image === "object") {
                    imageSrc = recipe.image.src || "default.jpg";
                    imageAlt = recipe.image.alt || "Image de la recette";
                } else if (typeof recipe.image === "string") {
                    imageSrc = recipe.image;
                }

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
        recipe.ingredients.forEach(ing => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `ingredient-${ing.nom}`;

            const label = document.createElement("label");
            label.textContent = typeof ing === "object" ? `${ing.quantite} - ${ing.nom}` : ing;
            label.setAttribute("for", checkbox.id);

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
        checkFavoriteStatus(); // Vérifier si la recette est en favoris
    }

    document.addEventListener("click", function (event) {
        const modal = document.getElementById("recipeModal");
        if (event.target.classList.contains("close-btn") || event.target === modal) {
            modal.style.display = "none";
        }
    });

    function loadFavorites() {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    function updateFavoriteIcon(isFavorite) {
        favoriteBtn.style.color = isFavorite ? "red" : "black";
    }

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.includes(mealName));
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

    function displayStoredIngredients() {
        const storedIngredients = new Set(JSON.parse(localStorage.getItem("selectedIngredients")) || []);
        const ingredientListContainer = document.getElementById("stored-ingredients-list");
        ingredientListContainer.innerHTML = "";

        if (storedIngredients.size > 0) {
            storedIngredients.forEach(ingredient => {
                const li = document.createElement("li");
                li.textContent = ingredient;

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.classList.add("delete-btn");
                deleteBtn.addEventListener("click", function () {
                    storedIngredients.delete(ingredient);
                    localStorage.setItem("selectedIngredients", JSON.stringify([...storedIngredients]));
                    displayStoredIngredients();
                });

                li.appendChild(deleteBtn);
                ingredientListContainer.appendChild(li);
            });
        } else {
            ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
        }
    }

    document.getElementById("submit-list-btn").addEventListener("click", function () {
        localStorage.removeItem("selectedIngredients");
        displayStoredIngredients();
        alert("La liste a été soumise !");
    });

    displayStoredIngredients();
});
