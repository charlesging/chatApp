import React, { useState } from 'react';

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

const POST_MESSAGE = gql`
  mutation($user: String!, $text: String!) {
    postMessage(user: $user, text: $text)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES) // executes query
  if (!data) return null;

  return ( 
    <div style={{ marginBottom: '5rem' }}>
      { data.messages.map(({ id, user: messageUser, text }) => {
        const isUserMessage = user === messageUser
        console.log(user, messageUser)
        return (
          <div key={id} style={{ textAlign: isUserMessage ? 'right' : 'left' }}>
            <p style={{ marginBottom: '0.3rem' }}>{messageUser}</p>
            <Chip style={{ fontSize: '0.9rem' }} color={ isUserMessage ? 'primary' : 'secondary' } label={text} />
          </div>
        );
      })}
    </div>
  )
}

export const Chat = () => {
  const [user, setUser] = useState("Charles")
  const [text, setText] = useState("")
  const [postMessage] = useMutation(POST_MESSAGE)

  const sendMessage = () => {
    if (text.length > 0 && user.length > 0) {
      postMessage({
        variables: { user: user, text: text }
      })
      setText("")
    } else {
      alert("Missing fields!");
    }

  }

  return (
    <Container>
      <h3>Welcome to a simple chat app using GraphQL subscriptions!</h3>
      <Messages user={user} />
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TextField 
            onChange={(e) => {setUser(e.target.value)}}
            value={user}
            size="small"
            fullWidth
            variant="outlined"
            required
            label="Required"
            label="Enter name"
          />
        </Grid>
        <Grid item xs={8}>
          <TextField 
            onChange={(e) => {setText(e.target.value)}}
            value={text}
            size="small"
            fullWidth
            variant="outlined"
            required
            label="Required"
            label="Enter message here"            
          />
        </Grid>
        <Grid item xs={1}>
          <Button onClick={sendMessage} fullWidth  variant="contained" style={{backgroundColor:"#60a820", color:"white"}}>Send</Button>
        </Grid>
      </Grid>
    </Container>
  )
}