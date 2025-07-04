const bcrypt = require("bcrypt");

const Event = require("../../model/event");
const User = require("../../model/user");
const event = require("../../model/event");
const Booking = require('../../model/booking');
const user = require("../../model/user");


const transformEvent = (event) => {
  const data = event._doc || event; // handle both raw Mongoose doc and plain object
  return {
    ...data,
    _id: event.id || data._id,
    date: new Date(data.date).toISOString(),
    creator: getUserById.bind(this, data.creator)
  };
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error(`User not found for ID: ${userId}`);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: getEventsByIds.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const getEventsByIds = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
        return transformEvent(event)
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
try {
    const event  = await Event.findById(eventId)
    return transformEvent(event)
} catch (error) {
    console.log(error)
    throw error 
}
}



module.exports = {
      events: async () => {
        try {
          const events = await Event.find();
          return await Promise.all(
            events.map(async (event) => {
              if (!event.creator) {
                console.warn(`Skipping event ${event._id} — missing creator`);
                return null;
              }
              return transformEvent(event)
            })
          ).then((res) => res.filter(Boolean)); // Remove nulls
        } catch (err) {
          throw err;
        }
      },

      createEvent: async ({ eventInput }) => {
        if (!eventInput.creator) {
          throw new Error("Missing creator ID");
        }

        const event = new Event({
          title: eventInput.title,
          description: eventInput.description,
          price: +eventInput.price,
          date: new Date(eventInput.date),
          creator: eventInput.creator,
        });

        try {
          const savedEvent = await event.save();

          // Push event to user's createdEvents array
          const creatorUser = await User.findById(eventInput.creator);
          if (!creatorUser) throw new Error("Creator user not found");

          creatorUser.createdEvents.push(savedEvent._id);
          await creatorUser.save();

          return transformEvent(savedEvent);
        } catch (err) {
          console.log(err);
          throw err;
        }
      },

      createUser: async ({ userInput }) => {
        try {
          const existingUser = await User.findOne({ email: userInput.email });
          if (existingUser) throw new Error("User already exists.");

          const hashedPass = await bcrypt.hash(userInput.password, 12);

          const user = new User({
            email: userInput.email,
            password: hashedPass,
          });

          const result = await user.save();
          return {
            ...result._doc,
            password: null,
            _id: result.id,
          };
        } catch (err) {
          throw err;
        }
      },

      bookings : async() =>{
        try {
             const bookings = await Booking.find()
             return bookings.map(booking => {
                return {
                    ...booking._doc , 
                    _id : booking.id ,
                    user : getUserById.bind(this,booking._doc.user),
                    event : singleEvent.bind(this,booking._doc.event),
                    createdAt : new Date(booking._doc.createdAt).toISOString(),
                    updatedAt : new Date(booking._doc.updatedAt).toISOString()
                    
                }
             })
        } catch (error) {
            console.log(error)
            throw error
        }
      }, 
      bookingEvent: async (args) => {
        try {
            const event = await Event.findById(args.eventId); 
            const user = await Event.findById(args.userId); 
            if (!event) throw new Error('Event not found');
            if (!user) throw new Error('user not found');

            const booking = new Booking({
            user: user._id, 
            event: event._id 
            });

            const result = await booking.save();

            return {
            ...result._doc,
            _id: result.id,
            user: getUserById.bind(this, result._doc.user),
            event: singleEvent.bind(this, result._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
       },
        cancelBooking: async (args) => {
            try {
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