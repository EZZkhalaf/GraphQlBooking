

const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const graphQlSchema = require('./Graphql/Schema/index')
const graphQlResolvers = require('./Graphql/Resolvers/index')

dotenv.config();
const app = express();
app.use(bodyParser.json());


app.use(
  "/api",
  graphqlHTTP({
    schema:graphQlSchema,
    rootValue: graphQlResolvers,
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
