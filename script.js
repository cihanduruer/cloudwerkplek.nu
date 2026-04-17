// === Navigation & Section Management ===
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const hero = document.querySelector('.hero');
    const quickLinks = document.querySelector('.quick-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const cards = document.querySelectorAll('.card[data-nav]');
    const searchInput = document.getElementById('searchInput');

    function showSection(sectionId) {
        // Toggle hero and quick links
        if (sectionId === 'home') {
            hero.style.display = '';
            quickLinks.style.display = '';
            sections.forEach(s => s.classList.add('hidden'));
        } else {
            hero.style.display = 'none';
            quickLinks.style.display = 'none';
            sections.forEach(s => {
                s.classList.toggle('hidden', s.id !== sectionId);
            });
        }

        // Update nav links
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Close mobile menu
        nav.classList.remove('open');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
            history.pushState(null, '', `#${link.dataset.section}`);
        });
    });

    // Card clicks
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(card.dataset.nav);
            history.pushState(null, '', `#${card.dataset.nav}`);
        });
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    // Handle initial hash
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'home') {
        showSection(hash);
    }

    // Handle back/forward
    window.addEventListener('popstate', () => {
        const h = window.location.hash.replace('#', '') || 'home';
        showSection(h);
    });

    // === Accordion ===
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const isActive = btn.classList.contains('active');

            // Close others in same accordion
            const accordion = btn.closest('.accordion');
            accordion.querySelectorAll('.accordion-btn').forEach(b => {
                b.classList.remove('active');
                b.nextElementSibling.classList.remove('active');
            });

            if (!isActive) {
                btn.classList.add('active');
                content.classList.add('active');
            }
        });
    });

    // === Search ===
    const searchableItems = [];
    document.querySelectorAll('.guide-block').forEach(block => {
        const section = block.closest('.content-section') || block.closest('section');
        const sectionId = section ? section.id : '';
        const title = block.querySelector('h3')?.textContent || '';
        const text = block.textContent || '';
        searchableItems.push({ sectionId, title, text, element: block });
    });

    // Also index accordion items
    document.querySelectorAll('.accordion-item').forEach(item => {
        const section = item.closest('.content-section');
        const sectionId = section ? section.id : '';
        const title = item.querySelector('.accordion-btn')?.textContent || '';
        const text = item.textContent || '';
        searchableItems.push({ sectionId, title, text, element: item });
    });

    let searchResultsDiv = null;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (!searchResultsDiv) {
            searchResultsDiv = document.createElement('div');
            searchResultsDiv.className = 'search-results';
            searchResultsDiv.id = 'searchResults';
            hero.parentNode.insertBefore(searchResultsDiv, hero.nextSibling);
        }

        if (query.length < 2) {
            searchResultsDiv.style.display = 'none';
            // Show quick links when not searching
            quickLinks.style.display = '';
            return;
        }

        // Hide quick links during search
        quickLinks.style.display = 'none';
        sections.forEach(s => s.classList.add('hidden'));

        const results = searchableItems.filter(item =>
            item.text.toLowerCase().includes(query)
        );

        // Deduplicate by title
        const seen = new Set();
        const unique = results.filter(r => {
            if (seen.has(r.title)) return false;
            seen.add(r.title);
            return true;
        });

        if (unique.length === 0) {
            searchResultsDiv.innerHTML = '<div class="no-results">Geen resultaten gevonden. Probeer andere zoektermen.</div>';
        } else {
            const sectionNames = {
                avd: 'Cloud Werkplek',
                teams: 'Microsoft Teams',
                office: 'Office 365',
                sharepoint: 'SharePoint',
                faq: 'Veelgestelde vragen'
            };

            searchResultsDiv.innerHTML = `<h3>🔍 Zoekresultaten (${unique.length})</h3>` +
                unique.slice(0, 10).map(r => `
                    <div class="search-result-item" data-section="${r.sectionId}" data-title="${r.title}">
                        <h4>${r.title}</h4>
                        <p>${sectionNames[r.sectionId] || ''}</p>
                    </div>
                `).join('');

            searchResultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    showSection(item.dataset.section);
                    searchInput.value = '';
                    searchResultsDiv.style.display = 'none';
                    quickLinks.style.display = 'none';
                    history.pushState(null, '', `#${item.dataset.section}`);
                });
            });
        }

        searchResultsDiv.style.display = '';
    });
});
