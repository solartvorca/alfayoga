(function () {
    // Первый ряд — основные разделы
    const row1 = [
        { icon: '🌙', label: 'Будильник',       path: 'index.html' },
        { icon: '📖', label: 'Марафон',          path: 'marathon.html' },
        { icon: '📚', label: 'База',             path: 'base.html' },
        { icon: '🌬️', label: 'Дыхание',         path: 'marathon-breath.html' },
        { icon: '🧬', label: 'Клетки',           path: 'marathon-cell.html' },
        { icon: '👤', label: 'Профиль',          path: 'profile.html' },
        { icon: '🏆', label: 'Рейтинг',          path: 'rating.html' },
        { icon: '🎓', label: 'Курсы',            path: 'courses.html' },
        { icon: '✨', label: 'Желания',          path: 'wishes.html' },
    ];

    // Второй ряд — дополнительные
    const row2 = [
        { icon: '🌿', label: 'Образ жизни',     path: 'lifestyle.html' },
        { icon: '📋', label: 'Привычки',         path: 'habits.html' },
        { icon: '📅', label: 'Планировщик',      path: 'planner.html' },
        { icon: '🔔', label: 'Уведомления',      path: 'notifications.html' },
        { icon: '🎲', label: 'И Цзин',           path: 'dice.html' },
        { icon: '🌙', label: 'Сновидения',       path: 'profile.html?tab=dreams' },
        { icon: '🔮', label: 'Предназначение',   path: 'profile.html?tab=destiny' },
    ];

    function getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function isActive(itemPath) {
        const current = getCurrentPage();
        if (itemPath.includes('?')) {
            return window.location.search && window.location.href.includes(itemPath.split('?')[1]);
        }
        return itemPath === current;
    }

    function makeLink(item) {
        const a = document.createElement('a');
        a.href = item.path;
        a.className = 'dtn-link' + (isActive(item.path) ? ' active' : '');
        a.innerHTML = `<span class="dtn-icon">${item.icon}</span><span class="dtn-label">${item.label}</span>`;
        return a;
    }

    function createTopNav() {
        const style = document.createElement('style');
        style.textContent = `
            @media (min-width: 641px) {
                #userNav { display: none !important; }
                .mobile-bottom-nav { display: none !important; }
                .nav-drawer, .nav-drawer-overlay { display: none !important; }
                body { padding-top: 88px !important; padding-left: 20px !important; }
                .desktop-topnav { display: block !important; }
            }
            @media (max-width: 640px) {
                .desktop-topnav { display: none !important; }
            }

            .desktop-topnav {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0;
                background: rgba(13, 11, 30, 0.97);
                border-bottom: 1px solid rgba(161,140,209,0.2);
                backdrop-filter: blur(12px);
                z-index: 900;
                padding: 0 16px;
                box-sizing: border-box;
            }

            .dtn-row {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 42px;
                overflow: hidden;
            }

            .dtn-row-1 {
                border-bottom: 1px solid rgba(161,140,209,0.1);
            }

            .dtn-link {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 5px 9px;
                color: rgba(200, 208, 219, 0.75);
                text-decoration: none;
                font-size: 12.5px;
                border-radius: 6px;
                white-space: nowrap;
                transition: background 0.15s, color 0.15s;
                flex-shrink: 0;
            }
            .dtn-link:hover {
                background: rgba(161,140,209,0.1);
                color: #e0e6ed;
            }
            .dtn-link.active {
                background: rgba(161,140,209,0.15);
                color: #a18cd1;
                font-weight: 600;
            }
            .dtn-icon { font-size: 15px; }

            .dtn-sep {
                flex: 1;
            }

            .dtn-admin-link {
                display: none;
            }

            .dtn-logout {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 5px 9px;
                background: none;
                border: 1px solid rgba(255,100,100,0.25);
                border-radius: 6px;
                color: rgba(255,100,100,0.7);
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                flex-shrink: 0;
                transition: all 0.15s;
            }
            .dtn-logout:hover {
                background: rgba(255,100,100,0.1);
                color: #ff6464;
            }
        `;
        document.head.appendChild(style);

        const nav = document.createElement('nav');
        nav.className = 'desktop-topnav';

        // Row 1
        const r1 = document.createElement('div');
        r1.className = 'dtn-row dtn-row-1';
        row1.forEach(item => r1.appendChild(makeLink(item)));
        r1.appendChild(Object.assign(document.createElement('div'), { className: 'dtn-sep' }));

        // Admin link (hidden until auth confirms admin)
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.className = 'dtn-link dtn-admin-link' + (isActive('admin.html') ? ' active' : '');
        adminLink.id = 'dtnAdminLink';
        adminLink.innerHTML = `<span class="dtn-icon">⚙️</span><span class="dtn-label">Администратор</span>`;
        r1.appendChild(adminLink);

        // Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'dtn-logout';
        logoutBtn.innerHTML = `🚪 Выход`;
        logoutBtn.onclick = () => {
            firebase.auth().signOut().then(() => { window.location.href = 'login.html'; });
        };
        r1.appendChild(logoutBtn);

        // Row 2
        const r2 = document.createElement('div');
        r2.className = 'dtn-row dtn-row-2';
        row2.forEach(item => r2.appendChild(makeLink(item)));

        nav.appendChild(r1);
        nav.appendChild(r2);
        document.body.appendChild(nav);

        // Mirror admin link visibility
        function syncAdminLink() {
            const orig = document.getElementById('adminLink');
            if (!orig) return;
            const visible = orig.style.display !== 'none' && orig.style.display !== '';
            adminLink.style.display = visible ? 'flex' : 'none';
        }

        function startObserving() {
            const orig = document.getElementById('adminLink');
            if (orig) {
                syncAdminLink();
                new MutationObserver(syncAdminLink).observe(orig, { attributes: true, attributeFilter: ['style'] });
            } else {
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
        document.addEventListener('DOMContentLoaded', createTopNav);
    } else {
        createTopNav();
    }
})();
