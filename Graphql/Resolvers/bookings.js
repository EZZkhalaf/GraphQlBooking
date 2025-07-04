const Event = require("../../model/event");
const Booking = require('../../model/booking');
const {transformBooking,transformEvent} = require('./merge')






module.exports = {     
      bookings : async(args , req) =>{
        try {
            if(!req.isAuth){
            throw new Error("unAuthenticated...")
        }
             const bookings = await Booking.find()
             return bookings.map(booking => {
                return transformBooking(booking);
             })
        } catch (error) {
            console.log(error)
            throw error
        }
      }, 
      bookingEvent: async (args,req) => {
        try {
            if(!req.isAuth){
            throw new Error("unAuthenticated...")
        }

            const event = await Event.findById(args.eventId); 
            const user = await Event.findById(args.userId); 
            if (!event) throw new Error('Event not found');
            if (!user) throw new Error('user not found');

            const booking = new Booking({
            user: user._id, 
            event: event._id 
            });

            const result = await booking.save();

            return transformBooking(result);
        } catch (error) {
            console.log(error);
            throw error;
        }
       },
        cancelBooking: async (args , req) => {
            try {
                if(!req.isAuth){
                   throw new Error("unAuthenticated...")
                }
                const booking = await Booking.findById(args.bookingId).populate({
                path: 'event',
                populate: { path: 'creator' }
                });

                if (!booking) {
                throw new Error(`Booking not found for ID: ${args.bookingId}`);
                }

                if (!booking.event) {
                throw new Error(`Event not found for booking ID: ${args.bookingId}`);
                }

                const event = transformEvent(booking.event);

                await Booking.deleteOne({ _id: args.bookingId });

                return event;
            } catch (error) {
                console.error(error);
                throw error;
            }
        }


    
    }