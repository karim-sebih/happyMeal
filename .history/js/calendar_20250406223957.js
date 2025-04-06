document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];

    const calendarContainer = document.getElementById('calCont');
    const mealForm = document.getElementById('meal-form');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    const cancelMealButton = document.getElementById('cancel-meal');
    const weekViewButton = document.getElementById('week-view-button');
    const monthViewButton = document.getElementById('month-view-button');

    // Initialiser le calendrier
    let calendrier = new FullCalendar.Calendar(calendarContainer, {
        initialView: 'timeGridWeek', // Utiliser timeGridWeek pour afficher les heures
        locale: 'fr',
        selectable: true,
        slotMinTime: '06:00:00', // Heure de début de la grille (optionnel)
        slotMaxTime: '22:00:00', // Heure de fin de la grille (optionnel)
        dateClick: function(info) {
            mealPopup.style.display = 'block';
            addMealButton.onclick = function() {
                var title = mealNameInput.value;
                var time = document.getElementById('meal-time').value;
                if (title && time) {
                    var dateTime = info.dateStr + 'T' + time + ':00';
                    calendrier.addEvent({
                        title: title,
                        start: dateTime,
                        id: Date.now().toString()
                    });

                    maj_savedEvents(title, dateTime);
                    mealPopup.style.display = 'none';
                }
            };
        },
        events: savedEvents,
        eventContent: function(arg) {
            let eventHtml = `
                <div class="vignette">
                    <div>${arg.event.title}</div>
                    <button class="modify-button" data-event-id="${arg.event.id}">Modifier</button>
                    <button class="delete-button" data-event-id="${arg.event.id}">Supprimer</button>
                </div>
            `;
            let domNode = document.createElement('div');
            domNode.innerHTML = eventHtml;

            domNode.querySelector('.delete-button').onclick = function() {
                if (confirm('Voulez-vous vraiment supprimer ce repas?')) {
                    arg.event.remove();
                    supprimer_savedEvent(arg.event.id);
                }
            };

            domNode.querySelector('.modify-button').onclick = function() {
                mealNameInput.value = arg.event.title;
                mealDateInput.value = arg.event.startStr.split('T')[0];
                document.getElementById('meal-time').value = arg.event.startStr.split('T')[1]?.slice(0, 5) || '';

                mealPopup.style.display = 'block';
                addMealButton.onclick = function() {
                    var newTitle = mealNameInput.value;
                    var newDate = mealDateInput.value;
                    var newTime = document.getElementById('meal-time').value;
                    if (newTitle && newDate && newTime) {
                        var newDateTime = newDate + 'T' + newTime + ':00';
                        supprimer_savedEvent(arg.event.id);
                        arg.event.setProp('title', newTitle);
                        arg.event.setStart(newDateTime);
                        maj_savedEvents(newTitle, newDateTime, arg.event.id);
                        mealPopup.style.display = 'none';
                    }
                };
            };

            return { domNodes: [domNode] };
        }
    });

    calendrier.render();

    // Attacher l'événement pour le bouton Annuler
    cancelMealButton.addEventListener('click', function() {
        mealPopup.style.display = 'none';
    });

    weekViewButton.addEventListener('click', function() {
        calendrier.changeView('timeGridWeek');
    });

    monthViewButton.addEventListener('click', function() {
        calendrier.changeView('dayGridMonth');
    });

    // Charger les données JSON séparément
    try {
        const res = await fetch('http://localhost/happyMeal/json/data.json');
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données JSON.');
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error('Les données récupérées ne sont pas un tableau.');
        }

        console.log(data);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

function maj_savedEvents(title, dateTime, id = null) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    if (id) {
        let eventIndex = savedEvents.findIndex(event => event.id === id);
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