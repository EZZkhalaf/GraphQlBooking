const Event = require("../../model/event");
const User = require('../../model/user')


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




const transformBooking = booking  =>{
    const data = booking._doc || booking
    return {
        ...data, 
        _id : data.id ,
        user : getUserById.bind(this,data.user),
        event : singleEvent.bind(this,data.event),
        createdAt : new Date(data.createdAt).toISOString(),
        updatedAt : new Date(data.updatedAt).toISOString()
        
    }
}

const transformEvent = (event) => {
    if (!event) {
        return null; 
    }
  const data = event._doc || event; 
  return {
    ...data,
    _id: event.id || data._id,
    date: new Date(data.date).toISOString(),
    creator: getUserById.bind(this, data.creator)
  };
};






exports.transformBooking = transformBooking ;
exports.transformEvent = transformEvent;