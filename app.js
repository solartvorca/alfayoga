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
    alarmInterval: (parseInt(localStorage.getItem('alarmIntervalSeconds')) || 600) * 1000,
    soundDuration: parseFloat(localStorage.getItem('alarmSoundDuration')) || 3,
    mode: localStorage.getItem('alarmMode') || (isMobileDevice() ? 'vibration' : 'sound'),
    soundType: localStorage.getItem('alarmSoundType') || 'bowl',
    isSoundPlaying: false,
};

// Определение мобильного устройства
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function _parseLocalDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d); // локальная полночь, не UTC
}

let lunarState = {
    fullMoonDate: localStorage.getItem('fullMoonDate') ? _parseLocalDate(localStorage.getItem('fullMoonDate')) : new Date(2026, 4, 2),
    lunarCycleDays: 29.5,
};

// UI элементы
const inhalInput = document.getElementById('inhale');
const holdAfterInhaleInput = document.getElementById('holdAfterInhale');
const exhaleInput = document.getElementById('exhale');
const holdAfterExhaleInput = document.getElementById('holdAfterExhale');
const alarmToggle = document.getElementById('alarmToggle');
const alarmMessage = document.getElementById('alarmMessage');
const alarmIntervalInput = document.getElementById('alarmInterval');
const alarmIntervalDisplay = document.getElementById('alarmIntervalDisplay');
const alarmDurationInput = document.getElementById('alarmDuration');
const alarmModeSelect = document.getElementById('alarmMode');
const alarmSoundSelect = document.getElementById('alarmSound');
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

// Обновление интервала будильника из input
function updateAlarmInterval() {
    if (!alarmIntervalInput) return;
    const seconds = parseInt(alarmIntervalInput.value) || 600;
    alarmState.alarmInterval = seconds * 1000;
    if (alarmIntervalDisplay) {
        alarmIntervalDisplay.textContent = seconds;
    }
    localStorage.setItem('alarmIntervalSeconds', seconds);
    console.log(`[Alarm] Интервал обновлен: ${seconds}с`);
}

// Обновление длительности звука будильника
function updateAlarmDuration() {
    if (!alarmDurationInput) return;
    const duration = parseFloat(alarmDurationInput.value) || 3;
    alarmState.soundDuration = duration;
    localStorage.setItem('alarmSoundDuration', duration);
    console.log(`[Alarm] Длительность звука обновлена: ${duration}с`);
}

// Обновление режима будильника
function updateAlarmMode() {
    if (!alarmModeSelect) return;
    const mode = alarmModeSelect.value;
    alarmState.mode = mode;
    localStorage.setItem('alarmMode', mode);
}

// Обновление типа звука будильника
function updateAlarmSound() {
    if (!alarmSoundSelect) return;
    alarmState.soundType = alarmSoundSelect.value;
    localStorage.setItem('alarmSoundType', alarmSoundSelect.value);
}

if (inhalInput) inhalInput.addEventListener('change', updateBreathingParams);
if (holdAfterInhaleInput) holdAfterInhaleInput.addEventListener('change', updateBreathingParams);
if (exhaleInput) exhaleInput.addEventListener('change', updateBreathingParams);
if (holdAfterExhaleInput) holdAfterExhaleInput.addEventListener('change', updateBreathingParams);
if (alarmIntervalInput) alarmIntervalInput.addEventListener('change', updateAlarmInterval);
if (alarmIntervalInput) alarmIntervalInput.addEventListener('input', updateAlarmInterval);
if (alarmDurationInput) alarmDurationInput.addEventListener('change', updateAlarmDuration);
if (alarmDurationInput) alarmDurationInput.addEventListener('input', updateAlarmDuration);
if (alarmModeSelect) alarmModeSelect.addEventListener('change', updateAlarmMode);
if (alarmSoundSelect) alarmSoundSelect.addEventListener('change', updateAlarmSound);

// Загрузить сохраненные настройки будильника из localStorage
if (alarmIntervalInput) {
    const savedInterval = localStorage.getItem('alarmIntervalSeconds');
    if (savedInterval) {
        alarmIntervalInput.value = savedInterval;
        updateAlarmInterval();
    }
}
if (alarmDurationInput) {
    const savedDuration = localStorage.getItem('alarmSoundDuration');
    if (savedDuration) {
        alarmDurationInput.value = savedDuration;
        updateAlarmDuration();
    }
}
if (alarmModeSelect) {
    const savedMode = localStorage.getItem('alarmMode') || (isMobileDevice() ? 'vibration' : 'sound');
    alarmModeSelect.value = savedMode;
    alarmState.mode = savedMode;
}
if (alarmSoundSelect) {
    const savedSound = localStorage.getItem('alarmSoundType') || 'bowl';
    alarmSoundSelect.value = savedSound;
    alarmState.soundType = savedSound;
}

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

    // Отладка: логируем каждые 60 секунд
    if (now % 60000 < 500) {
        console.log(`[Alarm Check] Time since last: ${Math.floor(timeSinceLastAlarm / 1000)}s / ${Math.floor(alarmState.alarmInterval / 1000)}s`);
    }

    if (timeSinceLastAlarm >= alarmState.alarmInterval) {
        console.log(`[Alarm Triggered] Time since last: ${Math.floor(timeSinceLastAlarm / 1000)}s`);
        triggerAlarm();
        alarmState.lastAlarmTime = now;
    }
}

// Триггер будильника
function triggerAlarm() {
    // Защита от дублирующихся срабатываний
    if (alarmState.isSoundPlaying) {
        console.log('[Alarm] Sound already playing, ignoring duplicate trigger');
        return;
    }

    alarmState.isSoundPlaying = true;
    const mode = alarmState.mode;
    console.log(`[Alarm] Triggered with mode: ${mode}`);

    // Воспроизводить звук если режим - звук или оба
    if (mode === 'sound' || mode === 'both') {
        playAlarmSound();
    }

    showAlarmMessage();

    // Очень длинный cooldown на мобильных (10 сек), на десктопе достаточно 3 сек
    const cooldown = isMobileDevice() ? 10000 : 3000;

    setTimeout(() => {
        alarmState.isSoundPlaying = false;
        console.log(`[Alarm] Cooldown завершен (${cooldown}ms), разрешено новое срабатывание`);
    }, cooldown);

    // Вибрация если режим - вибрация или оба
    if ((mode === 'vibration' || mode === 'both') && navigator.vibrate) {
        try {
            console.log('[Vibration] Attempting vibration pattern');
            navigator.vibrate([200, 100, 200, 100, 200]);
            console.log('[Vibration] Vibration triggered successfully');
        } catch (err) {
            console.error('[Vibration] Error:', err);
        }
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
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => _dispatchAlarmSound(ctx));
        } else {
            _dispatchAlarmSound(ctx);
        }
    } catch (err) {
        console.error('Audio error:', err);
    }
}

function _dispatchAlarmSound(ctx) {
    if (alarmState.soundType === 'cuckoo') {
        playCuckooMp3(ctx);
    } else {
        playAlarmSoundInternal(ctx);
    }
}

let _cuckooBuffer = null;

async function _loadCuckooBuffer(ctx) {
    if (_cuckooBuffer) return _cuckooBuffer;
    try {
        const resp = await fetch('kukuet-kukushka.mp3');
        const arr  = await resp.arrayBuffer();
        _cuckooBuffer = await ctx.decodeAudioData(arr);
    } catch(e) { console.warn('Cuckoo load error:', e); }
    return _cuckooBuffer;
}

async function playCuckooMp3(ctx) {
    const buffer = await _loadCuckooBuffer(ctx);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    const stopAt = alarmState.soundDuration;
    if (stopAt < buffer.duration) {
        source.stop(ctx.currentTime + stopAt);
    }
}

// Поющая чаша (оригинальный звук)
function playAlarmSoundInternal(audioContext) {
    const now = audioContext.currentTime;
    const duration = alarmState.soundDuration;
    const halfDuration = duration / 2;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(528, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + halfDuration);
    osc.start(now);
    osc.stop(now + halfDuration);

    const osc2 = audioContext.createOscillator();
    osc2.connect(gain);
    osc2.frequency.setValueAtTime(432, now + halfDuration + 0.1);
    gain.gain.setValueAtTime(0.3, now + halfDuration + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc2.start(now + halfDuration + 0.1);
    osc2.stop(now + duration);
}

// Показ сообщения будильника
function showAlarmMessage() {
    if (!alarmNotification) return;

    // Показать уведомление
    alarmNotification.classList.add('show');

    // Обновить время последнего срабатывания
    const timeEl = document.getElementById('alarmMessage');
    if (timeEl) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        timeEl.textContent = `⏰ Будильник сработал в ${timeStr}`;
        timeEl.style.color = '#ffd700';
    }

    // Убрать через 3 сек
    setTimeout(() => {
        alarmNotification.classList.remove('show');
    }, 3000);

    // Убрать сообщение через 5 сек
    setTimeout(() => {
        if (timeEl) timeEl.textContent = '';
    }, 5000);
}

// Основной цикл анимации
function animate(timestamp) {
    updateBreathingAnimation(timestamp);
    drawMoon();
    requestAnimationFrame(animate);
}

// Инициализация
updateBreathingParams();
requestAnimationFrame(animate);

// Проверка будильника отдельно (каждые 1000ms = 1 сек для надежности на мобильных)
setInterval(() => {
    try {
        checkAlarm();
    } catch (err) {
        console.error('[Alarm] Error in checkAlarm:', err);
    }
}, 1000);

// Логирование статуса будильника каждые 10 секунд
setInterval(() => {
    if (!alarmState.enabled) return;

    const now = Date.now();
    const timeSinceLastAlarm = now - alarmState.lastAlarmTime;
    const timeRemaining = alarmState.alarmInterval - timeSinceLastAlarm;

    console.log(`[Alarm Monitor] Enabled: true, Time remaining: ${Math.floor(timeRemaining / 1000)}s, Last trigger: ${new Date(alarmState.lastAlarmTime).toLocaleTimeString('ru-RU')}`);
}, 10000);

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
