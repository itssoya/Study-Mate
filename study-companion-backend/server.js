require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const connectDB = require("./config/dbConfig");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const http = require("http");

connectDB();
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true }, // match your frontend port
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Testing Express"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.use("/api/flashcards", require("./routes/flashcardRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));

app.use("/api/topics", require("./routes/topicRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));

require("./sockets/roomSocket")(io);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server runninga at port ${port}`));
