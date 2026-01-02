const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserData } = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getUserData);

module.exports = router;
