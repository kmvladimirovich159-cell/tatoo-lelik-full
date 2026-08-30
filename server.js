require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const axios = require("axios");

const app = express();

const PORT = Number(process.env.PORT || 3000);

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Создаём необходимые папки и файл
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

// Статика
app.use(express.static(__dirname));
app.use("/uploads", express.static(UPLOADS_DIR));

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, UPLOADS_DIR);
  },

  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}${ext}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Чтение заявок
function readAppointments() {
  try {
    return JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8") || "[]"
    );
  } catch {
    return [];
  }
}

// ========================================
// ОТПРАВКА УВЕДОМЛЕНИЯ В VK
// ========================================

async function sendVkNotification(a) {
  console.log("📨 Начинаю отправку сообщения в VK...");

  console.log(
    "VK_GROUP_TOKEN:",
    process.env.VK_GROUP_TOKEN ? "ЕСТЬ" : "НЕТ"
  );

  console.log(
    "VK_ADMIN_ID:",
    process.env.VK_ADMIN_ID || "НЕТ"
  );

  // Проверяем настройки VK
  if (
    !process.env.VK_GROUP_TOKEN ||
    !process.env.VK_ADMIN_ID
  ) {
    console.log("❌ Нет токена или VK ID в файле .env");
    return false;
  }

  const message = `
🖤 НОВАЯ ЗАЯВКА НА ТАТУ

👤 Имя: ${a.name}
📞 Телефон: ${a.phone}
📅 Дата: ${a.date}
🎨 Стиль: ${a.style}

💬 Идея:
${a.idea}

${
  a.reference
    ? `🖼 Референс сохранён: ${a.reference}`
    : "🖼 Референс: нет"
}
`;

  try {
    const response = await axios.post(
      "https://api.vk.com/method/messages.send",
      null,
      {
        params: {
          access_token: process.env.VK_GROUP_TOKEN,
          v: process.env.VK_API_VERSION || "5.199",
          random_id: Math.floor(
            Math.random() * 2147483647
          ),
          user_id: process.env.VK_ADMIN_ID,
          message: message
        }
      }
    );

    console.log("📩 Ответ VK:");
    console.log(response.data);

    // VK может вернуть ошибку внутри response.data
    if (response.data && response.data.error) {
      console.log(
        "❌ VK вернул ошибку:",
        response.data.error
      );

      return false;
    }

    console.log("✅ Сообщение успешно отправлено в VK!");

    return true;

  } catch (error) {
    console.log("❌ ОШИБКА VK:");

    console.log(
      error.response?.data || error.message
    );

    return false;
  }
}

// ========================================
// ПОЛУЧЕНИЕ НОВОЙ ЗАЯВКИ
// ========================================

app.post(
  "/api/appointment",
  upload.single("reference"),
  async (req, res) => {

    console.log("🔥 ПОЛУЧЕНА НОВАЯ ЗАЯВКА!");
    console.log(req.body);

    const {
      name,
      phone,
      date,
      style,
      idea
    } = req.body || {};

    // Проверяем обязательные поля
    if (
      !name ||
      !phone ||
      !date ||
      !style ||
      !idea
    ) {
      return res.status(400).json({
        ok: false,
        message: "Заполните все обязательные поля."
      });
    }

    // Создаём заявку
    const appointment = {
      id: crypto.randomUUID(),

      createdAt: new Date().toISOString(),

      name: String(name).trim(),

      phone: String(phone).trim(),

      date: String(date),

      style: String(style),

      idea: String(idea).trim(),

      reference: req.file
        ? `/uploads/${req.file.filename}`
        : null,

      status: "new"
    };

    // Сохраняем заявку
    const items = readAppointments();

    items.unshift(appointment);

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(items, null, 2),
      "utf8"
    );

    console.log("💾 Заявка сохранена:", appointment.id);

    // Отправляем уведомление в VK
    await sendVkNotification(appointment);

    // Отвечаем сайту
    return res.json({
      ok: true,

      message:
        "Спасибо! Ваша заявка принята. Мастер свяжется с вами для подтверждения. ✦"
    });
  }
);

// ========================================
// ЗАПУСК СЕРВЕРА
// ========================================

app.listen(PORT, () => {
  console.log("");
  console.log("=================================");
  console.log(`🖤 Сайт запущен: http://localhost:${PORT}`);
  console.log("=================================");
  console.log("");
});