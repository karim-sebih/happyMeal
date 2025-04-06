// ================= GLOBAL VARIABLES =================
let fetchedRecipes = [];
let likedRecipes = [];
let shoppingList = [];
let activeRecipe = null;

// ================= DATA FETCHING AND INITIALIZATION =================
fetch('../json/data.json') // Ajuster selon la structure réelle des dossiers
  .then(response => {
    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    fetchedRecipes = data.recettes;
    renderRecipes(fetchedRecipes);
    createCategoryFilters(fetchedRecipes);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// ================= CATEGORY FILTER MANAGEMENT =================
function createCategoryFilters(recipes) {
    const filterContainer = document.getElementById('filter-container');
    if (!filterContainer) return;

    const categories = [...new Set(recipes.map(recipe => recipe.categorie))];
    filterContainer.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.onclick = () => renderRecipes(recipes.filter(recipe => recipe.categorie === category), false);
        filterContainer.appendChild(button);
    });

    const showAllButton = document.createElement('button');
    showAllButton.textContent = 'Recettes';
    showAllButton.onclick = () => renderRecipes(recipes, false);
    filterContainer.appendChild(showAllButton);

    const likesButton = document.createElement('button');
    likesButton.textContent = 'Favoris';
    likesButton.onclick = renderLikedRecipes;
    filterContainer.appendChild(likesButton);

    const shoppingListButton = document.createElement('button');
    shoppingListButton.textContent = 'List de courses';
    shoppingListButton.onclick = showShoppingListPage;
    filterContainer.appendChild(shoppingListButton);
}

// ================= LOCAL STORAGE INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    const storedLikedRecipes = localStorage.getItem('likedRecipes');
    if (storedLikedRecipes) {
        likedRecipes = JSON.parse(storedLikedRecipes);
        updateLikedRecipes();
    }

    const storedShoppingList = localStorage.getItem('shoppingList');
    if (storedShoppingList) {
        shoppingList = JSON.parse(storedShoppingList);
    }
});

// ================= RENDERING RECIPES =================
function renderRecipes(recipes, excludeLiked = false) {
    const h2 = document.querySelector('h2');
    if (h2) h2.style.display = 'none';

    const recipeContainer = document.getElementById('recipe-container');
    if (!recipeContainer) return;

    recipeContainer.innerHTML = '';

    const recipesToRender = excludeLiked
        ? recipes.filter(recipe => !likedRecipes.some(liked => liked.nom === recipe.nom))
        : recipes;

    recipesToRender.forEach((recipe, index) => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';
        recipeDiv.innerHTML = `
            <img src="${recipe.image.src}" alt="${recipe.image.alt}" class="recipe-image">
            <h3>${recipe.nom}</h3>
            <p><strong>Catégorie:</strong> ${recipe.categorie}</p>
            <p><strong>Temps de préparation:</strong> ${recipe.temps_preparation}</p>
            <label class="container">
                <input type="checkbox" onchange="toggleLike(${index}, fetchedRecipes, this.checked)" ${
                    likedRecipes.some(liked => liked.nom === recipe.nom) ? 'checked' : ''
                }>
                <div class="checkmark">
                    <svg viewBox="0 0 256 256">
                        <rect fill="none" height="256" width="256"></rect>
                        <path d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z" stroke-width="20px" stroke="#FFF" fill="none"></path>
                    </svg>
                </div>
            </label>
        `;
        const recipeImage = recipeDiv.querySelector('.recipe-image');
        if (recipeImage) {
            recipeImage.addEventListener('click', () => showPopup(recipe));
        }
        recipeContainer.appendChild(recipeDiv);
    });
}

// ================= TOGGLE LIKES =================
function toggleLike(index, recipes, isChecked) {
    const recipe = recipes[index];
    if (isChecked) {
        if (!likedRecipes.some(liked => liked.nom === recipe.nom)) {
            likedRecipes.push(recipe);
        }
    } else {
        likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom);
    }
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
    updateLikedRecipes();
}

// ================= UPDATE LIKED RECIPES =================
function updateLikedRecipes() {
    const likedRecipesList = document.getElementById('liked-recipes');
    if (!likedRecipesList) return;

    likedRecipesList.innerHTML = '';
    likedRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image.src}" alt="${recipe.image.alt}" class="recipe-image">
            <div class="recipe-content">
                <h3>${recipe.nom}</h3>
                <p><strong>Catégorie:</strong> ${recipe.categorie}</p>
                <p><strong>Temps de préparation:</strong> ${recipe.temps_preparation}</p>
                <button class="remove-btn" onclick="removeLikedRecipe('${recipe.nom}')">🗑️</button>
            </div>
        `;
        const recipeImage = card.querySelector('.recipe-image');
        if (recipeImage) {
            recipeImage.addEventListener('click', () => showPopup(recipe));
        }
        likedRecipesList.appendChild(card);
    });
}

// ================= REMOVE LIKED RECIPE =================
function removeLikedRecipe(recipeName) {
    likedRecipes = likedRecipes.filter(recipe => recipe.nom !== recipeName);
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
    updateLikedRecipes();
}

// ================= SHOPPING LIST MANAGEMENT =================
function showShoppingListPage() {
    const recipeContainer = document.getElementById('recipe-container');
    const filterContainer = document.getElementById('filter-container');
    const h1 = document.querySelector('h1');
    const shoppingListSection = document.getElementById('shopping-list-section');
    const shoppingListElement = document.getElementById('shopping-list');

    if (recipeContainer) recipeContainer.style.display = 'none';
    if (filterContainer) filterContainer.style.display = 'none';
    if (h1) h1.style.display = 'none';
    if (!shoppingListSection || !shoppingListElement) return;

    shoppingListElement.innerHTML = '';
    shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    shoppingList.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => {
            deleteShoppingListItem(index);
            showShoppingListPage();
        };
        listItem.appendChild(deleteButton);
        shoppingListElement.appendChild(listItem);
    });

    shoppingListSection.style.display = 'block';

    if (!document.getElementById('go-back-button-added')) {
        const goBackButton = document.createElement('button');
        goBackButton.textContent = 'Fermer';
        goBackButton.id = 'go-back-button-added';
        goBackButton.onclick = goBackToRecipes;
        shoppingListSection.appendChild(goBackButton);
    }
}

function deleteShoppingListItem(index) {
    shoppingList.splice(index, 1);
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

function goBackToRecipes() {
    const recipeContainer = document.getElementById('recipe-container');
    const filterContainer = document.getElementById('filter-container');
    const h1 = document.querySelector('h1');
    const shoppingListSection = document.getElementById('shopping-list-section');

    if (recipeContainer) recipeContainer.style.display = 'flex';
    if (filterContainer) filterContainer.style.display = 'flex';
    if (h1) h1.style.display = 'block';
    if (shoppingListSection) shoppingListSection.style.display = 'none';
}

// ================= DISPLAY LIKED RECIPES =================
function renderLikedRecipes() {
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const filterContainer = document.getElementById('filter-container');
    const goBackButton = document.getElementById('go-back-button');
    const recipeContainer = document.getElementById('recipe-container');
    const likedRecipesSection = document.getElementById('liked-recipes');

    if (h1) h1.style.display = 'none';
    if (h2) h2.style.display = 'flex';
    if (filterContainer) filterContainer.style.display = 'none';
    if (goBackButton) goBackButton.style.display = 'block';
    if (recipeContainer) {
        recipeContainer.style.display = 'none';
        recipeContainer.innerHTML = '';
    }
    if (likedRecipesSection) likedRecipesSection.style.display = 'flex';
    updateLikedRecipes();
}

function goBack() {
    const h1 = document.querySelector('h1');
    const filterContainer = document.getElementById('filter-container');
    const recipeContainer = document.getElementById('recipe-container');
    const goBackButton = document.getElementById('go-back-button');
    const likedRecipesSection = document.getElementById('liked-recipes');

    if (h1) h1.style.display = 'block';
    if (filterContainer) filterContainer.style.display = 'flex';
    if (recipeContainer) recipeContainer.style.display = 'flex';
    if (goBackButton) goBackButton.style.display = 'none';
    if (likedRecipesSection) likedRecipesSection.style.display = 'none';
    renderRecipes(fetchedRecipes, false);
}

// ================= POP-UP MANAGEMENT =================
function showPopup(recipe) {
    activeRecipe = recipe;
    const existingPopup = document.getElementById('recipe-popup');
    if (existingPopup) existingPopup.remove();
    const existingOverlay = document.getElementById('popup-overlay');
    if (!existingOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'popup-overlay';
        overlay.addEventListener('click', closePopup);
        document.body.appendChild(overlay);
    }

    const popup = document.createElement('div');
    popup.id = 'recipe-popup';
    popup.innerHTML = `
        <div class="left-column">
            <h3>${recipe.nom}</h3>
            <img src="${recipe.image.src}" alt="${recipe.image.alt}">
            <p><strong>Catégorie:</strong> ${recipe.categorie}</p>
            <p><strong>Temps de préparation:</strong> ${recipe.temps_preparation}</p>
        </div>
        <div class="right-column">
            <h4>Ingrédients:</h4>
            <ul>
                ${recipe.ingredients.map((ingredient, index) => `
                    <li>
                        <input type="checkbox" id="ingredient-${index}" data-name="${ingredient.nom}" onchange="addToShoppingList(this)" ${
                            shoppingList.includes(ingredient.nom) ? 'checked' : ''
                        }>
                        <label for="ingredient-${index}">${ingredient.nom}: ${ingredient.quantite}</label>
                    </li>
                `).join('')}
            </ul>
            <h4>Étapes:</h4>
            <ol>
                ${recipe.etapes.map(etape => `<li>${etape}</li>`).join('')}
            </ol>
            <label class="container" style="margin-bottom: 10px;">
                <input type="checkbox" onchange="toggleLikeInPopup('${recipe.nom}', this.checked)" ${
                    likedRecipes.some(liked => liked.nom === recipe.nom) ? 'checked' : ''
                }>
                <div class="checkmark">
                    <svg viewBox="0 0 256 256">
                        <rect fill="none" height="256" width="256"></rect>
                        <path d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z" stroke-width="20px" stroke="#FFF" fill="none"></path>
                    </svg>
                </div>
            </label>
            <button onclick="closePopup()">Fermer</button>
        </div>
    `;
    document.body.appendChild(popup);
}

// ================= TOGGLE LIKES IN POP-UP =================
function toggleLikeInPopup(recipeName, isChecked) {
    const recipe = fetchedRecipes.find(r => r.nom === recipeName);
    if (isChecked) {
        if (!likedRecipes.some(liked => liked.nom === recipe.nom)) {
            likedRecipes.push(recipe);
        }
    } else {
        likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom);
    }
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
    updateLikedRecipes();
}

// ================= CLOSE POP-UP =================
function closePopup() {
    const popup = document.getElementById('recipe-popup');
    const overlay = document.getElementById('popup-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    renderRecipes(fetchedRecipes);
}

// ================= CHECKBOX AND SHOPPING LIST =================
function addToShoppingList(checkbox) {
    const ingredientName = checkbox.dataset.name;
    if (checkbox.checked) {
        if (!shoppingList.includes(ingredientName)) {
            shoppingList.push(ingredientName);
            showToast(`"${ingredientName}" ajouté à la liste de courses !`);
        }
    } else {
        shoppingList = shoppingList.filter(item => item !== ingredientName);
        showToast(`"${ingredientName}" retiré de la liste de courses !`);
    }
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

// ================= DISPLAYING TOAST NOTIFICATIONS =================
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}