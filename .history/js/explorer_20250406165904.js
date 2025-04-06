document.addEventListener("DOMContentLoaded", async function () {
    const recettesContainer = document.querySelector(".recettes-container");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumberSpan = document.getElementById("page-number");
    const submitListBtn = document.getElementById("submit-list-btn");

    // Chargement des recettes
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

    // Fermer la pop-up
    document.addEventListener("click", function (event) {
        const modal = document.getElementById("recipeModal");
        if (event.target.classList.contains("close-btn") || event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Liste des courses
    function displayStoredIngredients() {
        const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
        const ingredientListContainer = document.getElementById("stored-ingredients-list");
        if (!ingredientListContainer) return; // Vérification pour éviter l'erreur
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

    displayStoredIngredients();

    if (submitListBtn) {
        submitListBtn.addEventListener("click", function () {
            const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
            if (storedIngredients.length > 0) {
                alert("La liste a été soumise !");
                localStorage.removeItem("shoppingList");
                const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']");
                checkboxes.forEach(checkbox => checkbox.checked = false);
                displayStoredIngredients();
            } else {
                alert("Aucun ingrédient à soumettre.");
            }
        });
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