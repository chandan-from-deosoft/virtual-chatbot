const db = require("../connectDB.js");

export const getWelcomeData = async (req, res) => {
  try {
    const result = await db.pool.query("SELECT * FROM chat_data WHERE id = 1");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const getChatData = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await db.pool.query(
      `SELECT * FROM chat_data WHERE id = $1`, // Use parameterized query
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const getOptionsData = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await db.pool.query(
      `SELECT * FROM chat_options WHERE chat_data_id = $1`, // Use parameterized query
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
