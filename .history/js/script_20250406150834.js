// ================= GLOBAL VARIABLES =================
// These are containers used to store important data while your application runs.
let fetchedRecipes = []; // Stores all recipes fetched from data.json
let likedRecipes = []; // Tracks recipes that the user likes
let shoppingList = []; // Saves ingredients for the shopping list
let activeRecipe = null; // Currently viewed recipe

// ================= DATA FETCHING AND INITIALIZATION =================
// Fetch data (recipes) from the external file 'data.json'
fetch('../json/data.json') // Start fetching the data from the file.
  .then(response => {
    // Check if the response is successful (not an error).
    if (!response.ok) {
      throw new Error('Network response was not ok'); // If not successful, show an error message.
    }
    return response.json(); // If successful, convert the response into a format we can use (JSON).
  })
  .then(data => {
    fetchedRecipes = data.recettes; // Store fetched recipes
    renderRecipes(fetchedRecipes); // Render all recipes on the page
    createCategoryFilters(fetchedRecipes); // Create filter buttons by category
  })
  .catch(error => {
    console.error('Error fetching data:', error); // If something goes wrong, log the error to the console.
  });
  
// ================= CATEGORY FILTER MANAGEMENT =================
// This function creates buttons to filter recipes based on their category.
function createCategoryFilters(recipes) {
  const categories = [...new Set(recipes.map(recipe => recipe.categorie))];
  // Get all unique recipe categories from the data
  const filterContainer = document.getElementById('filter-container');
  filterContainer.innerHTML = ''; // Clear any existing buttons that might already be there.
// Loop through each category and create a button for it.
  categories.forEach(category => {
    const button = document.createElement('button'); // Create a new button.
    button.textContent = category; // Set the button's label to the category name.
    button.onclick = () => renderRecipes(recipes.filter(recipe => recipe.categorie === category), false);
    // When clicked, display only recipes in this category.
    filterContainer.appendChild(button); // Add the button to the filter area.
  });

  // Add a "Show All" button to display all recipes, no matter the category.
  const showAllButton = document.createElement('button');
  showAllButton.textContent = 'Recettes'; // Label it "Recettes."
  showAllButton.onclick = () => renderRecipes(recipes, false); // Show all recipes when clicked
  filterContainer.appendChild(showAllButton);
  
  // "Favoris" button
  const likesButton = document.createElement('button');
  likesButton.textContent = 'Favoris'; // Label it "Favoris."
  likesButton.onclick = renderLikedRecipes; // Display liked recipes when clicked
  filterContainer.appendChild(likesButton);

 // Add a button for the shopping list.
  const shoppingListButton = document.createElement('button');
  shoppingListButton.textContent = 'List de courses'; // Label it "Shopping List."
  shoppingListButton.onclick = showShoppingListPage; // Show the shopping list when clicked.
  filterContainer.appendChild(shoppingListButton);
}

// ================= LOCAL STORAGE INITIALIZATION =================
// When the webpage is loaded, check if there are any saved liked recipes or shopping lists from localStorage.
document.addEventListener('DOMContentLoaded', () => {
  const storedLikedRecipes = localStorage.getItem('likedRecipes'); // Get saved liked recipes.
  if (storedLikedRecipes) {
    likedRecipes = JSON.parse(storedLikedRecipes); // If they exist, load them into the likedRecipes variable.
    updateLikedRecipes(); // Update the display to show liked recipes. from storage.
  }

  const storedShoppingList = localStorage.getItem('shoppingList'); // Get the saved shopping list.
  if (storedShoppingList) {
    shoppingList = JSON.parse(storedShoppingList); // If it exists, load it into the shoppingList variable.
  }
});

// ================= RENDERING RECIPES =================
// This function displays recipes on the webpage.
function renderRecipes(recipes, excludeLiked = false) {
  document.querySelector('h2').style.display = 'none'; // Hide the "Liked Recipes" section title.
  const recipeContainer = document.getElementById('recipe-container'); // Find the recipe display area on the webpage.
  recipeContainer.innerHTML = ''; // Clear any existing recipes.

  // Decide which recipes to show: exclude liked recipes if 'excludeLiked' is true.
  const recipesToRender = excludeLiked
    ? recipes.filter(recipe => !likedRecipes.some(liked => liked.nom === recipe.nom))
    : recipes;


  // Loop through all the recipes to be displayed and create HTML for each
  recipesToRender.forEach((recipe, index) => {
    const recipeDiv = document.createElement('div'); // Create a container for each recipe.
    recipeDiv.className = 'recipe'; // Add a 'recipe' class for styling.
    // Create the HTML structure for the recipe.
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
    // Add an event for clicking on the recipe image to show more details.
    recipeDiv.querySelector('.recipe-image').addEventListener('click', () => showPopup(recipe));
    recipeContainer.appendChild(recipeDiv); // Add the recipe to the display area.
  });
}
// ================= TOGGLE LIKES =================
// This function adds or removes a recipe from the user's favorites (liked recipes).
function toggleLike(index, recipes, isChecked) {
  const recipe = recipes[index]; // Find the recipe that the user interacted with.
  
  if (isChecked) { // If the user "liked" the recipe (checked the box)...
    if (!likedRecipes.some(liked => liked.nom === recipe.nom)) { // Check if the recipe is not already liked.
      likedRecipes.push(recipe); // Add the recipe to the list of liked recipes.
    }
  } else { // If the user "unliked" the recipe (unchecked the box)...
    likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom); // Remove the recipe from the list of liked recipes.
  }
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Save the updated list of liked recipes in the user's local storage.
  updateLikedRecipes(); // Update the display of the user's liked recipes.
}

// ================= UPDATE LIKED RECIPES =================
// This function updates the display of all the user's liked recipes on the screen.
function updateLikedRecipes() {
  const likedRecipesList = document.getElementById('liked-recipes'); // Find the section where liked recipes are shown.
  likedRecipesList.innerHTML = ''; // Clear out any old content in the liked recipes section.
  
  likedRecipes.forEach(recipe => { // Go through each liked recipe and create a card to display it.
    const card = document.createElement('div'); // Create a container for the recipe card.
    card.className = 'recipe-card'; // Add a class for styling the recipe card.
    
     // Create the layout for the recipe card.
    card.innerHTML = `
      <img src="${recipe.image.src}" alt="${recipe.image.alt}" class="recipe-image">
      <div class="recipe-content">
        <h3>${recipe.nom}</h3>
        <p><strong>Catégorie:</strong> ${recipe.categorie}</p>
        <p><strong>Temps de préparation:</strong> ${recipe.temps_preparation}</p>
        <button class="remove-btn" onclick="removeLikedRecipe('${recipe.nom}')">🗑️</button>
      </div>
    `;

    card.querySelector('.recipe-image').addEventListener('click', () => showPopup(recipe)); // Allow users to click the image to see more details.
    likedRecipesList.appendChild(card); // Add the recipe card to the liked recipes section.
  });
}

// ================= REMOVE LIKED RECIPE =================
// This function removes a recipe from the user's favorites (liked recipes).
function removeLikedRecipe(recipeName) {
  likedRecipes = likedRecipes.filter(recipe => recipe.nom !== recipeName); // Filter out the recipe from the list of liked recipes.
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Save the updated list to the local storage.
  updateLikedRecipes(); // Refresh the displayed list of liked recipes.
}

// ================= SHOPPING LIST MANAGEMENT =================
// This function shows the shopping list view to the user.
function showShoppingListPage() {
 // Hide the main recipe list and filter buttons.
  document.getElementById('recipe-container').style.display = 'none'; // Hide the main recipe list.
  document.getElementById('filter-container').style.display = 'none'; // Hide the filters.
  document.querySelector('h1').style.display = 'none'; // Hide the main title.

// Get the shopping list section ready to display.
  const shoppingListSection = document.getElementById('shopping-list-section');
  const shoppingListElement = document.getElementById('shopping-list');
  shoppingListElement.innerHTML = ''; // Clear any old content in the shopping list.

    // Go through each item in the shopping list and display it.
  shoppingList.forEach((item, index) => {
    const listItem = document.createElement('li'); // Create a list item for the shopping list.
    listItem.textContent = item; // Set the text to the shopping item.

    // Create delete button for each shopping list item to be removed
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';  // Icon for the delete button.
    deleteButton.className = 'delete-btn'; // Class for styling the delete button.
    deleteButton.onclick = () => {
      deleteShoppingListItem(index); // Remove the item from the shopping list.
      showShoppingListPage(); // Re-show the shopping list to reflect changes.
    };
    listItem.appendChild(deleteButton); // Add the delete button to the list item.
    shoppingListElement.appendChild(listItem); // Add the list item to the shopping list.
  });

  shoppingListSection.style.display = 'block'; // Make the shopping list section visible.
  
  // Check if the "Go Back" button exists; if not, create it.
  if (!document.getElementById('go-back-button-added')) {
    const goBackButton = document.createElement('button'); // Create the "Go Back" button.
    goBackButton.textContent = 'Fermer'; // Text for "Close" button
    goBackButton.id = 'go-back-button-added'; // Set an ID for the button.
    goBackButton.onclick = goBackToRecipes; // Set it to return to the recipe view when clicked.
    shoppingListSection.appendChild(goBackButton); // Add the button to the shopping list section.
  }
}

// This function removes an item from the shopping list.
function deleteShoppingListItem(index) {
  shoppingList.splice(index, 1); // Remove the item from the shopping list.
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList)); // Save the updated list to the local storage.
}

// This function returns to the main recipe view from the shopping list view.
function goBackToRecipes() {
  // Restore main recipe list
  document.getElementById('recipe-container').style.display = 'flex'; // Show the main recipe list again.
  document.getElementById('filter-container').style.display = 'flex'; // Show the filter buttons.
  document.querySelector('h1').style.display = 'block'; // Show the main title.
  document.getElementById('shopping-list-section').style.display = 'none'; // Hide the shopping list view.
}

// ================= DISPLAY LIKED RECIPES =================
// This function updates the page to show only the recipes the user has marked as "liked."
function renderLikedRecipes() {
  const recipeContainer = document.getElementById('recipe-container'); // Find the container where recipes are displayed.
  document.getElementById('liked-recipes').style.display = 'flex'; // Make sure the "Liked Recipes" section is visible on the screen.
  recipeContainer.innerHTML = ''; // Clear out any recipes that might already be displayed in the container.
  updateLikedRecipes(); // Refresh the content of the "Liked Recipes" section with the latest liked recipes.
}

/**
 * ================= HIDE MAIN RECIPE LIST AND SHOW LIKED RECIPES =================
 * This function hides the full list of recipes and displays only the user's liked recipes.
 * It also makes sure the filter buttons and other unnecessary elements are hidden.
 */
function renderLikedRecipes() {
  document.querySelector('h1').style.display = 'none'; // Hide the main title ("Recipe List") since we're focusing on liked recipes now.
  document.querySelector('h2').style.display = 'flex'; // Make the "Liked Recipes" title visible so users know what they're viewing.
  document.getElementById('filter-container').style.display = 'none'; // Hide all category filter buttons so they don't clutter the page.
  document.getElementById('go-back-button').style.display = 'block'; // Show the "Go Back" button so users can return to the full recipe list.

  const recipeContainer = document.getElementById('recipe-container'); // Find the main container where all recipes are displayed.
  document.getElementById('recipe-container').style.display = 'none'; // Hide the main recipe list since we're focusing on liked recipes now.
  document.getElementById('liked-recipes').style.display = 'flex'; // Make the "Liked Recipes" section visible to display favorites.
  recipeContainer.innerHTML = ''; // Clear the main recipe container to make room for liked recipes.
  updateLikedRecipes(); // Fill the "Liked Recipes" section with the user's favorite recipes.
}

  
  // ================= GO BACK TO MAIN RECIPE LIST =================
// This function switches the view back to the main recipe list when the user is done
// viewing the "Liked Recipes" section.
  function goBack() {
    document.querySelector('h1').style.display = 'block'; // Make the main title ("Recipe List") visible again.
    document.getElementById('filter-container').style.display = 'flex'; // Show the filter buttons for categories.
    document.getElementById('recipe-container').style.display = 'flex'; // Bring back the main container displaying all recipes.
    document.getElementById('go-back-button').style.display = 'none'; // Hide the "Go Back" button as it's no longer needed.
    document.getElementById('liked-recipes').style.display = 'none'; // Hide the "Liked Recipes" section.
    renderRecipes(fetchedRecipes, false); // Reload and display all recipes, including those not liked.
  }
  
  
// ================= POP-UP MANAGEMENT =================
// This function shows a pop-up with detailed information about a recipe when clicked.
function showPopup(recipe) {
  activeRecipe = recipe; // Save the recipe that the user clicked on as the active one.
  
  // Remove any existing pop-up or overlay from a previous view.
  const existingPopup = document.getElementById('recipe-popup');
  if (existingPopup) existingPopup.remove(); // Remove the old pop-up if it exists.
  const existingOverlay = document.getElementById('popup-overlay');
  if (!existingOverlay) { // If there's no background overlay, create one.
    const overlay = document.createElement('div'); // Create a new overlay element.
    overlay.id = 'popup-overlay'; // Give it an ID for styling and control.
    overlay.addEventListener('click', closePopup); // Close the pop-up when the overlay is clicked.
    document.body.appendChild(overlay); // Add the overlay to the webpage.
  }
  
  // Create the main pop-up container for the recipe details.
  const popup = document.createElement('div');
  popup.id = 'recipe-popup'; // Set an ID for styling and control.
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
  document.body.appendChild(popup);  // Add the pop-up to the webpage.
}

// ================= TOGGLE LIKES IN POP-UP =================
// This function adds/removes a recipe from favorites directly from the pop-up.
function toggleLikeInPopup(recipeName, isChecked) {
  const recipe = fetchedRecipes.find(r => r.nom === recipeName); // Find the recipe by its name.
  
  if (isChecked) { // If the user "liked" the recipe...
      if (!likedRecipes.some(liked => liked.nom === recipe.nom)) { // Check if it's not already in favorites.
          likedRecipes.push(recipe); // Add it to the liked recipes.
      }
  } else { // If the user "unliked" the recipe...
      likedRecipes = likedRecipes.filter(liked => liked.nom !== recipe.nom); // Remove it from favorites.
  }
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes)); // Save the updated favorites to local storage.
  updateLikedRecipes(); // Refresh the displayed list of liked recipes section.
}

// ================= CLOSE POP-UP =================
// This function closes the pop-up and removes the overlay when the user is done.
function closePopup() {
  const popup = document.getElementById('recipe-popup'); // Locate the pop-up.
  const overlay = document.getElementById('popup-overlay'); // Locate the background overlay.
  
  if (popup) popup.remove(); // Remove the pop-up if it exists.
  if (overlay) overlay.remove(); // Remove the overlay if it exists.

  renderRecipes(fetchedRecipes);  // Refresh the main recipe list to reflect any changes (e.g., likes).
}



// ================= TOGGLE CHECKBOX STATE =================
// This function handles what happens when a checkbox is clicked.
// It checks whether the box is selected or not, and displays a message if it's unselected.
function toggleCheckboxState(checkbox) {
  const ingredientName = checkbox.dataset.name; // Get the name of the ingredient associated with the checkbox.

  // If the checkbox is NOT checked (the user unselected it):
  if (!checkbox.checked) {
    showToast(`"${ingredientName}" retiré de la liste de courses!`); // Show a message (toast) saying the ingredient was removed from the shopping list.
  }

  console.log(`Checkbox for "${ingredientName}" toggled.`); // Print a message to the console for debugging purposes.
}
// ================= END =================


// ================= CHECKBOX AND SHOPPING LIST =================
// Function to add/remove ingredients to/from the shopping list when checked/unchecked.
function addToShoppingList(checkbox) {
  const ingredientName = checkbox.dataset.name; // Get the ingredient name from the checkbox data
  
  if (checkbox.checked) { // If the checkbox is checked, add the ingredient.
      if (!shoppingList.includes(ingredientName)) { // Check if it's not already in the list.
          shoppingList.push(ingredientName); // Add the ingredient to the shopping list.
          showToast(`"${ingredientName}" ajouté à la liste de courses!`); // Toast for the selected ingredient. Show a notification.
      }
  } else { // If the checkbox is unchecked, remove the ingredient.
      shoppingList = shoppingList.filter(item => item !== ingredientName); // Remove ingredient if unchecked from the shopping list.
      showToast(`"${ingredientName}" retiré de la liste de courses!`); // Optional toast for removal. // Show a notification.
  }
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList)); // Save the updated list to localStorage.
}



// ================= DISPLAYING TOAST NOTIFICATIONS =================
// This function shows a quick notification message (called a "toast") on the screen.
// A toast is a temporary message that disappears after a short time.
function showToast(message) {
  const toast = document.getElementById('toast'); // Find the HTML element where the toast will be displayed.
  toast.textContent = message; // Set the content of the toast to the message provided by the function.

  toast.classList.add('show'); // Add a CSS class to make the toast visible on the screen.

  setTimeout(() => {
    toast.classList.remove('show'); // After 3 seconds, remove the CSS class to hide the toast.
  }, 3000); // 3000 milliseconds (3 seconds) is the duration for how long the toast stays visible.
}



document.addEventListener("DOMContentLoaded", () => {
  const shoppingList = document.getElementById("shopping-list");
  const storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];

  if (storedIngredients.length > 0 && shoppingList) {
      storedIngredients.forEach(ingredient => {
          const li = document.createElement("li");
          li.textContent = ingredient;
          shoppingList.appendChild(li);
      });
  }
});
