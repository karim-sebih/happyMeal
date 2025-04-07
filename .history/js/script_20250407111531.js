function updateLikedRecipes() {
  const likedRecipesList = document.getElementById('liked-recipes');
  likedRecipesList.innerHTML = '';

  if (likedRecipes.length === 0) {
    likedRecipesList.innerHTML = '<p>Aucune recette favorite pour le moment.</p>';
    return;
  }

  likedRecipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <img src="${recipe.image?.src || recipe.image || 'default.jpg'}" alt="${recipe.image?.alt || 'Image de la recette'}" class="recipe-image">
      <div class="recipe-content">
        <h3>${recipe.nom}</h3>
        <p><strong>Temps de préparation W:</strong> ${recipe.temps_preparation}</p>
        <button class="details-btn" data-recipe-index="${index}">Voir Détails</button>
        <button class="remove-btn" onclick="removeLikedRecipe('${recipe.nom}')">🗑️</button>
      </div>
    `;
    likedRecipesList.appendChild(card);
  });

  document.querySelectorAll('.details-btn').forEach(button => {
    button.addEventListener('click', function () {
      const recipeIndex = this.getAttribute('data-recipe-index');
      const recipe = likedRecipes[recipeIndex];
      console.log('Bouton cliqué, recette :', recipe); // Débogage
      showPopup(recipe);
    });
  });
}