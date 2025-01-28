require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

// Create an Express application
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

//serve public files
app.use(express.static(path.join(__dirname, "../public")));

// Serve index.html on the root route

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index-backup.html"));
});

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getWelcomeData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM chat_messages WHERE id = 1");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getMainMenuData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM chat_messages WHERE id = 4");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getChatData = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE id = $1`, // Use parameterized query
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getOptionsData = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await pool.query(
      `SELECT * FROM chat_buttons WHERE chat_data_id = $1`, // Use parameterized query
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


const getAppointmentStatus = async (req, res) => {
  const appointment_id = req.query.appointmentId;
  

  // Validate appointment_id
  if (!appointment_id) {
    return res.status(400).json({ error: "Invalid Appointment ID" });
  }

  try {
    const result = await pool.query(
      `SELECT
         a.appointment_id,
         a.patient_name,
         d.name AS doctor_name,
         to_char(a.appointment_time, 'YYYY-MM-DD') AS appointment_date, 
         to_char(a.appointment_time, 'HH12:MI AM') AS appointment_time,
         a.status
       FROM
         Appointments a
       JOIN
         Doctors d ON a.doctor_id = d.doctor_id
       WHERE
         a.appointment_id = $1`,
      [appointment_id]
    );

    // Check if appointment exists
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Return the appointment data
    res.json({
      appointment_id: result.rows[0].appointment_id,
      patient_name: result.rows[0].patient_name,
      doctor_name: result.rows[0].doctor_name,
      appointment_date: result.rows[0].appointment_date,
      appointment_time: result.rows[0].appointment_time,
      status: result.rows[0].status,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Define API endpoints

app.get("/appointment-status/", getAppointmentStatus);

app.get("/chat/welcome", getWelcomeData);
app.get("/chats/message/get/:chatId", getChatData);
app.get("/chats/options/get/:chatId", getOptionsData);

// Catch-all for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found!" });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
