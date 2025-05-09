// ================= GLOBAL VARIABLES =================
let fetchedRecipes = [];
let likedRecipes = [];
let shoppingList = [];

// ================= DATA FETCHING AND INITIALIZATION =================
fetch('../json/data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    fetchedRecipes = data.recettes;
    createCategoryFilters(); // Appel après chargement des données
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// ================= CATEGORY FILTER MANAGEMENT =================
function createCategoryFilters() {
  const filterContainer = document.getElementById('filter-container');
  filterContainer.innerHTML = '';

  // Bouton Favoris
  const likesButton = document.createElement('button');
  likesButton.textContent = 'Favoris';
  likesButton.onclick = renderLikedRecipes;
  filterContainer.appendChild(likesButton);

  // Bouton Liste de courses
  const shoppingListButton = document.createElement('button');
  shoppingListButton.textContent = 'Liste de courses';
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

  // Afficher les favoris par défaut au chargement
  renderLikedRecipes();
});

// ================= DISPLAY LIKED RECIPES =================
function renderLikedRecipes() {
  document.querySelector('h1').style.display = 'none';
  document.getElementById('filter-container').style.display = 'flex';
  document.getElementById('recipe-container').style.display = 'none';
  document.getElementById('shopping-list-section').style.display = 'none';
  document.getElementById('liked-recipes').style.display = 'flex';
  updateLikedRecipes();
}

// ================= UPDATE LIKED RECIPES =================
function updateLikedRecipes() {
  const likedRecipesList = document.getElementById('liked-recipes');
  likedRecipesList.innerHTML = '';

  if (likedRecipes.length === 0) {
    likedRecipesList.innerHTML = '<p>Aucune recette favorite pour le moment.</p>';
    return;
  }

  likedRecipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <img src="${recipe.image?.src || recipe.image || 'default.jpg'}" alt="${recipe.image?.alt || 'Image de la recette'}" class="recipe-image">
      <div class="recipe-content">
        <h3>${recipe.nom}</h3>
        <p><strong>Temps de préparation:</strong> ${recipe.temps_preparation}</p>
        <button class="details-btn" onclick="showPopup(${JSON.stringify(recipe).split('"').join('&quot;')})">Voir Détails</button>
        <button class="remove-btn" onclick="removeLikedRecipe('${recipe.nom}')">🗑️</button>
      </div>
    `;
    likedRecipesList.appendChild(card);
  });
}

// ================= REMOVE LIKED RECIPE =================
function removeLikedRecipe(recipeName) {
  likedRecipes = likedRecipesáshoz

.filter(recipe => recipe.nom !== recipeName);
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
  updateLikedRecipes();
}

// ================= SHOPPING LIST MANAGEMENT =================
function showShoppingListPage() {
  document.querySelector('h1').style.display = 'none';
  document.getElementById('filter-container').style.display = 'flex';
  document.getElementById('recipe-container').style.display = 'none';
  document.getElementById('liked-recipes').style.display = 'none';

  const shoppingListSection = document.getElementById('shopping-list-section');
  const shoppingListElement = document.getElementById('shopping-list');
  shoppingListElement.innerHTML = '';

  shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
  if (shoppingList.length === 0) {
    shoppingListElement.innerHTML = '<p>Aucune liste de courses pour le moment.</p>';
  } else {
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
  }

  shoppingListSection.style.display = 'block';
}

function deleteShoppingListItem(index) {
  shoppingList.splice(index, 1);
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

// ================= POP-UP MANAGEMENT =================
function showPopup(recipe) {
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
      <img src="${recipe.image?.src || recipe.image || 'default.jpg'}" alt="${recipe.image?.alt || 'Image de la recette'}">
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
  renderLikedRecipes(); // Retour à la vue Favoris par défaut
}

// ================= CHECKBOX AND SHOPPING LIST =================
function addToShoppingList(checkbox) {
  const ingredientName = checkbox.dataset.name;
  if (checkbox.checked) {
    if (!shoppingList.includes(ingredientName)) {
      shoppingList.push(ingredientName);
    }
  } else {
    shoppingList = shoppingList.filter(item => item !== ingredientName);
  }
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}