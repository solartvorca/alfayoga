(function() {
    const navItems = [
        { icon: '🌙', label: 'Луна', path: 'index.html' },
        { icon: '🏃', label: 'Марафон', path: 'marathon.html' },
        { icon: '👤', label: 'Профиль', path: 'profile.html' },
        { icon: '✨', label: 'Желания', path: 'wishes.html' },
        { icon: '📋', label: 'Привычки', path: 'habits.html' },
        { icon: '📅', label: 'Задачи', path: 'planner.html' },
        { icon: '🔔', label: 'Уведомления', path: 'notifications.html' }
    ];

    function getCurrentPage() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        return filename === '' ? 'index.html' : filename;
    }

    function createBottomNav() {
        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';

        const currentPage = getCurrentPage();

        const links = navItems.map(item => {
            const link = document.createElement('a');
            link.href = item.path;
            link.className = 'mobile-nav-item';
            if (item.path === currentPage || (item.path === 'index.html' && currentPage === '')) {
                link.classList.add('active');
            }
            link.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
            return link;
        });

        links.forEach(link => nav.appendChild(link));
        document.body.appendChild(nav);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBottomNav);
    } else {
        createBottomNav();
    }
})();
