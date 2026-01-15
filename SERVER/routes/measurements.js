const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const {
  createMeasurement,
  listMeasurements,
  updateMeasurement,
  deleteMeasurement
} = require("../controllers/measurementController");

router.post("/", verifyToken, createMeasurement);
router.get("/", verifyToken, listMeasurements);
router.put("/:id", verifyToken, updateMeasurement);
router.delete("/:id", verifyToken, deleteMeasurement);

module.exports = router;
