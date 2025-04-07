document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    let jsonData = []; // Variable pour stocker les données JSON (tableau des recettes)

    const calendarContainer = document.getElementById('calCont');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    const mealTimeInput = document.getElementById('meal-time');
    const cancelMealButton = document.getElementById('cancel-meal');
    const weekViewButton = document.getElementById('week-view-button');
    const monthViewButton = document.getElementById('month-view-button');

    // Charger les données JSON avant d'initialiser le calendrier
    try {
        const res = await fetch('../json/data.json');
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données JSON.');
        }
        const data = await res.json();
        jsonData = data.recettes; // Extraire directement le tableau "recettes"
        console.log('Données JSON chargées :', jsonData);
    } catch (error) {
        console.warn('Impossible de charger les données JSON. Les images ne seront pas disponibles.', error);
    }

    // Initialiser le calendrier
    let calendrier = new FullCalendar.Calendar(calendarContainer, {
        initialView: 'dayGridWeek',
        locale: 'fr',
        selectable: true,
        dateClick: function(info) {
            mealPopup.style.display = 'block';
            mealDateInput.value = info.dateStr; // Pré-remplir la date cliquée
            mealTimeInput.value = ''; // Réinitialiser l'heure
            mealNameInput.value = ''; // Réinitialiser le nom
            addMealButton.onclick = function() {
                const title = mealNameInput.value.trim();
                const date = mealDateInput.value;
                const time = mealTimeInput.value;
                if (title && date && time) {
                    const dateTime = `${date}T${time}:00`;
                    calendrier.addEvent({
                        title: title,
                        start: dateTime,
                        id: Date.now().toString()
                    });
                    maj_savedEvents(title, dateTime);
                    mealPopup.style.display = 'none';
                } else {
                    alert('Veuillez remplir tous les champs.');
                }
            };
        },
        events: savedEvents,
        eventContent: function(arg) {
            // Chercher la recette correspondante dans jsonData
            const recipe = jsonData.find(r => r.nom === arg.event.title);
            const imageHtml = recipe 
                ? `<img src="${recipe.image.src}" alt="${recipe.image.alt}" style="width: 50px; height: 50px;" onerror="this.style.display='none'">` 
                : '';
            const eventHtml = `
                <div class="vignette">
                    ${imageHtml}
                    <div>${arg.event.title}</div>
                    <button class="modify-button" data-event-id="${arg.event.id}">Modifier</button>
                    <button class="delete-button" data-event-id="${arg.event.id}">Supprimer</button>
                </div>
            `;
            const domNode = document.createElement('div');
            domNode.innerHTML = eventHtml;

            // Gestion de la suppression
            domNode.querySelector('.delete-button').onclick = function() {
                if (confirm('Voulez-vous vraiment supprimer ce repas ?')) {
                    arg.event.remove();
                    supprimer_savedEvent(arg.event.id);
                }
            };

            // Gestion de la modification
            domNode.querySelector('.modify-button').onclick = function() {
                mealNameInput.value = arg.event.title;
                mealDateInput.value = arg.event.startStr.split('T')[0];
                mealTimeInput.value = arg.event.startStr.split('T')[1]?.slice(0, 5) || '';
                mealPopup.style.display = 'block';
                addMealButton.onclick = function() {
                    const newTitle = mealNameInput.value.trim();
                    const newDate = mealDateInput.value;
                    const newTime = mealTimeInput.value;
                    if (newTitle && newDate && newTime) {
                        const newDateTime = `${newDate}T${newTime}:00`;
                        supprimer_savedEvent(arg.event.id);
                        arg.event.setProp('title', newTitle);
                        arg.event.setStart(newDateTime);
                        maj_savedEvents(newTitle, newDateTime, arg.event.id);
                        mealPopup.style.display = 'none';
                    } else {
                        alert('Veuillez remplir tous les champs.');
                    }
                };
            };

            return { domNodes: [domNode] };
        }
    });

    calendrier.render();

    // Gestion du bouton Annuler
    cancelMealButton.addEventListener('click', function() {
        mealPopup.style.display = 'none';
        mealNameInput.value = '';
        mealDateInput.value = '';
        mealTimeInput.value = '';
    });

    // Changement de vue
    weekViewButton.addEventListener('click', function() {
        calendrier.changeView('dayGridWeek');
    });

    monthViewButton.addEventListener('click', function() {
        calendrier.changeView('dayGridMonth');
    });
});

// Fonctions pour gérer le localStorage
function maj_savedEvents(title, dateTime, id = null) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    if (id) {
        const eventIndex = savedEvents.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
            savedEvents[eventIndex] = { title, start: dateTime, id };
        }
    } else {
        savedEvents.push({ title, start: dateTime, id: Date.now().toString() });
    }
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
}

function supprimer_savedEvent(eventId) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    savedEvents = savedEvents.filter(event => event.id !== eventId);
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
}