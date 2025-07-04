const Event = require("../../model/event");
const {transformEvent} = require('./merge')








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
      }
    }