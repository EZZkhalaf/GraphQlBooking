const bcrypt = require("bcrypt");

const Event = require("../../model/event");
const User = require("../../model/user");
const event = require("../../model/event");


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
    return events.map((event) => ({
      ...event._doc,
      _id: event.id,
      date : new Date(event._doc.date).toISOString(),
      creator: getUserById.bind(this, event.creator),
    }));
  } catch (err) {
    throw err;
  }
};

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
              return {
                ...event._doc,
                _id: event.id,
                date : new Date(event._doc.date).toISOString(),
                creator: await getUserById(event.creator),
              };
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

          return {
            ...savedEvent._doc,
            _id: savedEvent.id,
            date : new Date(event._doc.date).toISOString(),
            creator: getUserById.bind(this, savedEvent.creator),
          };
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
    }