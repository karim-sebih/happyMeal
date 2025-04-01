/*import Node.js

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Autorise toutes les origines

app.get('/api/data', (req, res) => {
  res.json({ message: 'CORS activé' });
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
}); */

// script.js
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var mealForm = document.getElementById('meal-form');
    var addMealButton = document.getElementById('add-meal');
    var mealNameInput = document.getElementById('meal-name');
    var mealDateInput = document.getElementById('meal-date');

   /* let xhttp= new XMLHttpRequest('Access-Control-Allow-Origin');
    xhttp.onreadystatechange=action;
    xhttp.open('GET', '/assets/data.json');
    xhttp.send();

    function action() {
        if (this.readyState == 4 && this.status == 200) {
            let recettes = JSON.parse(this.response);
        }
    } */

    // Charger les recettes depuis un fichier JSON
     fetch('http://localhost/test/data.json')
        .then(response => response.json())
        .then(data => {
            var recipes = data;

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: [],
                eventContent: function(arg) {
                    let recipe = recipes.find(r => r.name === arg.event.title);
                    let imageHtml = recipe ? `<img src="${recipe.imageUrl}" alt="${recipe.name}">` : '';
                    let eventHtml = `
                        <div class="fc-event">
                            ${imageHtml}
                            <div>${arg.event.title}</div>
                        </div>
                    `;
                    return { html: eventHtml };
                }
            });

            calendar.render();

            document.querySelectorAll('.add-to-planner').forEach(function(button) {
                button.addEventListener('click', function() {
                    var recipeName = this.getAttribute('data-recipe-name');
                    mealNameInput.value = recipeName;
                    mealForm.style.display = 'block';
                });
            });

            addMealButton.addEventListener('click', function() {
                var title = mealNameInput.value;
                var date = mealDateInput.value;
                var time = document.getElementById('meal-time').value;
                if (title && date && time) {
                    var dateTime = date + 'T' + time + ':00';
                    calendar.addEvent({
                        title: title,
                        start: dateTime
                    });
                    mealForm.style.display = 'none';
                }
            });
        })
        .catch(error => console.error('Erreur lors du chargement des recettes:', error));
});
