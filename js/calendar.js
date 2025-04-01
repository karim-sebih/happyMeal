document.addEventListener('DOMContentLoaded', function() {
     

    const calendarContainer = document.getElementById('calCont');
    
    const mealForm = document.getElementById('meal-form');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');

    let calendrier = new FullCalendar.Calendar(calendarContainer, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        selectable: true,
        dateClick: function(info) {
            // Afficher un formulaire de demande d'autorisation lorsqu'une date est cliquée
            mealForm.style.display = 'block';
            addMealButton.onclick = function() {
                var title = document.getElementById('meal-name').value;
                var time = document.getElementById('meal-time').value;
                if (title && time) {
                    var dateTime = info.dateStr + 'T' + time + ':00';
                    calendrier.addEvent({
                        title: title,
                        start: dateTime
                    });
                    mealForm.style.display = 'none';
                }
            };
        },
        events: [
            {
                title: 'Poulet rôti aux herbes',
                start: '2024-03-25T18:00:00'
             }
        ],
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

    calendrier.render();
});

function AfficherDemande(date) {
    const dateObj = new Date (date);
    const dateFR = dateObj.toLocaleDateString("fr");
    // Afficher un formulaire pour faire une demande d'autorisation
    const form = `
        <form id="Demande">
            <label for="Date">Date:</label>
            <input type="text" id="Date" value="${dateFR}" readonly><br>
            <label for="Raison">Raison:</label>
            <textarea id="Raison"></textarea><br>
            <button type="submit">Demander l'autorisation</button>
        </form>
    `;
    // Afficher le formulaire dans une boîte de dialogue ou une section de la page
    document.getElementById('formCont').innerHTML = form;

    document.getElementById('Demande').addEventListener('submit', function(event) {
        event.preventDefault();
        // Traiter la demande d'autorisation
        let raison = document.getElementById('Raison').value;
        EnregistrerDemande(dateFR, raison);
    });
}

function EnregistrerDemande(date, raison) {
    // Sauvegarder la demande dans le fichier JSON ou envoyer au serveur
    const demande = 'Demande d\'autorisation pour le ' + date + ' : ' + raison;
    console.log(demande);
    // AjouterDemande(demande, i);
    // i++;
}

/* function getJsonData () {
    let data = new XMLHttpRequest(); 
    data.open('GET', '../assets/data.json');
    data.onreadystatechange = function() {
        if (data.readyState === 4) {
            let recettes = JSON.parse(data.responseText);
            recettes.forEach(element => {
                console.log(element);
            });
        }
    }
} */ // C'est pété

function getJsonData () {
    fetch('../assets/data.json')
    .then(response => response.json())
    .then()
}