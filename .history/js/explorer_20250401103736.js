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
        });}
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