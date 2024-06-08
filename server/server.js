const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth');

// pulls in required schemas and connection
const { typeDefs, resolvers } = require('./schemas')
const db = require('./config/connection');

// sets up PORT and express
const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// starts apollo server
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // sets it to use graphql
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // for when we run in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Uncomment this code once you have built out queries and mutations in the client folder
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // listens on specified port
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http:localhost:${PORT}/graphql`);
    })
  })
}

startApolloServer();