const express = require("express");
const router = express.Router();
const upload = require("../controllers/uploadController");
const verifyFile = require('../middlewares/verifyFile');
const authController = require('../controllers/authController');

router.post('/upload',authController.isAuthenticated,verifyFile.verifyFile, async (req, res) => {
    let files = await upload.recorrer( req, res);
    res.status(200).json({status: true, message: "Creacion exitosa", data: [req.files] });
});

router.post('/create/excel',authController.isAuthenticated,async (req, res) => {
    await upload.generateExcel(req,res);
});

module.exports = router;
