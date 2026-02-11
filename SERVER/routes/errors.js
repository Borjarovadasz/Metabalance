const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const { listErrors, createError } = require("../controllers/errorController");

// Optional auth: if token is present and valid, set req.userId
const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieHeader = req.headers["cookie"] || "";
  const cookieToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  const token = headerToken || (cookieToken ? decodeURIComponent(cookieToken.split("=")[1]) : null);
  if (!token) return next();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded?.id) {
      req.userId = decoded.id;
    }
    next();
  });
};

// Allow anonymous error reports (user_id will be NULL)
router.post("/", optionalAuth, createError);
router.get("/", verifyToken, requireRole("admin"), listErrors);

module.exports = router;
