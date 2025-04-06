// Définir recipes comme une variable globale
let recipes = [];

document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    try {
        const response = await fetch("./json/data.json");
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

// Liste des courses
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const shoppingListElement = document.getElementById("shopping-list");
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

document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});

// Soumettre la liste (optionnel)
document.getElementById("submit-list-btn").addEventListener("click", function () {
    const storedIngredients = JSON.parse(localStorage.getItem("shoppingList")) || [];
    if (storedIngredients.length > 0) {
        alert("La liste a été soumise !");
    } else {
        alert("Aucun ingrédient à soumettre.");
    }
});

// Autres parties du code (calendrier, favoris, barre de recherche) restent inchangées