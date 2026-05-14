const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

// Проверка здоровья приложения
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Приложение запущено на порту ${PORT}`);
});
