// const express = require("express");
// const bodyParser = require('body-parser')
// const { graphqlHTTP } = require("express-graphql");//a middlware function for express in graphql
// const {buildSchema} = require('graphql');
// const mongoose = require('mongoose')
// const dotenv = require('dotenv')
// const bcrypt = require('bcrypt')

// const Event = require('./model/event')
// const User = require("./model/user")
// dotenv.config();

// const app = express();



// app.use(bodyParser.json())

// const events = eventIds =>{
//     return Event.find({_id : {$in : eventIds}})
//             .then(res =>{
//                 return res.map(event => {
//                     return {
//                         ...event._doc , 
//                         _id : event.id , 
//                         creator : user.bind(this,event.creator)
//                     }
//                 })
//             })
//             .catch(err =>{
//                 console.log(err)
//                 throw err
//             })
// }

// const user =  userId =>{
//     return User.findById(userId)
//                 .then(user => {
//                     if (!user) {
//                         throw new Error(`User not found for ID: ${userId}`);
//                     }
//                     return {
//                         ...user._doc,
//                         _id: user.id,
//                         createdEvents: events.bind(this, user._doc.createdEvents)
//                     };
//                 })
//                 .catch(err=>{
//                     console.log(err)
//                     throw err
//                 })
// }

// app.use("/api" , graphqlHTTP({
//     schema : buildSchema(`

//         type Event {
//             _id : ID! 
//             title : String!
//             description : String!
//             price : Float!
//             date : String!
//             creator : User!
//         }

//         type User {
//             _id : ID! 
//             email : String! 
//             password : String!
//             createdEvents : [Event!]
//         }

//         input EventInput {
//             title : String!
//             description : String!
//             price : Float!
//             date : String!
//             creator : ID!
//         }

//         input UserInput {
//             email : String! 
//             password : String!
//         }

//         type RootQuery {
//             events : [Event!]!
//         }
        
//         type RootMutation {
//             createEvent(eventInput : EventInput) : Event!
//             createUser(userInput : UserInput) : User!
//         }

//         schema {
//                 query :RootQuery  
//                 mutation : RootMutation
//         }
//         `) ,
//     rootValue : { //resolver
//         events : async() => {
//             try {
//                 const events = await Event.find();
//                 return events.map(event=>({
//                     ...event._doc ,
//                     _id : event.id ,
//                     creator : user.bind(this , event.creator)
//                 }));

//             } catch (error) {
//                 throw error
//             }

//         },

//         createEvent: async(args) => {

//             const event = new Event({
//                 title: args.eventInput.title,
//                 description: args.eventInput.description,
//                 price: +args.eventInput.price,
//                 date: new Date(args.eventInput.date),
//                 creator: args.eventInput.creator
//             });

//             try {
//                 const savedEvent = await event.save();

//                 const createdEvent = {
//                 ...savedEvent._doc,
//                 _id: savedEvent.id,
//                 creator: await user(savedEvent.creator) // ✅ resolve to full User object
//                 };

//                 return createdEvent;

//             } catch (e) {
//                 console.log(e);
//                 throw e;
//             }
            

//         },
//         createUser : async(args) =>{
//             const existingUser = await User.findOne({email : args.userInput.email})
           
//             if(existingUser) throw new Error("user exists...")
            
//             const hashedPass = await bcrypt.hash(args.userInput.password, 12);
            
//             const user = new User({
//             email: args.userInput.email,
//             password: hashedPass
//             });

//             const result = await user.save();

//             return {
//             ...result._doc,
//             password: null,
//             _id: result.id
//             };        
//         },
//         graphiql : true //will explained later  
//     }
// }))

// mongoose.connect(process.env.DB_CONNECTION_STRING)
//   .then(() => {
//     console.log("--DB connected");
//     app.listen(process.env.PORT, () =>
//       console.log(`Server running on port ${process.env.PORT}`)
//     );
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });




const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const Event = require("./model/event");
const User = require("./model/user");

dotenv.config();
const app = express();
app.use(bodyParser.json());

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
      creator: getUserById.bind(this, event.creator),
    }));
  } catch (err) {
    throw err;
  }
};

app.use(
  "/api",
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }

      type User {
        _id: ID!
        email: String!
        password: String!
        createdEvents: [Event!]
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: ID!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event!
        createUser(userInput: UserInput): User!
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
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
    },
    graphiql: true,
  })
);

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("--DB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
