// Проверка состояния аутентификации
function checkAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Пользователь авторизован
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (!userDoc.exists) {
                // Первый вход - перенаправить на регистрацию профиля
                window.location.href = "login.html?register=" + user.uid;
            } else {
                // Уже зарегистрирован
                window.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                };

                // Проверить статус на marathon.html
                if (window.location.pathname.includes("marathon.html")) {
                    checkMarathonStatus();
                }

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
                !window.location.pathname.includes("index.html")) {
                window.location.href = "login.html";
            }
        }
    });
}

// Проверка статуса в марафоне
async function checkMarathonStatus() {
    const user = window.currentUser;
    if (!user) return;

    const today = getLunarDay();
    const lastReport = user.lastReportDay || 0;

    // Если пропустил день - вывести из марафона
    if (today > lastReport + 1) {
        await db.collection("users").doc(user.uid).update({
            status: "removed"
        });
        user.status = "removed";
        showRemovalNotice();
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
