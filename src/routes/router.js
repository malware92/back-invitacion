const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**Enviar Correos */
router.post("/sendemail", async (req, res) => {
  await authController.sendFirstEmail(req, res);
});
/************************************** */

router.get("/", async (req, res) => {
  res.send("Welcome api");
});

module.exports = router;
