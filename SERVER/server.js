const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const goalRoutes = require("./routes/goals");
const measurementRoutes = require("./routes/measurements");
const statsRoutes = require("./routes/statistics");
const adminRoutes = require("./routes/admin");
const errorRoutes = require("./routes/errors");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/statistics", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/errors", errorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
