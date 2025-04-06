const axios = require('axios')
const { ServerConfig } = require('../config')
const { BookingRepository } = require('../repositories')
const db = require('../models')
const { AppError } = require('../utils')
const { StatusCodes } = require('http-status-codes')

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


module.exports = {
    createBooking
}