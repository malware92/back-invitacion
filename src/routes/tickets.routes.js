const express = require("express");
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const authController = require('../controllers/authController');


router.post('/newticket/',authController.isAuthenticated,async (req, res) => {
    await ticketsController.createTicket(req,res);
});
  
router.post('/tickets/',authController.isAuthenticated, async (req, res) => {
    await ticketsController.getTickets(req,res);

});
  
router.post('/updateticket',authController.isAuthenticated, async (req, res) => {
    await ticketsController.update(req,res);

});
router.post('/updatedes',authController.isAuthenticated, async (req, res) => {
    await ticketsController.updatedescription(req,res);

});
router.post('/ticketbyid', authController.isAuthenticated, async (req, res) => {
    await ticketsController.getTicket(req,res);

});

router.post('/logsid', authController.isAuthenticated,async (req, res) => {
    await ticketsController.getlogsbyid(req,res);
});

router.post('/getima', async (req, res) => {
    await ticketsController.get_images(req,res);
});

router.post('/createnote', async (req, res) => {
    await ticketsController.postNotes(req,res);
});

router.post('/getnote', async (req, res) => {
    await ticketsController.getNotes(req,res);
});

    

module.exports = router;