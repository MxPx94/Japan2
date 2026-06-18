// ====================================================================
// DOMContentLoaded Event Listener
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Interaktive Japan-Karte ---
    const mapInfoDisplay = document.getElementById('mapInfoDisplay');
    const hotspotTokyo = document.getElementById('hotspotTokyo');
    const hotspotKyoto = document.getElementById('hotspotKyoto');
    const hotspotHokkaido = document.getElementById('hotspotHokkaido');
    const hotspotOkinawa = document.getElementById('hotspotOkinawa');
    const allHotspots = document.querySelectorAll('.map-hotspot');

    if (mapInfoDisplay && hotspotTokyo && hotspotKyoto && hotspotHokkaido && hotspotOkinawa) {

        function updateMapInfo(infoText, clickedHotspot) {
            mapInfoDisplay.textContent = infoText;
            allHotspots.forEach(hotspot => hotspot.classList.remove('active'));
            if (clickedHotspot) {
                clickedHotspot.classList.add('active');
            }
        }

        hotspotTokyo.addEventListener('click', function() {
            updateMapInfo("Tokio: Die pulsierende Hauptstadt Japans, bekannt für ihre Wolkenkratzer, Modeviertel und Hightech-Innovationen.", this);
        });
        hotspotKyoto.addEventListener('click', function() {
            updateMapInfo("Kyoto: Die alte Kaiserstadt Japans, berühmt für ihre unzähligen Tempel, Gärten, Geishas und traditionellen Holzhäuser.", this);
        });
        hotspotHokkaido.addEventListener('click', function() {
            updateMapInfo("Hokkaido: Die nördlichste und zweitgrößte Insel Japans, bekannt für ihre atemberaubende Natur, Skipisten und frische Meeresfrüchte.", this);
        });
        hotspotOkinawa.addEventListener('click', function() {
            updateMapInfo("Okinawa: Eine subtropische Inselkette im Süden Japans, die für ihre wunderschönen Strände, Korallenriffe und eine einzigartige Ryukyu-Kultur bekannt ist.", this);
        });
    }


    // --- Reiseplaner (Liste hinzufügen) ---
    const newTravelDestinationInput = document.getElementById('newTravelDestinationInput');
    const addDestinationButton = document.getElementById('addDestinationButton');
    const travelDestinationsList = document.getElementById('travelDestinationsList');

    let reiseziele = [];

    function displayTravelDestinations() {
        if (!travelDestinationsList) return;

        travelDestinationsList.innerHTML = '';

        if (reiseziele.length === 0) {
            const noItemsMessage = document.createElement('li');
            noItemsMessage.textContent = 'Noch keine Reiseziele hinzugefügt.';
            noItemsMessage.style.fontStyle = 'italic';
            noItemsMessage.style.color = 'rgba(255, 255, 255, 0.7)';
            travelDestinationsList.appendChild(noItemsMessage);
        } else {
            reiseziele.forEach(destination => {
                const listItem = document.createElement('li');
                listItem.textContent = destination;
                travelDestinationsList.appendChild(listItem);
            });
        }
    }

    if (newTravelDestinationInput && addDestinationButton && travelDestinationsList) {
        addDestinationButton.addEventListener('click', () => {
            const destination = newTravelDestinationInput.value.trim();
            if (destination !== '') {
                reiseziele.push(destination);
                newTravelDestinationInput.value = '';
                newTravelDestinationInput.focus();
                displayTravelDestinations();
            } else {
                alert('Bitte gib ein Reiseziel ein, bevor du auf "Hinzufügen" klickst.');
            }
        });

        displayTravelDestinations();
    }


    // --- Hamburger-Menü ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });
    }

});