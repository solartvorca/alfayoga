const AI_BOT_NICK = '🌙 Лунный ИИ';
const AI_BOT_UID = 'ai_bot';

let _aiSettings = null;

async function loadAISettings() {
    if (_aiSettings !== null) return _aiSettings;
    try {
        const doc = await db.collection('settings').doc('ai').get();
        _aiSettings = doc.exists ? doc.data() : {};
    } catch (e) {
        _aiSettings = {};
    }
    return _aiSettings;
}

const FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-flash-1.5-8b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen2.5-72b-instruct:free',
    'mistralai/mistral-7b-instruct:free'
];

async function callAI(messages, maxTokens = 250) {
    const settings = await loadAISettings();
    if (!settings.enabled || !settings.apiKey) return null;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Радуга Луна'
            },
            body: JSON.stringify({
                models: FREE_MODELS,
                route: 'fallback',
                messages,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
        console.warn('[AI] Ошибка:', e);
        return null;
    }
}

async function postAIReactionToReport(reportId, reportText) {
    const text = await callAI([
        {
            role: 'system',
            content: 'Ты — добрый и игривый ИИ-помощник марафона "Радуга Луна". Пиши коротко: 1-2 предложения. Тёплый, поддерживающий тон с лёгким юмором. Только по-русски.'
        },
        {
            role: 'user',
            content: `Участник написал отчёт о своей практике: "${reportText}"\n\nНапиши добрую реакцию или лёгкую шутку в 1-2 предложения.`
        }
    ]);

    if (!text) return;

    await db.collection('comments').add({
        reportId,
        uid: AI_BOT_UID,
        nick: AI_BOT_NICK,
        text,
        isAI: true,
        createdAt: new Date()
    });
}

async function postAIReactionToComment(reportId, commentText) {
    const text = await callAI([
        {
            role: 'system',
            content: 'Ты — добрый и игривый ИИ-помощник марафона "Радуга Луна". Пиши коротко: 1-2 предложения. Тёплый тон с лёгким юмором. Только по-русски.'
        },
        {
            role: 'user',
            content: `В марафоне участник написал комментарий: "${commentText}"\n\nНапиши лёгкую, добрую реакцию.`
        }
    ]);

    if (!text) return;

    await db.collection('comments').add({
        reportId,
        uid: AI_BOT_UID,
        nick: AI_BOT_NICK,
        text,
        isAI: true,
        createdAt: new Date()
    });
}

async function getAIDiceInterpretation(entry) {
    return await callAI([
        {
            role: 'system',
            content: 'Ты — мудрый и вдохновляющий толкователь И Цзин и Генных Ключей. Дай краткое персональное толкование: 3-4 предложения. Говори от второго лица ("ты"). Только по-русски.'
        },
        {
            role: 'user',
            content: `Выпала позиция И Цзин:\n- Гексаграмма: ${entry.wilhelm || ''}\n- Линия: ${entry.line}, Ворота: ${entry.gates}\n- Генный ключ — Тень: ${entry.shadow || '—'}, Дар: ${entry.gift || '—'}, Сиддхи: ${entry.siddhi || '—'}\n- Рейв: ${entry.rave || ''}\n\nДай личное толкование для практика.`
        }
    ], 450);
}

async function postAIDailyReport(dayNumber, assignmentTitle, assignmentContent) {
    const settings = await loadAISettings();
    if (!settings.enabled || !settings.apiKey) return;

    const existing = await db.collection('reports').doc(`${dayNumber}_ai`).get();
    if (existing.exists) return;

    const text = await callAI([
        {
            role: 'system',
            content: 'Ты — ИИ-помощник марафона "Радуга Луна". Напиши вдохновляющий отчёт о дне практики. Обязательно включи конкретное научное исследование (автор, год, вывод), которое подтверждает пользу этой практики. Длина: 5-7 предложений. Только по-русски.'
        },
        {
            role: 'user',
            content: `День ${dayNumber}: "${assignmentTitle}"\nОписание: "${assignmentContent}"\n\nНапиши отчёт о практике с научным обоснованием.`
        }
    ], 600);

    if (!text) return;

    await db.collection('reports').doc(`${dayNumber}_ai`).set({
        uid: AI_BOT_UID,
        nick: AI_BOT_NICK,
        dayNumber,
        text,
        isAI: true,
        createdAt: new Date()
    });
}
