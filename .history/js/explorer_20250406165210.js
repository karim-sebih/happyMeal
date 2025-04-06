document.addEventListener("DOMContentLoaded", async function () {
    const recettesContainer = document.querySelector(".recettes-container");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumberSpan = document.getElementById("page-number");

    try {
        const response = await fetch("../json/data.json");
        if (!response.ok) throw new Error("Erreur lors du chargement des recettes");
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
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
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
        recettesContainer.innerHTML = "<p>Erreur lors du chargement des recettes.</p>";
    }
});

// Fonction pour ouvrir la modale
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
        label.textContent = typeof ing === "object" ? `${ing.quantite} - ${ing.nom}` : ing;
        label.setAttribute("for", checkbox.id);
        if (storedShoppingList.includes(ing.nom)) {
            checkbox.checked = true;
        }
        checkbox.addEventListener("change", function () {
            let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
            const ingredientName = this.dataset.name;
            if (this.checked) {
                if (!shoppingList.includes(ingredientName)) shoppingList.push(ingredientName);
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

// Fermer la modale
document.addEventListener("click", function (event) {
    const modal = document.getElementById("recipeModal");
    if (event.target.classList.contains("close-btn") || event.target === modal) {
        modal.style.display = "none";
    }
});

// Calendrier
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
        if (mealReminders[selectedDate]?.includes(mealName)) {
            messageDiv.textContent = "Ce plat a déjà été ajouté à cette date.";
            return;
        }

        if (!mealReminders[selectedDate]) mealReminders[selectedDate] = [];
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

    function displayFavorites() {
        const favorites = loadFavorites();
        requestsList2.innerHTML = favorites.length === 0 ? "<p>Aucun plat en favoris.</p>" : "";
        favorites.forEach(meal => {
            const item = document.createElement("p");
            item.textContent = meal;
            requestsList2.appendChild(item);
        });
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
        displayFavorites();
    });

    function checkFavoriteStatus() {
        const mealName = modalTitle.textContent;
        const favorites = loadFavorites();
        updateFavoriteIcon(favorites.includes(mealName));
        displayFavorites();
    }

    const observer = new MutationObserver(checkFavoriteStatus);
    observer.observe(modalTitle, { childList: true });

    displayFavorites();
});

// Liste des courses
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const ingredientListContainer = document.getElementById("stored-ingredients-list");
    ingredientListContainer.innerHTML = "";

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
                    if (checkbox.dataset.name === ingredient) checkbox.checked = false;
                });
            });
            li.appendChild(deleteBtn);
            ingredientListContainer.appendChild(li);
        });
    } else {
        ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
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
        checkboxes.forEach(checkbox => checkbox.checked = false);
        displayStoredIngredients();
    } else {
        alert("Aucun ingrédient à soumettre.");
    }
});