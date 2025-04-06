const { StatusCodes } = require('http-status-codes')
const {BookingService} = require('../services')
const {ErrorResponse,SuccessResponse} = require('../utils/common')


const inMemDB = []
const createBooking = async(req,res)=>{
     try {
        const response = await BookingService.createBooking({
            flightId  : req.body.flightId,
            userId : req.body.userId,
            noOfSeats : req.body.noOfSeats
        })
        SuccessResponse.data = response
        return res.status(StatusCodes.OK).json(SuccessResponse)
     } catch (error) {
        ErrorResponse.error = error
        return res.status(error.statusCode).json(ErrorResponse)
     }
}

const makePayment = async(req,res)=>{
   try {
      const idempotencyKey = req.headers['x-idempotency-key']

      if(!idempotencyKey){
         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('idempotency key missing')
 
      }
      if(!idempotencyKey || inMemDB[idempotencyKey]){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('Can`t retrive successfull payment')

      }
      const response = await BookingService.makePayment({
         userId : req.body.userId,
         totalCost : req.body.totalCost,
         bookingId : req.body.bookingId
      })
      inMemDB[idempotencyKey] = idempotencyKey
      SuccessResponse.data = response
      return res.status(StatusCodes.OK).json(SuccessResponse)
   } catch (error) {
      ErrorResponse.error = error
      return res.status(error.statusCode).json(ErrorResponse)
   }
}


module.exports  = {
createBooking,
makePayment
}