document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    let jsonData = []; // Variable pour stocker les données JSON

    const calendarContainer = document.getElementById('calCont');
    const mealForm = document.getElementById('meal-form');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    const cancelMealButton = document.getElementById('cancel-meal');
    const weekViewButton = document.getElementById('week-view-button');
    const monthViewButton = document.getElementById('month-view-button');

    // Initialiser le calendrier indépendamment des données JSON
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
                        id: Date.now().toString()
                    });

                    maj_savedEvents(title, dateTime);
                    mealPopup.style.display = 'none';
                }
            };
        },
        events: savedEvents,
        eventContent: function(arg) {
            // Chercher la recette correspondante dans les données JSON
            let recipe = jsonData.find(r => r.nom === arg.event.title);
            let imageHtml = recipe ? `<img src="${recipe.image.src}" alt="${recipe.image.alt}" style="width: 50px; height: 50px;">` : '';
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
        calendrier.changeView('dayGridWeek');
    });

    monthViewButton.addEventListener('click', function() {
        calendrier.changeView('dayGridMonth');
    });

    // Charger les données JSON séparément
    try {
        const res = await fetch('../json/data.json');
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données JSON.');
        }
        const data = await res.json();

        // Vérifier si les données sont un tableau, sinon les convertir ou utiliser une valeur par défaut
        if (!Array.isArray(data)) {
            console.warn('Les données JSON ne sont pas un tableau. Conversion en tableau...');
            jsonData = [data]; // Convertir un objet unique en tableau
        } else {
            jsonData = data; // Les données sont déjà un tableau
        }

        console.log('Données JSON chargées :', jsonData);

        // Rafraîchir le calendrier pour afficher les images si des événements existent déjà
        calendrier.refetchEvents();
    } catch (error) {
        console.warn('Impossible de charger les données JSON. Le calendrier fonctionnera sans les images des repas.', error);
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