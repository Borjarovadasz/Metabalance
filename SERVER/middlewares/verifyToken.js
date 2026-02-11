const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieHeader = req.headers["cookie"] || "";
  const cookieToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  const token = headerToken || (cookieToken ? decodeURIComponent(cookieToken.split("=")[1]) : null);

  if (!token) {
    return res.status(401).json({ message: "Token szukseges" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Ervenytelen vagy lejart token" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role || "user";
    next();
  });
};
