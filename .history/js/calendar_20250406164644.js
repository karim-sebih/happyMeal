document.addEventListener('DOMContentLoaded', async function() {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];

    const calendarContainer = document.getElementById('calCont');
    const mealPopup = document.getElementById('meal-popup');
    const addMealButton = document.getElementById('add-meal');
    const mealNameInput = document.getElementById('meal-name');
    const mealDateInput = document.getElementById('meal-date');
    const weekViewButton = document.getElementById('week-view-button');
    const monthViewButton = document.getElementById('month-view-button');

    try {
        const res = await fetch('../json/data.json'); // Chemin relatif
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données JSON.');
        }
        const data = await res.json();

        if (!Array.isArray(data.recettes)) { // Vérifie data.recettes
            throw new Error('Les données récupérées ne sont pas un tableau.');
        }

        const recettes = data.recettes; // Extraction des recettes
        console.log(recettes);

        let calendrier = new FullCalendar.Calendar(calendarContainer, {
            initialView: 'dayGridWeek',
            locale: 'fr',
            selectable: true,
            dateClick: function(info) {
                mealPopup.style.display = 'block';
                mealDateInput.value = info.dateStr; // Pré-remplir la date
                addMealButton.onclick = function() {
                    const title = mealNameInput.value.trim();
                    const time = document.getElementById('meal-time').value;
                    if (title && time) {
                        const dateTime = info.dateStr + 'T' + time + ':00';
                        calendrier.addEvent({
                            title: title,
                            start: dateTime,
                            id: Date.now().toString()
                        });
                        maj_savedEvents(title, dateTime);
                        mealPopup.style.display = 'none';
                        mealNameInput.value = ''; // Réinitialiser le champ
                    } else {
                        alert('Veuillez entrer un nom de repas et une heure.');
                    }
                };
            },
            events: savedEvents,
            eventContent: function(arg) {
                const recipe = recettes.find(r => r.nom === arg.event.title);
                const imageHtml = recipe ? `<img src="${recipe.image.src}" alt="${recipe.image.alt}" style="width: 50px; height: auto;">` : '';
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

                domNode.querySelector('.delete-button').addEventListener('click', function() {
                    if (confirm('Voulez-vous vraiment supprimer ce repas ?')) {
                        arg.event.remove();
                        supprimer_savedEvent(arg.event.id);
                    }
                });

                domNode.querySelector('.modify-button').addEventListener('click', function() {
                    mealNameInput.value = arg.event.title;
                    mealDateInput.value = arg.event.startStr.split('T')[0];
                    document.getElementById('meal-time').value = arg.event.startStr.split('T')[1]?.slice(0, 5) || '';

                    mealPopup.style.display = 'block';
                    addMealButton.onclick = function() {
                        const newTitle = mealNameInput.value.trim();
                        const newDate = mealDateInput.value;
                        const newTime = document.getElementById('meal-time').value;
                        if (newTitle && newDate && newTime) {
                            const newDateTime = newDate + 'T' + newTime + ':00';
                            arg.event.remove(); // Supprimer l’ancien événement
                            calendrier.addEvent({
                                title: newTitle,
                                start: newDateTime,
                                id: arg.event.id // Réutiliser le même ID
                            });
                            maj_savedEvents(newTitle, newDateTime, arg.event.id);
                            mealPopup.style.display = 'none';
                            mealNameInput.value = ''; // Réinitialiser le champ
                        } else {
                            alert('Veuillez remplir tous les champs.');
                        }
                    };
                });

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

        // Bouton pour cacher la popup
        document.getElementById('meal-popup')?.querySelector('.close-btn')?.addEventListener('click', cacherPopup);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

function maj_savedEvents(title, dateTime, id = null) {
    let savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    if (id) {
        const eventIndex = savedEvents.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
            savedEvents[eventIndex] = { title, start: dateTime, id };
        } else {
            savedEvents.push({ title, start: dateTime, id });
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

function cacherPopup() {
    const mealPopup = document.getElementById('meal-popup');
    mealPopup.style.display = 'none';
}   