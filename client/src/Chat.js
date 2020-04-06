import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr";


class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nick: '',
      message: '',
      messages: [],
      hubConnection: null,
    };
  }

  componentDidMount = () => {
    const nick = window.prompt('Your name:', 'John');

    const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/chat")
    .configureLogging(signalR.LogLevel.Information)  
    .build();

    hubConnection.start().then(a => {
      if (hubConnection.connectionId) {
        hubConnection.invoke("SendConnectionId", hubConnection.connectionId);
      }   
    }); 

    hubConnection.on('sendToAll', (nick, receivedMessage) => {
      const text = `${nick}: ${receivedMessage}`;
      const messages = this.state.messages.concat([text]);
      this.setState({ messages });
    });

    this.setState({nick: nick, hubConnection: hubConnection});

  };

  sendMessage = () => {

    this.state.hubConnection.invoke("sendToAll", this.state.nick, this.state.message);

    this.setState({message: ''});      
  };

  render() {
    return (
      <div>
        <br />
        <input
          type="text"
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />

        <button onClick={this.sendMessage}>Send</button>

        <div>
          {this.state.messages.map((message, index) => (
            <span style={{display: 'block'}} key={index}> {message} </span>
          ))}
        </div>
      </div>
    );
  }
}

export default Chat;
