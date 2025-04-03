document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];     

    const calendarContainer = document.getElementById('calCont');
    
    const mealForm = document.getElementById('meal-form');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    
    const res = await fetch('http://localhost/happyMeal/assets/data.json');
    const data = await res.json();
    console.log(data);

    let calendrier = new FullCalendar.Calendar(calendarContainer, {
        initialView: 'dayGridWeek',
        locale: 'fr',
        selectable: true,
        dateClick: function(info) {
            // Afficher un formulaire de demande d'autorisation lorsqu'une date est cliquée
            mealPopup.style.display = 'block';
            addMealButton.onclick = function() {
                var title = document.getElementById('meal-name').value;
                var time = document.getElementById('meal-time').value;
                if (title && time) {
                    var dateTime = info.dateStr + 'T' + time + ':00';
                    calendrier.addEvent({
                        title: title,
                        start: dateTime
                    });
                    
                    mealPopup.style.display = 'none';
                    maj_savedEvents;
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
            let recipe = data.find(r => r.name === arg.event.title);
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


function maj_savedEvents () {
    savedEvents.push({ title: title, start: dateTime });
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
}

function toggleAddMeal () {
    let popup = document.querySelector('#meal-popup');
    popup.classList.toggle('display-meal-popup');
}

function cacherPopup () {
    const mealPopup = document.getElementById('meal-popup');
    mealPopup.style.display = 'none';
}