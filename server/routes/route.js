const express = require("express");
const chatController = require("../controllers/chatController.js");

const router = express.Router();

// router.post("/appointment-status", getAppointmentStatus);
// router.get("/working-hours", getWorkingHours);
// router.get("/medical-tests", getMedicalTests);
// router.post("/chat", chat);
// router.get("/chat/data", getChatData);

router.get("/chat/welcome", getWelcomeData);
router.get("/chats/message/get/:chatId", getChatData);
router.get("/chats/options/get/:chatId", getOptionsData);

export default router;
