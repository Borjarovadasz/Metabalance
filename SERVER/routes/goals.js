const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { createGoal, listGoals, updateGoal, deleteGoal } = require("../controllers/goalController");

router.post("/", verifyToken, createGoal);
router.get("/", verifyToken, listGoals);
router.put("/:id", verifyToken, updateGoal);
router.delete("/:id", verifyToken, deleteGoal);

module.exports = router;
