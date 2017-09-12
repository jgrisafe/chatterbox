import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      Firebase: null,
      username: '',
      message: '',
      messages: [],
    }
  }

  componentDidMount() {
    this.setState({ Firebase: new window.Firebase('https://coding-bootcamp-1d008.firebaseio.com/') })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.Firebase && !prevState.Firebase) {
      this.state.Firebase.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        const key = snapshot.key();
        msg.key = key;
        this.setState({
          messages: [...this.state.messages, msg]
        })
      });
      this.state.Firebase.on('child_removed', (snapshot) => {
        const key = snapshot.key();
        this.setState({
          messages: this.state.messages.filter(message => message.key !== key)
        })
      });
    }
  }


  handleChange = (e) => {
    const id = e.target.id
    const value = e.target.value
    this.setState({ [id]: value })
  }

  submit = () => {
    const { username, message } = this.state
    this.state.Firebase.push({ username, message });
  }

  delete = key => {
    this.state.Firebase.child(key).remove()
  }

  renderMessages = () => {
    return this.state.messages.map((message) => (
      <div
         key={message.key}
         style={{
            padding: 10,
            boxShadow: '0px 2px 2px #ccc',
            width: '50%',
            margin: '10px auto',
            position: 'relative'
          }}>
        <h3>{message.username}</h3>
        <p>{message.message}</p>
        <div
          style={{ position: 'absolute', top: 5, left: 5, cursor: 'pointer' }}
          onClick={() => this.delete(message.key)}
        >X</div>
      </div>
    ))
  }

  render() {
    const { username, message } = this.state

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to Chatterbox</h2>
        </div>
        <div style={{ margin: '10px auto', textAlign: 'center' }}>
          <input
            id="username"
            value={username}
            onChange={this.handleChange}
            placeholder="Username"
          />
          <input
            id="message"
            value={message}
            onChange={this.handleChange}
            placeholder="Message"
          />
          <button
            onClick={this.submit}
            value="Submit!!"
          >Submit</button>
        </div>
        <div style={{ margin: '50px auto', textAlign: 'center' }}>
          {this.renderMessages()}
        </div>
      </div>
    );
  }
}

export default App;
