(function() {
    const bottomItems = [
        { icon: '🌙', label: 'Луна', path: 'index.html' },
        { icon: '🏃', label: 'Марафон', path: 'marathon.html' },
        { icon: '🏆', label: 'Рейтинг', path: 'rating.html' },
        { icon: '👤', label: 'Профиль', path: 'profile.html' }
    ];

    const drawerItems = [
        { icon: '🎓', label: 'Курсы', path: 'courses.html' },
        { icon: '✨', label: 'Желания', path: 'wishes.html' },
        { icon: '🌿', label: 'Образ жизни', path: 'lifestyle.html' },
        { icon: '📅', label: 'Задачи', path: 'planner.html' },
        { icon: '🎲', label: 'И Цзин', path: 'dice.html' }
    ];

    function getCurrentPage() {
        const filename = window.location.pathname.split('/').pop() || 'index.html';
        return filename === '' ? 'index.html' : filename;
    }

    function createNav() {
        const currentPage = getCurrentPage();
        const isDrawerPage = drawerItems.some(i => i.path === currentPage);

        // Стили drawer и overlay
        const style = document.createElement('style');
        style.textContent = `
            .nav-drawer-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.55);
                z-index: 1000;
                backdrop-filter: blur(2px);
            }
            .nav-drawer-overlay.open { display: block; }

            .nav-drawer {
                position: fixed;
                left: 0; top: 0; bottom: 0;
                width: 240px;
                background: #0d0b1e;
                border-right: 1px solid rgba(161,140,209,0.2);
                z-index: 1001;
                transform: translateX(-100%);
                transition: transform 0.28s cubic-bezier(.4,0,.2,1);
                padding: 24px 0 40px;
                display: flex;
                flex-direction: column;
            }
            .nav-drawer.open { transform: translateX(0); }

            .nav-drawer-title {
                font-size: 11px;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: rgba(161,140,209,0.5);
                padding: 0 20px 16px;
                border-bottom: 1px solid rgba(161,140,209,0.1);
                margin-bottom: 8px;
            }

            .nav-drawer-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 20px;
                color: #c8d0db;
                text-decoration: none;
                font-size: 15px;
                transition: background 0.15s;
                border-left: 3px solid transparent;
            }
            .nav-drawer-item:hover { background: rgba(161,140,209,0.08); }
            .nav-drawer-item.active {
                color: #a18cd1;
                border-left-color: #a18cd1;
                background: rgba(161,140,209,0.1);
            }
            .nav-drawer-item .drawer-icon { font-size: 20px; width: 28px; text-align: center; }

            .mobile-bottom-nav .menu-btn {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 3px;
                background: none;
                border: none;
                color: #888;
                font-size: 11px;
                cursor: pointer;
                padding: 6px 0;
                transition: color 0.2s;
                -webkit-tap-highlight-color: transparent;
            }
            .mobile-bottom-nav .menu-btn.active { color: #a18cd1; }
            .mobile-bottom-nav .menu-btn .nav-icon { font-size: 20px; }
        `;
        document.head.appendChild(style);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'nav-drawer-overlay';
        overlay.onclick = closeDrawer;
        document.body.appendChild(overlay);

        // Drawer
        const drawer = document.createElement('div');
        drawer.className = 'nav-drawer';
        drawer.innerHTML = `<div class="nav-drawer-title">Разделы</div>`;
        drawerItems.forEach(item => {
            const a = document.createElement('a');
            a.href = item.path;
            a.className = 'nav-drawer-item' + (item.path === currentPage ? ' active' : '');
            a.innerHTML = `<span class="drawer-icon">${item.icon}</span><span>${item.label}</span>`;
            drawer.appendChild(a);
        });

        // Кнопка выхода внизу drawer
        const logoutBtn = document.createElement('button');
        logoutBtn.innerHTML = `<span class="drawer-icon">🚪</span><span>Выйти</span>`;
        logoutBtn.className = 'nav-drawer-item';
        logoutBtn.style.cssText = 'width:100%; text-align:left; background:none; border:none; border-top:1px solid rgba(161,140,209,0.15); color:#888; cursor:pointer; margin-top:auto; padding-bottom:80px;';
        logoutBtn.onclick = () => {
            firebase.auth().signOut().then(() => {
                window.location.href = 'login.html';
            });
        };
        drawer.appendChild(logoutBtn);

        document.body.appendChild(drawer);

        // Bottom nav
        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';

        bottomItems.forEach(item => {
            const a = document.createElement('a');
            a.href = item.path;
            a.className = 'mobile-nav-item' + (item.path === currentPage ? ' active' : '');
            a.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
            nav.appendChild(a);
        });

        // Кнопка ☰
        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-btn' + (isDrawerPage ? ' active' : '');
        menuBtn.innerHTML = `<span class="nav-icon">☰</span><span>Меню</span>`;
        menuBtn.onclick = toggleDrawer;
        nav.appendChild(menuBtn);

        document.body.appendChild(nav);

        function toggleDrawer() {
            const open = drawer.classList.toggle('open');
            overlay.classList.toggle('open', open);
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }

        // Закрыть по Escape
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createNav);
    } else {
        createNav();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();
