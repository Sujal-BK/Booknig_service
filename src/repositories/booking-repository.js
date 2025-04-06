const {StatusCodes}  = require('http-status-codes')

const {Booking} = require('../models')
const CrudRepository = require('./CRUD-repository')

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

   async createBooknig(data,transaction){
       const response = await Booking.create(data,{transaction:transaction})
       return response
   }
}
module.exports = BookingRepository