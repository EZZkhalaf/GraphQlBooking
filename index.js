const express = require("express");
const bodyParser = require('body-parser')
const { graphqlHTTP } = require("express-graphql");//a middlware function for express in graphql
const {buildSchema} = require('graphql');
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Event = require('./model/event')

dotenv.config();

const app = express();


const events = []

app.use(bodyParser.json())
app.use("/api" , graphqlHTTP({
    schema : buildSchema(`

        type Event {
            _id : ID! 
            title : String!
            description : String!
            price : Float!
            date : String!
        }

        input EventInput {
            title : String!
            description : String!
            price : Float!
            date : String!
        }

        type RootQuery {
            events : [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput : EventInput) : Event!
        }

        schema {
                query :RootQuery  
                mutation : RootMutation
        }
        `) ,
    rootValue : { //resolver
        events : () => {
            Event.find().then( e =>{
                return e.map(event =>{
                    return {...event._doc}
                })
            }).catch(error => {
                throw error
            })
        },
        createEvent: (args) => {
            const eventInput = args.eventInput;

            const event = new Event({
                title : args.eventInput.title ,
                description : args.eventInput.description ,
                price : +args.eventInput.price ,  
                date : new Date(args.eventInput.date) 
            })

            return event.save().then( r =>{
                    console.log(r)
                    return r; 
                }).catch(e => {
                    console.log(e)
                    throw e
                })

        },
        graphiql : true //will explained later  
    }
}))

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("--DB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

