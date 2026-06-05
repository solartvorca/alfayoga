// Проверка состояния аутентификации
function checkAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Пользователь авторизован
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (!userDoc.exists) {
                // Нет профиля — на login.html (только если не уже там)
                if (!window.location.pathname.includes("login.html")) {
                    window.location.href = "login.html";
                }
                return;
            } else {
                // Уже зарегистрирован
                window.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                };

                // Миграция: dustAmount -> dust (один раз при входе)
                if (window.currentUser.dustAmount && !window.currentUser.dust) {
                    const migratedDust = window.currentUser.dustAmount;
                    window.currentUser.dust = migratedDust;
                    window.currentUser.dustAmount = 0;
                    db.collection("users").doc(user.uid).update({
                        dust: migratedDust,
                        dustAmount: firebase.firestore.FieldValue.delete()
                    }).catch(() => {});
                }

                // Проверить статус марафона на всех страницах
                checkMarathonStatus();

                // Ежедневная манна активным участникам
                claimDailyManna();

                // Если пользователь удалён - перенаправить на removed.html
                const currentPath = window.location.pathname.split('/').pop();
                const allowedForRemoved = ['removed.html', 'login.html'];
                if (window.currentUser.status === 'removed' && !allowedForRemoved.includes(currentPath)) {
                    window.location.href = 'removed.html';
                    return;
                }
            }
        } else {
            // Не авторизован - перенаправить на login
            if (!window.location.pathname.includes("login.html") &&
                !window.location.pathname.includes("index.html") &&
                !window.location.pathname.includes("welcome.html")) {
                window.location.href = "login.html";
            }
        }
    });
}

// Проверка статуса в марафоне
async function checkMarathonStatus() {
    const user = window.currentUser;
    if (!user) return;

    // Администраторов не исключаем
    if (user.isAdmin || user.email === "wuallar@gmail.com") return;

    // Уже исключён — не проверяем
    if (user.status === "removed") return;

    // Премиум-участники не исключаются автоматически
    if (user.status === "premium") return;

    // Недавно восстановлен администратором — даём 48 часов на отчёт
    if (user.restoredAt) {
        const restoredDate = user.restoredAt.toDate ? user.restoredAt.toDate() : new Date(user.restoredAt);
        const hoursSinceRestore = (Date.now() - restoredDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceRestore < 48) return;
    }

    const today = getLunarDay();
    const lastReport = user.lastReportDay || 0;

    let shouldRemove = false;

    if (lastReport === 0) {
        // Пользователь ещё не писал отчётов — проверяем по дате регистрации
        const joinedAt = user.joinedAt?.toDate ? user.joinedAt.toDate() : (user.joinedAt ? new Date(user.joinedAt) : null);
        if (joinedAt) {
            const fullMoonDate = new Date(localStorage.getItem('fullMoonDate') || new Date(2026, 4, 2));
            const daysSinceFullMoon = (joinedAt - fullMoonDate) / (1000 * 60 * 60 * 24);
            const joinedLunarDay = Math.floor(Math.abs(daysSinceFullMoon) % 29.5) + 1;
            // Если прошло больше 1 дня с регистрации и отчёт так и не написан
            if (today > joinedLunarDay + 1) {
                shouldRemove = true;
            }
        }
    } else {
        // Если пропустил день — вывести из марафона
        if (today > lastReport + 1) {
            shouldRemove = true;
        }
    }

    if (shouldRemove) {
        // Дели-участники: используем пропуск вместо исключения
        if (user.subscription === "daily") {
            const skipsUsed = user.premiumSkips || 0;
            if (skipsUsed < 5) {
                const today2 = getLunarDay();
                await db.collection("users").doc(user.uid).update({
                    premiumSkips: firebase.firestore.FieldValue.increment(1),
                    lastReportDay: today2 - 1
                });
                window.currentUser.premiumSkips = skipsUsed + 1;
                window.currentUser.lastReportDay = today2 - 1;
                return;
            }
            // Все 5 пропусков использованы — исключаем
        }

        await db.collection("users").doc(user.uid).update({
            status: "removed"
        });
        user.status = "removed";
        showRemovalNotice();
    }
}

// Ежедневная манна: 1 в день для активных участников
async function claimDailyManna() {
    const user = window.currentUser;
    if (!user) return;
    if (user.status === 'removed') return;

    const today = new Date().toISOString().slice(0, 10);
    if (user.lastMannaDate === today) return;

    try {
        await db.collection('users').doc(user.uid).update({
            manna: firebase.firestore.FieldValue.increment(1),
            lastMannaDate: today
        });
        user.manna = (user.manna || 0) + 1;
        user.lastMannaDate = today;
    } catch (e) {
        console.warn('[Daily Manna] Ошибка:', e);
    }
}

// Уведомление о вывале из марафона
function showRemovalNotice() {
    const notice = document.getElementById("removalNotice");
    if (notice) {
        notice.style.display = "block";
    }
}

// Выход
function logout() {
    console.log("Logout function called");

    if (typeof auth === 'undefined') {
        console.error("Firebase auth not initialized");
        alert("Ошибка: Firebase не инициализирован. Перезагрузи страницу.");
        return;
    }

    auth.signOut()
        .then(() => {
            console.log("Logged out successfully");
            // Очистить localStorage/sessionStorage если нужно
            window.location.href = "login.html";
        })
        .catch(error => {
            console.error("Logout error:", error);
            alert("Ошибка выхода: " + error.message + ". Попробуй перезагрузить страницу.");
        });
}

// Debug функция для проверки реферальных кодов (вызывать из консоли)
window.debugReferralCode = async (code) => {
    if (!code) {
        console.error("Укажи код: debugReferralCode('R844MNVW')");
        return null;
    }
    console.log(`Проверяю реферальный код: ${code}`);
    try {
        const snapshot = await db.collection("users")
            .where("referralCode", "==", code.toUpperCase())
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const user = snapshot.docs[0].data();
            console.log(`✓ Код найден! Пользователь:`, user);
            console.log(`  Email: ${user.email}`);
            console.log(`  Ник: ${user.nick}`);
            console.log(`  Текущие лучики: ${user.rays}`);
            console.log(`  Лучики от рефералов: ${user.referralRays}`);
            console.log(`  Количество приведенных: ${user.totalReferrals}`);
            return user;
        } else {
            console.error(`✗ Код ${code} не найден в базе`);
            return null;
        }
    } catch (error) {
        console.error("[Referral Debug] Ошибка:", error);
        return null;
    }
};

checkAuth();
