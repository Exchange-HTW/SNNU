document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const dockItems = document.querySelectorAll('.dock-item');
    const sections = document.querySelectorAll('.demo-section');
    const newsContainer = document.getElementById('news-container');

    // Navigation Logic
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all dock items
            dockItems.forEach(d => d.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            // Hide all sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Show target section
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Specific logic for sections
            if (targetId === 'section-news' && newsContainer.children.length === 1) {
                // If it's the first time visiting the editor section, fetch news
                fetchMockNews();
            }
        });
    });

    // Mock WordPress API Fetch
    function fetchMockNews() {
        // Simulate network delay
        setTimeout(() => {
            const mockData = [
                {
                    date: 'MAY 20, 2026',
                    title: 'Philipp Flotho Successfully Defends Doctoral Dissertation',
                    excerpt: 'The Systems Neuroscience & Neurotechnology Unit (SNNU) is proud to announce that Philipp Flotho has successfully defended his doctoral dissertation exploring groundbreaking approaches at the intersection of computer vision and systems neuroscience.'
                },
                {
                    date: 'MAY 20, 2026',
                    title: 'CDNS @ Europe Day 2026',
                    excerpt: 'The Center for Digital Neurotechnologies Saar (CDNS) participated in Europe Day 2026, showcasing innovative research and technology projects alongside numerous regional and international initiatives.'
                },
                {
                    date: 'MAY 19, 2026',
                    title: 'SNNU & htwsaar @ g.tec BCI Hackathon 2026',
                    excerpt: 'Seventeen students from the Master’s program Neural Engineering took part in the event, where they were challenged to conceptualize and develop a brain-computer interface within just 24 hours.'
                }
            ];

            // Clear spinner
            newsContainer.innerHTML = '';

            // Render news cards
            mockData.forEach((news, index) => {
                const card = document.createElement('div');
                card.className = 'news-card melted-3d-card';
                card.style.animationDelay = `${index * 0.15}s`;
                card.innerHTML = `
                    <div class="news-date">${news.date}</div>
                    <div class="news-title">${news.title}</div>
                    <div class="news-excerpt">${news.excerpt}</div>
                `;
                newsContainer.appendChild(card);
            });
        }, 1200); // 1.2s fake delay
    }

    // Modal Logic for People Section
    const personModal = document.getElementById('person-modal');
    const personCards = document.querySelectorAll('.person-card');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');

    if (personModal) {
        personCards.forEach(card => {
            card.addEventListener('click', () => {
                const name = card.getAttribute('data-name');
                const role = card.getAttribute('data-role');
                if (modalName && modalRole) {
                    modalName.textContent = name;
                    modalRole.textContent = role;
                }
                personModal.classList.add('active');
            });
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                personModal.classList.remove('active');
            });
        }

        // Close on outside click
        personModal.addEventListener('click', (e) => {
            if (e.target === personModal) {
                personModal.classList.remove('active');
            }
        });
    }

    // Navbar Toggle Position Logic
    const togglePosBtn = document.getElementById('dock-pos-toggle');
    const floatingDock = document.getElementById('floating-dock');
    if (togglePosBtn && floatingDock) {
        togglePosBtn.addEventListener('click', () => {
            floatingDock.classList.toggle('dock-top');
            
            // Optionally, change the icon based on position
            const icon = togglePosBtn.querySelector('i');
            if (floatingDock.classList.contains('dock-top')) {
                // If it's at the top, point down
                icon.className = 'fa-solid fa-arrow-down';
            } else {
                // If it's at the bottom, point up
                icon.className = 'fa-solid fa-arrow-up';
            }
        });
    }

});
