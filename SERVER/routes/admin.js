const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateRole
} = require("../controllers/adminController");

router.use(verifyToken, requireRole("admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateRole);

module.exports = router;
