const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getOwnProfile, updateProfile, deleteAccount } = require("../controllers/userController");

router.get("/me", verifyToken, getOwnProfile);
router.put("/me", verifyToken, updateProfile);
router.delete("/delete", verifyToken, deleteAccount);

module.exports = router;
