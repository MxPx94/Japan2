// Warte, bis das gesamte HTML-Dokument geladen ist
document.addEventListener('DOMContentLoaded', function () {

    // Wähle das Hamburger-Icon und das Navigationsmenü aus dem DOM aus
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Überprüfe, ob die Elemente gefunden wurden, bevor du Event-Listener hinzufügst
    if (hamburger && navMenu) {
        // Füge einen Event-Listener für Klicks auf das Hamburger-Icon hinzu
        hamburger.addEventListener('click', () => {
            // Schalte die CSS-Klasse 'active' für beide Elemente um
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Wähle alle Navigationslinks aus
        const navLinks = document.querySelectorAll('.nav-link');

        // Füge für jeden Link einen Klick-Listener hinzu
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Schließe das Menü, indem die 'active' Klasse entfernt wird
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});