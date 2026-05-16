// Инициализация
const canvas = document.getElementById('moonCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let breathingState = {
    inhale: 4,
    holdAfterInhale: 0,
    exhale: 4,
    holdAfterExhale: 0,
    phase: 'inhale',
    progress: 0,
    scale: 0.7,
    isBreathing: true,
};

let alarmState = {
    enabled: true,
    lastAlarmTime: Date.now(),
    alarmInterval: 10 * 60 * 1000,
};

let lunarState = {
    fullMoonDate: localStorage.getItem('fullMoonDate') ? new Date(localStorage.getItem('fullMoonDate')) : new Date(2026, 4, 2),
    lunarCycleDays: 29.5,
};

// UI элементы
const inhalInput = document.getElementById('inhale');
const holdAfterInhaleInput = document.getElementById('holdAfterInhale');
const exhaleInput = document.getElementById('exhale');
const holdAfterExhaleInput = document.getElementById('holdAfterExhale');
const alarmToggle = document.getElementById('alarmToggle');
const alarmMessage = document.getElementById('alarmMessage');
const lunarDaySpan = document.getElementById('lunarDay');
const lunarPhaseSpan = document.getElementById('lunarPhase');
const alarmNotification = document.getElementById('alarmNotification');

// Обновление параметров дыхания из input
function updateBreathingParams() {
    if (!inhalInput) return;
    breathingState.inhale = parseInt(inhalInput.value) || 4;
    breathingState.holdAfterInhale = parseInt(holdAfterInhaleInput.value) || 0;
    breathingState.exhale = parseInt(exhaleInput.value) || 4;
    breathingState.holdAfterExhale = parseInt(holdAfterExhaleInput.value) || 0;
}

if (inhalInput) inhalInput.addEventListener('change', updateBreathingParams);
if (holdAfterInhaleInput) holdAfterInhaleInput.addEventListener('change', updateBreathingParams);
if (exhaleInput) exhaleInput.addEventListener('change', updateBreathingParams);
if (holdAfterExhaleInput) holdAfterExhaleInput.addEventListener('change', updateBreathingParams);

// Будильник
if (alarmToggle) alarmToggle.addEventListener('change', (e) => {
    alarmState.enabled = e.target.checked;
    if (alarmState.enabled) {
        alarmState.lastAlarmTime = Date.now();
        if (alarmMessage) alarmMessage.textContent = '';
    }
});

// Функция расчета дня лунного цикла
function getLunarDay() {
    const now = new Date();
    const daysSinceFullMoon = (now - lunarState.fullMoonDate) / (1000 * 60 * 60 * 24);
    const cycleDays = daysSinceFullMoon % lunarState.lunarCycleDays;
    const lunarDay = Math.floor(cycleDays) + 1;
    return lunarDay > 29 ? 1 : lunarDay;
}

// Определение фазы луны
function getLunarPhase(day) {
    if (day === 1 || day > 28) return 'Полнолуние';
    if (day <= 7) return 'Растущая луна';
    if (day === 8) return 'Первая четверть';
    if (day <= 14) return 'Убывающая луна';
    if (day === 15) return 'Новолуние';
    if (day <= 21) return 'Растущая луна';
    if (day === 22) return 'Третья четверть';
    return 'Убывающая луна';
}

// Визуализация лунной фазы (0 = полнолуние, 0.5 = новолуние, 1 = полнолуние)
function getLunarPhaseValue(day) {
    const phase = (day - 1) / lunarState.lunarCycleDays;
    return phase > 1 ? phase - 1 : phase;
}

// Рисование луны на Canvas
function drawMoon() {
    if (!canvas || !ctx) return;

    const radius = 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Применение масштаба дыхания
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(breathingState.scale, breathingState.scale);
    ctx.translate(-centerX, -centerY);

    // Основной шар луны
    const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 10, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 245, 200, 0.9)');
    gradient.addColorStop(0.7, 'rgba(220, 180, 100, 0.8)');
    gradient.addColorStop(1, 'rgba(150, 100, 50, 0.7)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Текстура луны
    ctx.fillStyle = 'rgba(100, 80, 60, 0.15)';
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 0.8;
        const size = Math.random() * 8 + 3;
        ctx.beginPath();
        ctx.arc(
            centerX + Math.cos(angle) * distance,
            centerY + Math.sin(angle) * distance,
            size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Эффект лунной фазы (затемнение на убывающей луне)
    const phaseValue = getLunarPhaseValue(getLunarDay());
    if (phaseValue > 0.25) {
        const shadowIntensity = Math.max(0, (phaseValue - 0.25) / 0.5);
        ctx.fillStyle = `rgba(10, 14, 39, ${shadowIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // Текущий день и фаза луны
    const lunarDay = getLunarDay();
    const phase = getLunarPhase(lunarDay);
    if (lunarDaySpan) lunarDaySpan.textContent = lunarDay;
    if (lunarPhaseSpan) lunarPhaseSpan.textContent = phase;
}

// Анимация дыхания
let animationStartTime = 0;
let currentPhaseStartTime = 0;

function updateBreathingAnimation(timestamp) {
    if (animationStartTime === 0) {
        animationStartTime = timestamp;
        currentPhaseStartTime = timestamp;
    }

    const totalCycleDuration =
        (breathingState.inhale +
            breathingState.holdAfterInhale +
            breathingState.exhale +
            breathingState.holdAfterExhale) * 1000;

    const cycleElapsed = (timestamp - currentPhaseStartTime) % totalCycleDuration;
    const inhaleDuration = breathingState.inhale * 1000;
    const holdAfterInhaleDuration = breathingState.holdAfterInhale * 1000;
    const exhaleDuration = breathingState.exhale * 1000;

    let newPhase = breathingState.phase;
    let progress = 0;

    if (cycleElapsed < inhaleDuration) {
        newPhase = 'inhale';
        progress = cycleElapsed / inhaleDuration;
        breathingState.scale = 0.7 + progress * 0.25;
    } else if (cycleElapsed < inhaleDuration + holdAfterInhaleDuration) {
        newPhase = 'hold-inhale';
        breathingState.scale = 0.95;
    } else if (cycleElapsed < inhaleDuration + holdAfterInhaleDuration + exhaleDuration) {
        newPhase = 'exhale';
        progress = (cycleElapsed - inhaleDuration - holdAfterInhaleDuration) / exhaleDuration;
        breathingState.scale = 0.95 - progress * 0.25;
    } else {
        newPhase = 'hold-exhale';
        breathingState.scale = 0.7;
    }

    breathingState.phase = newPhase;
    breathingState.progress = progress;
}

// Проверка будильника
function checkAlarm() {
    if (!alarmState.enabled) return;

    const now = Date.now();
    const timeSinceLastAlarm = now - alarmState.lastAlarmTime;

    if (timeSinceLastAlarm >= alarmState.alarmInterval) {
        triggerAlarm();
        alarmState.lastAlarmTime = now;
    }
}

// Триггер будильника
function triggerAlarm() {
    playAlarmSound();
    showAlarmMessage();

    // Вибрация на мобильных (если доступна)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Браузерное уведомление (если разрешено)
    if (Notification && Notification.permission === 'granted') {
        new Notification('🔔 Будильник', {
            body: 'Что осознаёт этот сон?',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" text-anchor="middle" dy=".3em" font-size="80">🌙</text></svg>'
        });
    }
}

// Глобальный AudioContext (для мобильных)
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Возобновить звук при взаимодействии пользователя
function resumeAudioContext() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(err => console.warn('AudioContext resume failed:', err));
    }
}

// Слушаем первое взаимодействие пользователя (может быть несколько раз на мобильных)
document.addEventListener('click', resumeAudioContext);
document.addEventListener('touchstart', resumeAudioContext);

// Пытаемся возобновить AudioContext при загрузке страницы
window.addEventListener('focus', resumeAudioContext);

// Звук будильника (Web Audio API)
function playAlarmSound() {
    try {
        const audioContext = getAudioContext();

        // Возобновить если был suspended (на мобильных)
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                playAlarmSoundInternal(audioContext);
            });
        } else {
            playAlarmSoundInternal(audioContext);
        }
    } catch (err) {
        console.error('Audio error:', err);
    }
}

function playAlarmSoundInternal(audioContext) {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(528, now);
    osc.frequency.setValueAtTime(528, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);

    // Вторая волна
    const osc2 = audioContext.createOscillator();
    osc2.connect(gain);
    osc2.frequency.setValueAtTime(432, now + 0.6);
    gain.gain.setValueAtTime(0.3, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
    osc2.start(now + 0.6);
    osc2.stop(now + 1.1);
}

// Показ сообщения будильника
function showAlarmMessage() {
    if (!alarmNotification) return;
    alarmNotification.classList.add('show');
    setTimeout(() => {
        alarmNotification.classList.remove('show');
    }, 3000);
}

// Основной цикл анимации
function animate(timestamp) {
    updateBreathingAnimation(timestamp);
    checkAlarm();
    drawMoon();
    requestAnimationFrame(animate);
}

// Инициализация
updateBreathingParams();
requestAnimationFrame(animate);

// Подстраховка: проверка будильника через setInterval на мобильных (где requestAnimationFrame может тормозиться)
// Проверяем каждые 500ms для более надежной работы на мобильных
setInterval(checkAlarm, 500);

// Запросить разрешение на браузерные уведомления
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Получить текущий марафон
async function getCurrentMarathon() {
    try {
        const snapshot = await db.collection("marathons").where("isCurrent", "==", true).limit(1).get();
        if (!snapshot.empty) {
            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            };
        }
        // Если нет текущего, вернуть первый
        const allMarathons = await db.collection("marathons").limit(1).get();
        if (!allMarathons.empty) {
            return {
                id: allMarathons.docs[0].id,
                ...allMarathons.docs[0].data()
            };
        }
        return null;
    } catch (error) {
        console.error("Ошибка при получении текущего марафона:", error);
        return null;
    }
}

// Получить день марафона
async function getMarathonDay(marathonId, dayNumber) {
    try {
        const doc = await db.collection("marathons").doc(marathonId)
            .collection("days").doc(dayNumber.toString()).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error("Ошибка при получении дня марафона:", error);
        return null;
    }
}
