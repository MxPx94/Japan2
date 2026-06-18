// tokyo-districts.js

document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // 1. HAMBURGER MENÜ LOGIK (Übernommen von der Hauptseite)
    // ===========================================
    
    // Small toggler for hamburger -> navigation menu
    const burger = document.querySelector('.hamburger') || document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-menu');

    if (burger && navMenu) {
        
        // Event-Listener zum Umschalten des Menüs beim Klick auf das Hamburger-Icon
        burger.addEventListener('click', function () {
            const isActive = burger.classList.toggle('active');
            // support older is-active class too
            burger.classList.toggle('is-active', isActive);
            navMenu.classList.toggle('active', isActive);

            // accessibility
            burger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Event-Listener zum Schließen des Menüs beim Klick auf einen Navigationslink (besonders wichtig für Mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ===========================================
    // 2. PARALLAX PERFORMANCE WÄCHTER (Angepasst)
    // Da wir CSS-3D-Parallax verwenden, dient dies als Logik-Switch
    // ===========================================

    // --- JS Parallax Controller (requestAnimationFrame fallback for consistency) ---
    let parallaxElements = [];
    let parallaxEnabled = false;
    let parallaxTicking = false;

    function updateParallax() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxSpeed) || 0.25; // lower = subtler movement
            const offset = el.parentElement.offsetTop;
            const translateY = ((scrollY - offset) * speed);
            // Apply transform while preserving Z-depth and scale
            el.style.transform = `translateY(${translateY}px) translateZ(-2px) scale(2.4)`;
        });
        parallaxTicking = false;
    }

    function onParallaxScroll() {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    }

    function enableJSParallax() {
        parallaxElements = Array.from(document.querySelectorAll('.parallax-group .background-img'));
        if (!parallaxElements.length) return;
        if (parallaxEnabled) return;
        window.addEventListener('scroll', onParallaxScroll, { passive: true });
        window.addEventListener('resize', updateParallax);
        updateParallax();
        parallaxEnabled = true;
        console.log("Desktop Modus aktiv. CSS + JS Parallax wird ausgeführt.");
    }

    function disableJSParallax() {
        if (!parallaxEnabled) return;
        window.removeEventListener('scroll', onParallaxScroll);
        window.removeEventListener('resize', updateParallax);
        parallaxElements.forEach(el => el.style.transform = '');
        parallaxEnabled = false;
        console.log("Mobile Modus aktiv. Parallax-Effekt wurde deaktiviert.");
    }

    function initializeParallaxGuard() {
        if (window.innerWidth > 768) {
            enableJSParallax();
        } else {
            disableJSParallax();
        }
    }


    
    // Starte den Wächter nach vollständiger Initialisierung (deferred until blossom setup below)

    // Füge einen Listener für die Größenänderung des Fensters hinzu, um den Modus zu wechseln, 
    // falls der Benutzer die Fenstergröße ändert (z.B. Tablet-Rotation)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initializeParallaxGuard, 250);
    });

    // --- SAKURA BLOSSOM SPAWNER (per-section) ---
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Set to true temporarily to force a visible test for debugging; set false to disable
    const BLOSSOM_DEBUG = true;
    let blossomTestShown = false;
    let blossomObserver = null;
    const blossomHandles = new Map(); // section -> { intervalId, activeCount }

    function spawnBlossomForSection(section) {
        if (prefersReducedMotion) return;

        // Increase default concurrent blossoms for stronger effect
        const maxActive = parseInt(section.dataset.blossomMax, 10) || 20;
        const current = blossomHandles.get(section) || { activeCount: 0 };
        if (current.activeCount >= maxActive) return;

        // DEBUG
        if (BLOSSOM_DEBUG) {
            console.debug('spawnBlossomForSection:', section.id || section.className, 'active:', current.activeCount, 'max:', maxActive);
        }

        // Create element as an inline SVG petal wrapper
        const el = document.createElement('div');
        el.className = 'blossom';
        const size = Math.round((Math.random() * 36) + 12); // 12 - 48px (bigger petals)
        const duration = (Math.random() * 5) + 4; // 4 - 9s (faster fall for intensity)
        const left = Math.random() * 100; // percentage (used to compute viewport start)
        const startTop = -10 - Math.random() * 8; // start a bit above the section
        const rotation = Math.round(Math.random() * 360);

        const petalPaths = [
            'M16 2 C20 2 30 8 16 30 C2 8 12 2 16 2 Z',
            'M16 3 C22 6 28 12 18 30 C8 14 12 5 16 3 Z',
            'M16 1 C24 10 28 18 18 30 C8 18 8 8 16 1 Z'
        ];
        const colors = ['#ffd6ea','#ffb7d6','#ff9fcf','#ff7fb3','#fff6fb'];
        const path = petalPaths[Math.floor(Math.random()*petalPaths.length)];
        const color = colors[Math.floor(Math.random()*colors.length)];

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.setProperty('--b-duration', `${duration}s`);
        // stagger start
        el.style.animationDelay = `${Math.random() * 0.6}s`;

        // Randomized motion variables for strong effect
        const rotEnd = rotation + (Math.random() * (Math.random() < 0.5 ? -1 : 1) * (1000 + Math.random() * 1000));
        const drift = Math.round((Math.random() * 360) - 180); // -180px .. +180px
        const sway = Math.round((Math.random() * 60) - 30); // -30px .. +30px
        const scale = (Math.random() * 0.9) + 1.0; // 1.0 - 1.9 (bolder presence)

        el.style.setProperty('--b-rot-start', `${rotation}deg`);
        el.style.setProperty('--b-rot-end', `${rotEnd}deg`);
        el.style.setProperty('--b-drift', `${drift}px`);
        el.style.setProperty('--b-sway', `${sway}px`);
        el.style.setProperty('--b-scale', `${scale}`);
        // Build inline SVG petal markup
        el.innerHTML = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="petal" d="${path}" fill="${color}" /></svg>`;
        const svg = el.querySelector('svg');
        if (svg) svg.style.transform = `rotate(${rotation}deg)`;

        // housekeeping
        current.activeCount = (current.activeCount || 0) + 1;
        blossomHandles.set(section, current);

        // remove after animation
        el.addEventListener('animationend', () => {
            try { el.remove(); } catch (e) {}
            const h = blossomHandles.get(section);
            if (h) { h.activeCount = Math.max(0, h.activeCount - 1); }
        }, { once: true });

        // Position relative to the viewport and append to the body so blossoms are never clipped
        const rect = section.getBoundingClientRect();
        const leftPx = Math.round(rect.left + (left/100) * rect.width);
        const topPx = Math.round(rect.top + (startTop/100) * rect.height);
        el.style.position = 'fixed';
        el.style.left = `${leftPx}px`;
        el.style.top = `${topPx}px`;
        // Tag blossom with originating section so we can selectively clear them later
        if (section.id) {
            el.dataset.section = section.id;
        }
        document.body.appendChild(el);
    }

    function startBlossoms(section) {
        if (prefersReducedMotion) return;
        const existing = blossomHandles.get(section);
        if (existing && existing.intervalId) return; // already running

        if (BLOSSOM_DEBUG) console.info('startBlossoms:', section.id || section.className);

        // initial burst (bigger burst for stronger effect)
        for (let i = 0; i < 6; i++) {
            setTimeout(() => spawnBlossomForSection(section), i * 120);
        }

        // continuous spawn with jitter (more frequent)
        const intervalId = setInterval(() => {
            spawnBlossomForSection(section);
        }, 300 + Math.random() * 700);

        // store interval and clear any pending cleanup timeout
        const handle = {
            intervalId,
            activeCount: (existing && existing.activeCount) ? existing.activeCount : 6,
            cleanupTimeout: existing ? existing.cleanupTimeout : null
        };
        if (handle.cleanupTimeout) { clearTimeout(handle.cleanupTimeout); handle.cleanupTimeout = null; }
        blossomHandles.set(section, handle);
    }

    function stopBlossoms(section) {
        const handle = blossomHandles.get(section);
        if (handle && handle.intervalId) {
            clearInterval(handle.intervalId);
            handle.intervalId = null;
        }
        // schedule a delayed cleanup rather than immediately removing blossoms so any in-flight animations remain visible
        if (handle) {
            if (handle.cleanupTimeout) clearTimeout(handle.cleanupTimeout);
            handle.cleanupTimeout = setTimeout(() => {
                const existing = Array.from(document.querySelectorAll(`.blossom[data-section="${section.id}"]`));
                existing.forEach(el => el.remove());
                blossomHandles.delete(section);
                if (BLOSSOM_DEBUG) console.debug('cleanupBlossoms executed for:', section.id || section.className);
            }, 12000); // 12s allows animations to finish
            blossomHandles.set(section, handle);
        } else {
            // if no handle, still attempt a gentle cleanup after a short delay
            setTimeout(() => {
                const existing = Array.from(document.querySelectorAll('.blossom'));
                existing.forEach(el => el.remove());
            }, 12000);
        }

        if (BLOSSOM_DEBUG) console.info('stopBlossoms (scheduled cleanup):', section.id || section.className);
    }

    function setupBlossomObserver() {
        if (blossomObserver) return; // already created
        if (prefersReducedMotion) return; // do not enable if user prefers reduced motion

        blossomObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const sec = entry.target;
                if (entry.isIntersecting) {
                    startBlossoms(sec);
                } else {
                    stopBlossoms(sec);
                }
            });
        }, { root: null, rootMargin: '0px 0px -30% 0px', threshold: 0.25 });

        const sections = document.querySelectorAll('.parallax-group');
        sections.forEach(s => blossomObserver.observe(s));
        if (BLOSSOM_DEBUG) console.debug('setupBlossomObserver: observing', sections.length, 'sections');
        if (BLOSSOM_DEBUG) console.debug('observed section ids:', Array.from(sections).map(s => s.id || s.className));
    }

    function teardownBlossomObserver() {
        if (!blossomObserver) return;
        blossomObserver.disconnect();
        blossomObserver = null;
        // stop any remaining spawners
        document.querySelectorAll('.parallax-group').forEach(stopBlossoms);
    }

    // Debug helper to force-show a few blossoms in a section for visual testing
    function forceShowTestBlossom(section, count = 6) {
        if (!section || prefersReducedMotion) return;
        if (BLOSSOM_DEBUG) console.warn('forceShowTestBlossom: injecting', count, 'blossoms into', section.id || section.className);
        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnBlossomForSection(section), i * 150);
        }
    }

    // Extend the parallax guard to start/stop blossom behavior depending on viewport
    function initializeParallaxGuard() {
        if (window.innerWidth > 768) {
            enableJSParallax();
            setupBlossomObserver();
            // If debugging, show a quick test burst once to confirm visuals
            if (BLOSSOM_DEBUG && !blossomTestShown) {
                const first = document.querySelector('.parallax-group');
                if (first) {
                    forceShowTestBlossom(first, 8);
                    blossomTestShown = true;
                }
            }
        } else {
            disableJSParallax();
            teardownBlossomObserver();
        }
    }

    // Initial call after all parallax & blossom helpers are declared
    initializeParallaxGuard();

});