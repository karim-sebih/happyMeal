document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    try {
        const response = await fetch("./data.json");
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
        function getRandomRecipes(arr) {
            return arr.sort(() => 0.5 - Math.random()).slice(0, 4);
        }

        function displayRecipes(container, recipes) {
            container.innerHTML = "";
            recipes.forEach(recipe => {
                const recipeCard = document.createElement("div");
                recipeCard.className = "recipe-card";
                recipeCard.innerHTML = `
                    <h3>${recipe.nom}</h3>
                    <img src="${recipe.image}" alt="${recipe.nom}">
                    <p><strong>Temps :</strong> ${recipe.temps_preparation}</p>
                    <button class="details-btn" data-recipe='${JSON.stringify(recipe)}'>Voir Détails</button>
                `;
                container.appendChild(recipeCard);
            });
        }

        displayRecipes(principalContainer, getRandomRecipes(categories["Plat principal"]));
        displayRecipes(entreeContainer, getRandomRecipes(categories["Entrée"]));
        displayRecipes(dessertContainer, getRandomRecipes(categories["Dessert"]));

        // Gestion de la pop-up
        document.addEventListener("click", function (event) {
            if (event.target.classList.contains("details-btn")) {
                const recipe = JSON.parse(event.target.dataset.recipe);
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
    document.getElementById("modal-image").src = recipe.image;
    document.getElementById("modal-time").textContent = recipe.temps_preparation;

    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        li.textContent = `${ing.quantite} - ${ing.nom}`;
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
