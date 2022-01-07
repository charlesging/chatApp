import { ApolloClient, InMemoryCache, useMutation, useSubscription, gql} from '@apollo/client';
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Chip, Grid, TextField, Button } from '@material-ui/core';

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
})

export const client = new ApolloClient({
  link, // websocket link
  uri: 'http://localhost:4000/', // connect to server
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      text
    }
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES) // executes query

  if (!data) return null;

  return ( 
    <div style={{ marginBottom: '5rem' }}>
      { data.messages.map(({ id, user, text }) => {
        return (
          <div key={id} style={{ textAlign: 'right' }}>
            <p style={{ marginBottom: '0.3rem' }}>{user}</p>
            <Chip style={{ fontSize: '0.9rem' }} color='primary' label={text} />
          </div>
        );
      })}
    </div>
  )
}

export const Chat = () => {
  return (
    <div>
      <h3>Welcome to a simple chat app using GraphQL subscriptions!</h3>
      <Messages/>
    </div>
  )
}