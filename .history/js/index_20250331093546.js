let fetchedRecipes = [];

document.addEventListener("DOMContentLoaded", async function () {
    const principalContainer = document.querySelector(".Principal");
    const entreeContainer = document.querySelector(".entree");
    const dessertContainer = document.querySelector(".dessert");

    try {
        const response = await fetch("./json/data.json");
        const data = await response.json();
        fetchedRecipes = data.recettes;

        const categories = { "Plat principal": [], "Entrée": [], "Dessert": [] };
        
        fetchedRecipes.forEach(recipe => {
            if (categories[recipe.categorie]) {
                categories[recipe.categorie].push(recipe);
            }
        });

        function getRandomRecipes(arr, count = 4) {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
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
                    <button class="details-btn">Voir Détails</button>
                `;
                
                recipeCard.querySelector(".details-btn").addEventListener("click", function () {
                    openModal(recipe);
                });
                
                container.appendChild(recipeCard);
            });
        }

        displayRecipes(principalContainer, getRandomRecipes(categories["Plat principal"]));
        displayRecipes(entreeContainer, getRandomRecipes(categories["Entrée"]));
        displayRecipes(dessertContainer, getRandomRecipes(categories["Dessert"]));
    } catch (error) {
        console.error("Erreur lors du chargement des recettes :", error);
    }
});

function openModal(recipe) {
    const modal = document.getElementById("recipeModal");
    document.getElementById("modal-title").textContent = recipe.nom;
    document.getElementById("modal-image").src = recipe.image?.src || recipe.image || "default.jpg";
    document.getElementById("modal-time").textContent = recipe.temps_preparation;
    
    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach(ing => {
        const li = document.createElement("li");
        li.textContent = typeof ing === "object" ? `${ing.quantite} - ${ing.nom}` : ing;
        ingredientsList.appendChild(li);
    });
    
    const stepsList = document.getElementById("modal-steps");
    stepsList.innerHTML = "";
    recipe.etapes.forEach((etape, index) => {
        const li = document.createElement("li");
        li.textContent = `Étape ${index + 1} : ${etape}`;
        stepsList.appendChild(li);
    });

    generateIngredientList(recipe.nom);
    modal.style.display = "flex";
}

function generateIngredientList(recipeName) {
    const recipe = fetchedRecipes.find(r => r.nom === recipeName);
    if (!recipe) return;
    
    const ingredientsList = document.getElementById('ingredients');
    ingredientsList.innerHTML = '';

    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = `${ingredient.quantite} ${ingredient.nom}`;
        
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(` ${ingredient.quantite} ${ingredient.nom}`));
        ingredientsList.appendChild(li);
    });

    document.getElementById('page1').style.display = 'block';
    document.getElementById('page2').style.display = 'none';
}

function generateShoppingList() {
    const ingredients = document.querySelectorAll('#ingredients input:checked');
    const shoppingList = document.getElementById('shoppingList');
    shoppingList.innerHTML = '';

    ingredients.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.value;
        shoppingList.appendChild(li);
    });

    document.getElementById('page1').style.display = 'none';
    document.getElementById('page2').style.display = 'block';
}

function goBack() {
    document.getElementById('page2').style.display = 'none';
    document.getElementById('page1').style.display = 'block';
}