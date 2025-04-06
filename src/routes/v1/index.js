const express = require('express');

const { InfoController } = require('../../controllers');
const bookingRouter = require('./booking')

const router = express.Router();

router.get('/info', InfoController.info);


router.use('/bookings',bookingRouter)

module.exports = router;