// GLOBAL VARIABLES
let fetchedRecipes = []; // Stores all recipes fetched from data.json
let likedRecipes = []; // Tracks recipes that the user likes
let shoppingList = []; // Saves ingredients for the shopping list
let activeRecipe = null; // Currently viewed recipe
// DATA FETCHING AND INITIALIZATION
// Fetch data (recipes) from the external file 'data.json'
fetch('../json/data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON response
  })
  .then(data => {
    fetchedRecipes = data.recettes; // Store fetched recipes
    renderRecipes(fetchedRecipes); // Render all recipes on the page
    createCategoryFilters(fetchedRecipes); // Create filter buttons by category
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle fetch errors
  });
  
// CATEGORY FILTER MANAGEMENT
function createCategoryFilters(recipes) {
  const categories = [...new Set(recipes.map(recipe => recipe.categorie))];
  // Get all unique recipe categories from the data
  const filterContainer = document.getElementById('filter-container');
  filterContainer.innerHTML = ''; // Clear any existing buttons
  // Create buttons for each unique category
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category; // Button label is the category name
    button.onclick = () => renderRecipes(recipes.filter(recipe => recipe.categorie === category), false);
    // Render recipes of the selected category when clicked
    filterContainer.appendChild(button);
  });
  // "Show All" button
  const showAllButton = document.createElement('button');
  showAllButton.textContent = 'Recettes';
  showAllButton.onclick = () => renderRecipes(recipes, false); // Show all recipes when clicked
  filterContainer.appendChild(showAllButton);
  // "Favoris" button
  const likesButton = document.createElement('button');
  likesButton.textContent = 'Favoris';
  likesButton.onclick = renderLikedRecipes; // Display liked recipes when clicked
  filterContainer.appendChild(likesButton);
  // "List de courses" button
  const shoppingListButton = document.createElement('button');
  shoppingListButton.textContent = 'List de courses';
  shoppingListButton.onclick = showShoppingListPage; // Navigate to shopping list view
  filterContainer.appendChild(shoppingListButton);
}

// Initialize liked recipes and shopping list from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const storedLikedRecipes = localStorage.getItem('likedRecipes');
  if (storedLikedRecipes) {
    likedRecipes = JSON.parse(storedLikedRecipes);
    updateLikedRecipes(); // Render liked recipes from storage
  }
  const storedShoppingList = localStorage.getItem('shoppingList');
  if (storedShoppingList) {
    shoppingList = JSON.parse(storedShoppingList);
  }
});
// RENDER RECIPES
function renderRecipes(recipes, excludeLiked = false) {
  document.querySelector('h2').style.display = 'none'; // Hide "Liked Recipes" section
  const recipeContainer = document.getElementById('recipe-container');
  recipeContainer.innerHTML = ''; // Clear previous content
  // Filter recipes to exclude liked ones if specified
  const recipesToRender = excludeLiked
    ? recipes.filter(recipe => !likedRecipes.some(liked => liked.nom === recipe.nom))
    : recipes;
  // Loop through recipes and create HTML for each
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
    recipeDiv.querySelector('.recipe-image').addEventListener('click', () => showPopup(recipe));
    recipeContainer.appendChild(recipeDiv);
  });
}
// TOGGLE LIKES
function toggleLike(index, recipes, isChecked) {
  const recipe = recipes[index];
  if (isChecked) {
    if (!likedRecipes.some(liked => liked.nom === recipe.nom)) {
      likedRecipes.push(recipe);
    }
  } else {
    likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom);
  }
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Save to localStorage
  updateLikedRecipes();
}
// UPDATE LIKED RECIPES
function updateLikedRecipes() {
  const likedRecipesList = document.getElementById('liked-recipes');
  likedRecipesList.innerHTML = ''; // Clear previous content
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
    card.querySelector('.recipe-image').addEventListener('click', () => showPopup(recipe));
    likedRecipesList.appendChild(card);
  });
}

// REMOVE LIKED RECIPE
function removeLikedRecipe(recipeName) {
  likedRecipes = likedRecipes.filter(recipe => recipe.nom !== recipeName);
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Update localStorage
  updateLikedRecipes();
}
// SHOPPING LIST MANAGEMENT
function showShoppingListPage() {
  // Hide main recipe container and filters
  document.getElementById('recipe-container').style.display = 'none';
  document.getElementById('filter-container').style.display = 'none';
  document.querySelector('h1').style.display = 'none'; // Hide main title
  // Show shopping list section
  const shoppingListSection = document.getElementById('shopping-list-section');
  const shoppingListElement = document.getElementById('shopping-list');
  shoppingListElement.innerHTML = ''; // Clear previous content
  // Render shopping list items
  shoppingList.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    // Create delete button for each shopping list item
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = () => {
      deleteShoppingListItem(index);
      showShoppingListPage(); // Re-render shopping list
    };
    listItem.appendChild(deleteButton);
    shoppingListElement.appendChild(listItem);
  });
  shoppingListSection.style.display = 'block'; // Make section visible
  // Ensure "Go Back" button exists
  if (!document.getElementById('go-back-button-added')) {
    const goBackButton = document.createElement('button');
    goBackButton.textContent = 'Fermer'; // Text for "Close" button
    goBackButton.id = 'go-back-button-added';
    goBackButton.onclick = goBackToRecipes;
    shoppingListSection.appendChild(goBackButton);
  }
}
function deleteShoppingListItem(index) {
  shoppingList.splice(index, 1); // Remove the item
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList)); // Update localStorage
}
function goBackToRecipes() {
  // Restore main recipe list
  document.getElementById('recipe-container').style.display = 'flex';
  document.getElementById('filter-container').style.display = 'flex';
  document.querySelector('h1').style.display = 'block'; // Show main title
  document.getElementById('shopping-list-section').style.display = 'none'; // Hide shopping list
}

// Function to display the liked recipes on the page.
function renderLikedRecipes() {
    const recipeContainer = document.getElementById('recipe-container'); // Locate where the recipes are shown.
    document.getElementById('liked-recipes').style.display = 'flex'; // Ensure the "Liked Recipes" section is visible.
    recipeContainer.innerHTML = ''; // Clear the container to prepare for the liked recipes.
    updateLikedRecipes(); // Refresh the "Liked Recipes" section with the updated data.
  }
  
  /**
   * This function hides the main recipe list, shows liked recipes, and 
   * ensures filter buttons are hidden. A "Go Back" button is added to 
   * return to the full recipe list.
   */
  function renderLikedRecipes() {
    document.querySelector('h1').style.display = 'none'; // Hide the main title ("Recipe List").
    document.querySelector('h2').style.display = 'flex'; // Show the "Liked Recipes" title.
    document.getElementById('filter-container').style.display = 'none'; // Hide the filter buttons.
    document.getElementById('go-back-button').style.display = 'block'; // Show the "Go Back" button.
  
    const recipeContainer = document.getElementById('recipe-container'); // Locate the main recipe list container.
    document.getElementById('recipe-container').style.display = 'none'; // Hide the main recipe list.
    document.getElementById('liked-recipes').style.display = 'flex'; // Ensure the "Liked Recipes" section is visible.
    recipeContainer.innerHTML = ''; // Clear the recipe list to focus on liked recipes.
    updateLikedRecipes(); // Populate the "Liked Recipes" section.
  }
  
  // Function to return to the main recipe list from the "Liked Recipes" view.
  function goBack() {
    document.querySelector('h1').style.display = 'block'; // Show the main title again.
    document.getElementById('filter-container').style.display = 'flex'; // Show the filter buttons.
    document.getElementById('recipe-container').style.display = 'flex'; // Show the main recipe container.
    document.getElementById('go-back-button').style.display = 'none'; // Hide the "Go Back" button.
    document.getElementById('liked-recipes').style.display = 'none'; // Hide the "Liked Recipes" section.
    renderRecipes(fetchedRecipes, false); // Reload and display all recipes.
  }
  
  // SHOPPING LIST FUNCTIONALITY
  // This section handles recipe pop-ups and interactions with the shopping list.
  
// POP-UP MANAGEMENT
function showPopup(recipe) {
  activeRecipe = recipe; // Track active recipe
  // Remove existing pop-up or overlay if present
  const existingPopup = document.getElementById('recipe-popup');
  if (existingPopup) existingPopup.remove();
  const existingOverlay = document.getElementById('popup-overlay');
  if (!existingOverlay) {
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.addEventListener('click', closePopup); // Close pop-up on click
    document.body.appendChild(overlay);
  }
  // Create pop-up for recipe details
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
            <input type="checkbox" id="ingredient-${index}" data-name="${ingredient.nom}" onchange="addToShoppingList(this)">
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

// Function to toggle like/unlike in the pop-up for a specific recipe.
function toggleLikeInPopup(recipeName, isChecked) {
  const recipe = fetchedRecipes.find(r => r.nom === recipeName); // Find the recipe by its name.
  if (isChecked) {
      if (!likedRecipes.some(liked => liked.nom === recipe.nom)) {
          likedRecipes.push(recipe);
      }
  } else {
      likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom);
  }
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Save to localStorage
  updateLikedRecipes(); // Refresh the "Liked Recipes" section.
}

function closePopup() {
  const popup = document.getElementById('recipe-popup');
  const overlay = document.getElementById('popup-overlay');
  if (popup) popup.remove();
  if (overlay) overlay.remove();

  // Re-render recipes to reflect the updated liked state
  renderRecipes(fetchedRecipes);
}



// Function to toggle checkbox state and manage notifications for removal.
function toggleCheckboxState(checkbox) {
  const ingredientName = checkbox.dataset.name;

  // Show a toast only when an ingredient is unselected.
  if (!checkbox.checked) {
    showToast(`"${ingredientName}" retiré de la liste de courses!`); // Toast for removal.
  }

  console.log(`Checkbox for "${ingredientName}" toggled.`); // Debugging log.
}

// ADDING INGREDIENTS TO SHOPPING LIST
function addToShoppingList(checkbox) {
  const ingredientName = checkbox.dataset.name; // Get the ingredient name from the checkbox data
  if (checkbox.checked) {
      if (!shoppingList.includes(ingredientName)) {
          shoppingList.push(ingredientName);
          showToast(`"${ingredientName}" ajouté à la liste de courses!`); // Toast for the selected ingredient
      }
  } else {
      shoppingList = shoppingList.filter(item => item !== ingredientName); // Remove ingredient if unchecked
      showToast(`"${ingredientName}" retiré de la liste de courses!`); // Optional toast for removal
  }
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList)); // Update localStorage
}




// Function for displaying toast notifications.
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message; // Update the toast message dynamically.
  toast.classList.add('show'); // Show the toast.
  setTimeout(() => {
    toast.classList.remove('show'); // Hide the toast after 3 seconds.
  }, 3000); // Toast duration in milliseconds.
}



