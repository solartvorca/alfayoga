(function () {
    const SIDEBAR_WIDTH = '220px';

    const allItems = [
        { icon: '🌙', label: 'Будильник',          path: 'index.html' },
        { icon: '📖', label: 'Марафон',             path: 'marathon.html' },
        { icon: '📚', label: 'База',                path: 'base.html' },
        { icon: '🌬️', label: 'Марафон дыхания',    path: 'marathon-breath.html' },
        { icon: '🧬', label: 'Клет. трансформация', path: 'marathon-cell.html' },
        null,
        { icon: '👤', label: 'Профиль',             path: 'profile.html' },
        { icon: '🏆', label: 'Рейтинг',             path: 'rating.html' },
        { icon: '🎓', label: 'Курсы',               path: 'courses.html' },
        { icon: '✨', label: 'Желания',             path: 'wishes.html' },
        { icon: '🌿', label: 'Образ жизни',         path: 'lifestyle.html' },
        { icon: '📅', label: 'Планировщик',         path: 'planner.html' },
        { icon: '🎲', label: 'И Цзин',              path: 'dice.html' },
        { icon: '🌙', label: 'Сновидения',          path: 'profile.html?tab=dreams' },
        { icon: '🔮', label: 'Предназначение',      path: 'profile.html?tab=destiny' },
    ];

    function getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function isActive(itemPath) {
        const current = getCurrentPage();
        const search = window.location.search;
        if (itemPath.includes('?')) {
            return window.location.href.includes(itemPath.split('?')[1]);
        }
        return itemPath === current;
    }

    function createSidebar() {
        const style = document.createElement('style');
        style.textContent = `
            @media (min-width: 641px) {
                #userNav { display: none !important; }
                .mobile-bottom-nav { display: none !important; }
                .nav-drawer, .nav-drawer-overlay { display: none !important; }
                body { padding-left: ${SIDEBAR_WIDTH} !important; }
                .desktop-sidebar { display: flex !important; }
            }
            @media (max-width: 640px) {
                .desktop-sidebar { display: none !important; }
            }

            .desktop-sidebar {
                display: none;
                flex-direction: column;
                position: fixed;
                top: 0; left: 0; bottom: 0;
                width: ${SIDEBAR_WIDTH};
                background: #0d0b1e;
                border-right: 1px solid rgba(161,140,209,0.18);
                z-index: 900;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 16px 0 24px;
                box-sizing: border-box;
            }
            .desktop-sidebar::-webkit-scrollbar { width: 4px; }
            .desktop-sidebar::-webkit-scrollbar-thumb { background: rgba(161,140,209,0.25); border-radius: 2px; }

            .dsb-logo {
                padding: 8px 18px 18px;
                font-size: 13px;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: rgba(161,140,209,0.45);
                border-bottom: 1px solid rgba(161,140,209,0.1);
                margin-bottom: 6px;
            }

            .dsb-item {
                display: flex;
                align-items: center;
                gap: 11px;
                padding: 10px 18px;
                color: #b8c2cc;
                text-decoration: none;
                font-size: 13.5px;
                cursor: pointer;
                border-left: 3px solid transparent;
                transition: background 0.15s, color 0.15s;
                white-space: nowrap;
                overflow: hidden;
            }
            .dsb-item:hover {
                background: rgba(161,140,209,0.08);
                color: #e0e6ed;
            }
            .dsb-item.active {
                color: #a18cd1;
                border-left-color: #a18cd1;
                background: rgba(161,140,209,0.1);
                font-weight: 600;
            }
            .dsb-icon {
                font-size: 18px;
                width: 24px;
                text-align: center;
                flex-shrink: 0;
            }

            .dsb-divider {
                height: 1px;
                background: rgba(161,140,209,0.1);
                margin: 8px 18px;
            }

            .dsb-bottom {
                margin-top: auto;
                padding-top: 12px;
                border-top: 1px solid rgba(161,140,209,0.1);
            }

            .dsb-logout {
                display: flex;
                align-items: center;
                gap: 11px;
                padding: 10px 18px;
                color: rgba(255,100,100,0.7);
                font-size: 13.5px;
                cursor: pointer;
                border-left: 3px solid transparent;
                transition: background 0.15s, color 0.15s;
                background: none;
                border-top: none;
                border-right: none;
                border-bottom: none;
                width: 100%;
                text-align: left;
            }
            .dsb-logout:hover {
                background: rgba(255,100,100,0.08);
                color: #ff6464;
            }
        `;
        document.head.appendChild(style);

        const sidebar = document.createElement('nav');
        sidebar.className = 'desktop-sidebar';

        // Logo/title
        const logo = document.createElement('div');
        logo.className = 'dsb-logo';
        logo.textContent = '🌙 Навигация';
        sidebar.appendChild(logo);

        // Nav items
        allItems.forEach(item => {
            if (!item) {
                const div = document.createElement('div');
                div.className = 'dsb-divider';
                sidebar.appendChild(div);
                return;
            }
            const a = document.createElement('a');
            a.href = item.path;
            a.className = 'dsb-item' + (isActive(item.path) ? ' active' : '');
            a.innerHTML = `<span class="dsb-icon">${item.icon}</span><span>${item.label}</span>`;
            sidebar.appendChild(a);
        });

        // Admin link (hidden by default)
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.className = 'dsb-item' + (isActive('admin.html') ? ' active' : '');
        adminLink.id = 'dsbAdminLink';
        adminLink.style.display = 'none';
        adminLink.innerHTML = `<span class="dsb-icon">⚙️</span><span>Администратор</span>`;

        // Bottom section
        const bottom = document.createElement('div');
        bottom.className = 'dsb-bottom';
        bottom.appendChild(adminLink);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'dsb-logout';
        logoutBtn.innerHTML = `<span class="dsb-icon">🚪</span><span>Выход</span>`;
        logoutBtn.onclick = () => {
            firebase.auth().signOut().then(() => { window.location.href = 'login.html'; });
        };
        bottom.appendChild(logoutBtn);
        sidebar.appendChild(bottom);

        document.body.appendChild(sidebar);

        // Mirror admin link visibility from #adminLink
        function syncAdminLink() {
            const orig = document.getElementById('adminLink');
            if (!orig) return;
            const visible = orig.style.display !== 'none' && orig.style.display !== '';
            adminLink.style.display = visible ? 'flex' : 'none';
        }

        // Watch for DOMContentLoaded then observe
        function startObserving() {
            const orig = document.getElementById('adminLink');
            if (orig) {
                syncAdminLink();
                new MutationObserver(syncAdminLink).observe(orig, { attributes: true, attributeFilter: ['style'] });
            } else {
                // Try again shortly in case #adminLink isn't rendered yet
                setTimeout(startObserving, 300);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserving);
        } else {
            startObserving();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSidebar);
    } else {
        createSidebar();
    }
})();
