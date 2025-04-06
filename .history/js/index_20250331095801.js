// Fonction pour afficher les ingrédients stockés avec un bouton de suppression
function displayStoredIngredients() {
    const storedIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];
    const ingredientListContainer = document.getElementById("stored-ingredients-list");
    ingredientListContainer.innerHTML = ""; // Effacer la liste avant de la remplir à nouveau

    if (storedIngredients.length > 0) {
        storedIngredients.forEach((ingredient, index) => {
            const li = document.createElement("li");
            li.textContent = ingredient;

            // Créer un bouton de suppression
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Supprimer";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", function () {
                // Supprimer l'ingrédient du localStorage
                storedIngredients.splice(index, 1); // Retirer l'ingrédient de la liste
                localStorage.setItem("selectedIngredients", JSON.stringify(storedIngredients)); // Sauvegarder la nouvelle liste

                // Mettre à jour l'affichage
                displayStoredIngredients();
            });

            // Ajouter le bouton de suppression à l'élément de la liste
            li.appendChild(deleteBtn);
            ingredientListContainer.appendChild(li);
        });
    } else {
        ingredientListContainer.innerHTML = "<p>Aucun ingrédient sélectionné.</p>";
    }
}

// Ajouter à la liste des ingrédients dans le localStorage
document.getElementById("add-to-list-btn").addEventListener("click", function () {
    // Récupérer toutes les checkboxes de la pop-up
    const checkboxes = document.querySelectorAll("#modal-ingredients input[type='checkbox']:checked");

    // Extraire les noms des ingrédients cochés sans la quantité
    const selectedIngredients = [];
    checkboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling; // L'étiquette suivante (le texte de l'ingrédient)
        if (label) {
            const ingredientName = label.textContent.split(' - ')[1]; // Extraire le nom sans la quantité
            selectedIngredients.push(ingredientName);
        }
    });

    // Sauvegarder les ingrédients sélectionnés dans le localStorage
    let currentIngredients = JSON.parse(localStorage.getItem("selectedIngredients")) || [];
    currentIngredients = currentIngredients.concat(selectedIngredients); // Ajouter les nouveaux ingrédients
    localStorage.setItem("selectedIngredients", JSON.stringify(currentIngredients));

    // Afficher un message de confirmation ou faire une action spécifique
    alert("Ingrédients ajoutés à la liste !");

    // Afficher les ingrédients stockés dans la liste
    displayStoredIngredients();
});

// Appeler cette fonction au chargement de la page pour afficher les ingrédients déjà stockés
document.addEventListener("DOMContentLoaded", function () {
    displayStoredIngredients();
});
