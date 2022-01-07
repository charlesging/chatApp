// https://lo-victoria.com/graphql-for-beginners-setting-up-graphql-server

const { GraphQLServer, PubSub } = require("graphql-yoga");
const pubsub = new PubSub();

const typeDefs = `
  type Message {
    id: ID!,
    user: String!,
    text: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, text: String!): ID!
  }

  type Subscription {
    messages: [Message!]
  }
`;

const messages = []; //stores all the messages sent
const subscribers = []; //stores any new messages sent upon listening

//to push new users to the subscribers array
const onMessageUpdates = (fn) => subscribers.push(fn);

const resolvers = {
  // add all the resolver functions here
  Query: {
    messages: () => messages, // returns the messages array
  },
  Mutation: { // posts new message and returns id
    postMessage: (parent, { user, text }) => {
      const id = messages.length; // create the id for the new message
      messages.push({id, user, text}); // push Message object to messages array
      return id; // return the id
    }
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        // create random number as the channel to publish messages to
        const channel = Math.random().toString(36).slice(2,15);

        // push the user to the subscriber array with onMessagesUpdates function and
        // publish updated messages array to the channel as the callback
        onMessageUpdates(() => pubsub.publish(channel, { messages }));

        // publish all messages immediately once a user subscribed
        setTimeout(() => pubsub.publish(channel, { messages }), 0);

        // returns the asyncIterator
        return pubsub.asyncIterator(channel);
      },
    },
  },
  Mutation: {
    postMessage: (parent, { user, text }) => {
      const id = messages.length;
      messages.push({ id, user, text });
      subscribers.forEach((fn) => fn()); // add this line
      return id;
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.start(({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
});