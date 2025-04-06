const axios = require('axios')
const { ServerConfig } = require('../config')
const { BookingRepository } = require('../repositories')
const db = require('../models')
const { AppError } = require('../utils')
const { StatusCodes } = require('http-status-codes')
const {Enums} = require('../utils/common')
const {BOOKED,CANCELLED} = Enums.BOOKING_STATUS


const bookingRepository = new BookingRepository()   
const createBooking = async (data) => {

    const transaction = await db.sequelize.transaction()
   

        try {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
            if (data.noOfSeats > flight.data.data.totalSeats) {
                throw new AppError('not enough seats available', StatusCodes.BAD_REQUEST)
            }


            const totalBillingAmount = data.noOfSeats*flight.data.data.price
            const bookingPayload = {...data,totalCost:totalBillingAmount}
            const booking = await bookingRepository.create(bookingPayload,transaction)

            const response = await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
                seats:data.noOfSeats
            })


            

            await transaction.commit()

           return booking  
        } catch (error) {
            await transaction.rollback()
            throw error
        }

    

}


const makePayment = async(data)=>{
    const transaction = await db.sequelize.transaction()
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId,transaction)

        if(bookingDetails.status == CANCELLED){
            throw new AppError('Booking expired, try again',StatusCodes.BAD_REQUEST)
        }

        const bookingTime = new Date(bookingDetails.createdAt)
        const currentTime = new Date()
        if(currentTime-bookingTime>300000){
            await bookingRepository.update(data.bookingId,{status:CANCELLED},transaction)
            throw new AppError('Booking expired, try again',StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.totalCost != data.totalCost){
         throw new AppError('The amount of the payment doesnt match',StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.userId!=data.userId){
            throw new AppError('user doesnt match',StatusCodes.BAD_REQUEST)
        }

      

        await bookingRepository.update(data.bookingId,{status:BOOKED},transaction)
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}


module.exports = {
    createBooking,
    makePayment
}