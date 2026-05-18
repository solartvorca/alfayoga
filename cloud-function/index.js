const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Инициализация Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'yog-ava-tho'
    });
}
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Настройки Gmail (используй переменные окружения)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

// Функция отправки тестового письма
app.post('/sendTestEmail', async (req, res) => {
    try {
        const { email, nick } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email не указан' });
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: '🌙 Тестовое уведомление — Лунный Будильник',
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0e27; color: #e0e6ed; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(180, 100, 255, 0.08); padding: 30px; border-radius: 12px; border: 1px solid rgba(180, 100, 255, 0.2);">
                        <h2 style="color: #a18cd1; text-align: center;">🌙 Лунный Будильник</h2>

                        <p>Привет, <strong>${nick || 'участник'}</strong>!</p>

                        <p>Это тестовое уведомление от приложения <strong>"Лунный Будильник"</strong>.</p>

                        <p style="color: #00d084;">✓ Если вы получили это письмо, система уведомлений работает правильно!</p>

                        <div style="background: rgba(161, 140, 209, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #a18cd1;"><strong>Скоро вы будете получать:</strong></p>
                            <ul style="color: #c8d0db; margin: 10px 0 0 0;">
                                <li>Ежедневные напоминания о практике</li>
                                <li>Задания марафона</li>
                                <li>Уведомления о комментариях</li>
                                <li>Передачи лучиков</li>
                            </ul>
                        </div>

                        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                            © Йога Царевича — Марафон осознанности
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Письмо отправлено успешно' });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Функция отправки напоминания о практике
app.post('/sendPracticeReminder', async (req, res) => {
    try {
        const { email, nick, time } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email не указан' });
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: '🧘 Напоминание о практике — Лунный Будильник',
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0e27; color: #e0e6ed; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(180, 100, 255, 0.08); padding: 30px; border-radius: 12px; border: 1px solid rgba(180, 100, 255, 0.2);">
                        <h2 style="color: #a18cd1; text-align: center;">🧘 Время практики</h2>

                        <p>Привет, <strong>${nick || 'участник'}</strong>!</p>

                        <p>⏰ Сейчас <strong>${time || '7:00'}</strong> — время для дыхания и медитации.</p>

                        <div style="background: rgba(0, 208, 132, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="color: #00d084; font-size: 18px; margin: 0;">Откройте приложение и начните практику</p>
                            <p style="color: #888; margin: 10px 0 0 0;">10-15 минут осознанного дыхания</p>
                        </div>

                        <p style="color: #c8d0db;">Регулярная практика развивает концентрацию и внутренний покой. Давайте вместе!</p>

                        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                            © Йога Царевича — Марафон осознанности
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Напоминание отправлено' });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Функция отправки задания марафона
app.post('/sendMarathonTask', async (req, res) => {
    try {
        const { email, nick, dayNum, taskContent } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email не указан' });
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: `📖 День ${dayNum} марафона — Лунный Будильник`,
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0e27; color: #e0e6ed; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(180, 100, 255, 0.08); padding: 30px; border-radius: 12px; border: 1px solid rgba(180, 100, 255, 0.2);">
                        <h2 style="color: #a18cd1; text-align: center;">📖 Марафон "Йога Царевича"</h2>

                        <p>Привет, <strong>${nick || 'участник'}</strong>!</p>

                        <div style="background: rgba(161, 140, 209, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #ffd700; font-size: 16px; margin: 0 0 10px 0;"><strong>День ${dayNum}</strong></p>
                            <p style="color: #c8d0db; margin: 0; line-height: 1.6;">${taskContent || 'Проверьте приложение для просмотра задания'}</p>
                        </div>

                        <p style="color: #00d084;">✓ Выполните задание и отправьте отчёт для получения лучиков!</p>

                        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                            © Йога Царевича — Марафон осознанности
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Задание отправлено' });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Отправка рассылки сразу всем пользователям
app.post('/sendMailingDirect', async (req, res) => {
    try {
        const { emails, message, subject } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: 'Email адреса не указаны' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Сообщение не указано' });
        }

        let sent = 0;
        let failed = 0;
        const errors = [];

        for (const email of emails) {
            try {
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: subject || '🌙 Сообщение от администратора — Лунный Будильник',
                    html: `
                        <div style="font-family: Arial, sans-serif; background: #0a0e27; color: #e0e6ed; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background: rgba(180, 100, 255, 0.08); padding: 30px; border-radius: 12px; border: 1px solid rgba(180, 100, 255, 0.2);">
                                <h2 style="color: #a18cd1; text-align: center;">🌙 Лунный Будильник</h2>
                                <div style="color: #c8d0db; line-height: 1.6; white-space: pre-wrap; margin: 20px 0;">
                                    ${message}
                                </div>
                                <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                                    © Йога Царевича — Марафон осознанности
                                </p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                sent++;
                console.log(`✓ Письмо отправлено: ${email}`);
            } catch (error) {
                failed++;
                errors.push(`${email}: ${error.message}`);
                console.error(`✗ Ошибка отправки ${email}:`, error.message);
            }
        }

        res.status(200).json({
            success: true,
            sent,
            failed,
            total: emails.length,
            errors: failed > 0 ? errors : []
        });
    } catch (error) {
        console.error('Ошибка отправки рассылки:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ежедневная проверка и удаление пользователей без отчёта (в 00:00 MSK = 21:00 UTC)
app.post('/checkAndRemoveUsersWithoutReport', async (req, res) => {
    try {
        console.log('[Daily Check] Starting daily report check...');

        const db = admin.firestore();

        // Вычисляем текущий лунный день
        const fullMoonDateStr = await db.collection("settings").doc("lunar").get()
            .then(doc => doc?.data()?.fullMoonDate?.toDate?.() || new Date(2026, 4, 2))
            .catch(() => new Date(2026, 4, 2));

        const lunarCycleDays = 29.5;
        const now = new Date();
        const daysSinceFullMoon = (now - fullMoonDateStr) / (1000 * 60 * 60 * 24);
        const cycleDays = daysSinceFullMoon % lunarCycleDays;
        const currentLunarDay = Math.floor(cycleDays) + 1;

        console.log(`[Daily Check] Current lunar day: ${currentLunarDay}`);

        // Получить всех пользователей
        const usersSnapshot = await db.collection("users").get();
        let removedCount = 0;
        let activeCount = 0;
        const batch = db.batch();

        // Проверить каждого пользователя
        usersSnapshot.docs.forEach(doc => {
            const user = doc.data();
            const lastReportDay = user.lastReportDay || 0;
            const currentStatus = user.status || "active";
            const isAdmin = user.email === "wuallar@gmail.com" || user.isAdmin;

            // Администратор не может быть исключен
            if (isAdmin) {
                console.log(`[Daily Check] Skipping admin ${user.email} - admins cannot be removed`);
                activeCount++;
                return;
            }

            // Новые пользователи без отчётов — проверяем по дате регистрации
            if (lastReportDay === 0) {
                const joinedAt = user.joinedAt?.toDate?.() || null;
                if (!joinedAt) {
                    activeCount++;
                    return;
                }
                const fullMoonDate = new Date(2026, 4, 2);
                const daysSinceFullMoon = (joinedAt - fullMoonDate) / (1000 * 60 * 60 * 24);
                const joinedLunarDay = Math.floor(Math.abs(daysSinceFullMoon) % 29.5) + 1;
                // Если прошло больше 1 дня с регистрации и отчёт так и не написан
                if (currentLunarDay <= joinedLunarDay + 1) {
                    activeCount++;
                    return;
                }
                // Иначе исключаем
            }

            // Если пользователь активен и пропустил отчёт за ВЧЕРАШНИЙ день
            if (currentStatus === "active" && (lastReportDay === 0 || lastReportDay < currentLunarDay - 1)) {
                console.log(`[Daily Check] Removing ${user.nick || user.email} (last report: ${lastReportDay}, current day: ${currentLunarDay})`);

                batch.update(doc.ref, {
                    status: "removed",
                    removedAt: new Date(),
                    removedReason: "missed_daily_report",
                    removedDay: currentLunarDay
                });
                removedCount++;
            } else if (currentStatus === "active") {
                activeCount++;
            }
        });

        // Выполнить все обновления
        await batch.commit();

        const message = `✓ Daily check completed! Removed: ${removedCount}, Active: ${activeCount}`;
        console.log(`[Daily Check] ${message}`);

        res.status(200).json({
            success: true,
            message,
            removedCount,
            activeCount,
            currentLunarDay,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Daily Check] Error:', error);
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Проверка кода подтверждения email
app.post('/verifyEmailCode', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email и код обязательны' });
        }

        const db = admin.firestore();
        const doc = await db.collection('email_verifications').doc(email).get();

        if (!doc.exists) {
            return res.status(400).json({ error: 'Код не найден или истек' });
        }

        const data = doc.data();
        const now = new Date();

        // Проверка срока действия кода
        if (now > data.expiresAt.toDate()) {
            return res.status(400).json({ error: 'Код истек. Запроси новый код.' });
        }

        // Проверка количества попыток (максимум 5)
        if (data.attempts >= 5) {
            return res.status(400).json({ error: 'Слишком много неверных попыток. Запроси новый код.' });
        }

        // Проверка кода
        if (data.code !== code) {
            // Увеличиваем количество попыток
            await db.collection('email_verifications').doc(email).update({
                attempts: data.attempts + 1
            });
            return res.status(400).json({ error: 'Неверный код подтверждения' });
        }

        // Код верный - удаляем запись
        await db.collection('email_verifications').doc(email).delete();

        res.status(200).json({
            success: true,
            message: 'Email подтвержден успешно'
        });
    } catch (error) {
        console.error('Ошибка проверки кода:', error);
        res.status(500).json({ error: error.message });
    }
});

// Отправка кода подтверждения email для регистрации
app.post('/sendVerificationCode', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email не указан' });
        }

        // Генерируем 6-значный код
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в Firestore с TTL 15 минут
        const db = admin.firestore();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.collection('email_verifications').doc(email).set({
            code: verificationCode,
            createdAt: new Date(),
            expiresAt: expiresAt,
            attempts: 0
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: '🔐 Код подтверждения — Лунный Будильник',
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0e27; color: #e0e6ed; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: rgba(180, 100, 255, 0.08); padding: 30px; border-radius: 12px; border: 1px solid rgba(180, 100, 255, 0.2);">
                        <h2 style="color: #a18cd1; text-align: center;">🔐 Подтверждение email</h2>

                        <p>Привет!</p>

                        <p>Вы зарегистрировались на <strong>"Лунный Будильник"</strong>.</p>

                        <div style="background: rgba(161, 140, 209, 0.15); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="color: #888; margin: 0 0 10px 0; font-size: 12px;">Ваш код подтверждения:</p>
                            <p style="color: #ffd700; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${verificationCode}</p>
                            <p style="color: #888; margin: 10px 0 0 0; font-size: 12px;">Код действителен 15 минут</p>
                        </div>

                        <p style="color: #c8d0db;">Если это были не вы, проигнорируйте это письмо.</p>

                        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                            © Йога Царевича — Марафон осознанности
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Код подтверждения отправлен',
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Ошибка отправки кода:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка здоровья приложения
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Приложение запущено на порту ${PORT}`);
});
