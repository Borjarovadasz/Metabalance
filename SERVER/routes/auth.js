const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { registerUser, loginUser, logoutUser, getUserData } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get("/me", verifyToken, getUserData);

module.exports = router;
