const express = require("express");
const bodyParser = require('body-parser')
const { graphqlHTTP } = require("express-graphql");//a middlware function for express in graphql
const {buildSchema} = require('graphql')

const app = express();

app.use(bodyParser.json())
app.use("/api" , graphqlHTTP({
    schema : buildSchema(`
        type RootQuery {
        
        }
        
        type RootMutation {

        }
        schema {
                query :RootQuery  ,
                mutation : RootMutation
        }
        `) ,
    rootValue : {

    }
}))

const PORT = process.env.PORT || 3000
app.listen(PORT ,() =>  console.log(`listening to port ${PORT}`) );
