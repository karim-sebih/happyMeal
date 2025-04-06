document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];

    const calendarContainer = document.getElementById('calCont');
    const mealForm = document.getElementById('meal-form');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    const weekViewButton = document.getElementById('week-view-button');
    const monthViewButton = document.getElementById('month-view-button');

    try {
        const res = await fetch('../json/data.json');
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données JSON.');
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error('Les données récupérées ne sont pas un tableau.');
        }

        console.log(data);

        let calendrier = new FullCalendar.Calendar(calendarContainer, {
            initialView: 'dayGridWeek',
            locale: 'fr',
            selectable: true,
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
                            id: Date.now().toString() // Assigner un ID unique
                        });

                        maj_savedEvents(title, dateTime);
                        mealPopup.style.display = 'none';
                    }
                };
            },
            events: savedEvents,
            eventContent: function(arg) {
                let recipe = data.find(r => r.nom === arg.event.title);
                let imageHtml = recipe ? `<img src="${recipe.image.src}" alt="${recipe.image.alt}">` : '';
                let eventHtml = `
                    <div class="vignette">
                        ${imageHtml}
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
                    // Remplir le formulaire avec les détails de l'événement actuel
                    mealNameInput.value = arg.event.title;
                    mealDateInput.value = arg.event.startStr.split('T')[0];
                    document.getElementById('meal-time').value = info.event.startStr.split('T')[1].slice(0, 5);

                    mealPopup.style.display = 'block';
                    addMealButton.onclick = function() {
                        var newTitle = mealNameInput.value;
                        var newDate = mealDateInput.value;
                        var newTime = document.getElementById('meal-time').value;
                        if (newTitle && newDate && newTime) {
                            var newDateTime = newDate + 'T' + newTime + ':00';

                            // Supprimer l'ancien événement
                            supprimer_savedEvent(info.event.id);

                            // Mettre à jour l'événement dans le calendrier
                            info.event.setProp('title', newTitle);
                            info.event.setStart(newDateTime);

                            // Ajouter le nouvel événement mis à jour dans localStorage
                            maj_savedEvents(newTitle, newDateTime, info.event.id);
                            mealPopup.style.display = 'none';
                        }
                    };
                };

                return { domNodes: [domNode] };
            }
        });

        calendrier.render();

        weekViewButton.addEventListener('click', function() {
            calendrier.changeView('dayGridWeek');
        });

        monthViewButton.addEventListener('click', function() {
            calendrier.changeView('dayGridMonth');
        });
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

function maj_savedEvents(title, dateTime, id = null) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    if (id) {
        // Mettre à jour l'événement existant
        let eventIndex = savedEvents.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
            savedEvents[eventIndex] = { title, start: dateTime, id };
        }
    } else {
        // Ajouter un nouvel événement
        savedEvents.push({ title, start: dateTime, id: Date.now().toString() });
    }
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
}

function supprimer_savedEvent(eventId) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    savedEvents = savedEvents.filter(event => event.id !== eventId);
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
}

function toggleAddMeal() {
    let popup = document.querySelector('#meal-popup');
    popup.classList.toggle('display-meal-popup');
}

function cacherPopup() {
    const mealPopup = document.getElementById('meal-popup');
    mealPopup.style.display = 'none';
}