require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const express = require("express");
const mysql = require("mysql2");
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

// Configure MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  // password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MySQL query wrapper for async/await
const dbQuery = async (query, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getWelcomeData = async (req, res) => {
  try {
    const result = await dbQuery("SELECT * FROM chat_data WHERE id = 2");
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getChatData = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await dbQuery(
      `SELECT * FROM chat_data WHERE id = ?`, // Use parameterized query
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
    const result = await dbQuery(
      `SELECT * FROM chat_options WHERE chat_data_id = ?`, // Use parameterized query
      [chatId]
    );
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getAppointmentStatus = async (req, res) => {
  const { appointment_id } = req.body;

  // Validate appointment_id
  if (!appointment_id) {
    return res.status(400).json({ error: "Invalid Appointment ID" });
  }

  try {
    const result = await dbQuery(
      `SELECT
        a.appointment_id,
        a.patient_name,
        d.name AS doctor_name,
        a.appointment_time,
        a.status
      FROM
        Appointments a
      JOIN
        Doctors d ON a.doctor_id = d.doctor_id
      WHERE
        // a.appointment_id = ?`,
      [appointment_id]
    );

    // Check if appointment exists
    if (result.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Return the appointment data
    res.json(result[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// const chat = (req, res) => {
//   const username = req.body.message;

//   // Validate username
//   if (!username) {
//     return res.status(400).json({
//       message: "Sorry, I could not recognize! Please enter visitor's name.",
//     });
//   }

//   // Greeting message
//   const greetingMessage = `Good Morning, ${username}! How can I assist you today? Here are some quick links to help you:`;

//   // Helpful links
//   const helpfulLinks = {
//     "appointment status": "http://localhost:3000/appointment-status",
//     "working hours": "http://localhost:3000/working-hours",
//     "medical tests": "http://localhost:3000/medical-tests",
//   };

//   // Response
//   res.status(200).json({ message: greetingMessage, links: helpfulLinks });
// };

// const getWorkingHours = async (req, res) => {
//   try {
//     const result = await pool.query(`SELECT * FROM workinghours`);
//     // Check if workinghours exists
//     if (result.rowCount === 0) {
//       return res.status(404).send({ error: "workinghours not found" });
//     }
//     // Return the workinghours data
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// };

// const getMedicalTests = async (req, res) => {
//   try {
//     const result = await pool.query(`SELECT * FROM medicaltests`);

//     if (result.rowCount === 0) {
//       return res.status(404).send({ error: "medical tests not found" });
//     }

//     return res.status(200).json(result.rows);
//   } catch (error) {
//     res.status(500).send("Server Error");
//   }
// };

// Define API endpoints
//app.get("/appointments", getAppointments);
app.post("/appointment-status", getAppointmentStatus);

// app.get("/working-hours", getWorkingHours);
// app.get("/medical-tests", getMedicalTests);
// app.post("/chat", chat);

app.get("/chat/welcome", getWelcomeData);
app.get("/chats/message/get/:chatId", getChatData);
app.get("/chats/options/get/:chatId", getOptionsData);

// Catch-all for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found!" });
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
