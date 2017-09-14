import React, { Component } from 'react';
import './App.css';
import * as storage from './utils/storage'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firebase: null,
      database: null,
      message: '',
      messages: [],
      user: {},
      accessToken: ''
    }
  }

  componentDidMount() {
    this.initFirebase()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.database && !prevState.database) {
      this.state.database.ref('/').on('child_added', (snapshot) => {
        const msg = snapshot.val();
        const key = snapshot.key;
        msg.key = key;
        this.setState({
          messages: [...this.state.messages, msg]
        })
      });
      this.state.database.ref('/').on('child_removed', (snapshot) => {
        const key = snapshot.key;
        this.setState({
          messages: this.state.messages.filter(message => message.key !== key)
        })
      });
    }
  }

  initFirebase = () => {
    var config = {
      apiKey: 'AIzaSyB1XsfIxipARd00gi_H_lz6I7bk7kWu480',
      authDomain: 'coding-bootcamp-1d008.firebaseapp.com',
      databaseURL: 'https://coding-bootcamp-1d008.firebaseio.com',
      storageBucket: 'gs://coding-bootcamp-1d008.appspot.com/',
    };
    const firebase = window.firebase.initializeApp(config)
    const provider = new window.firebase.auth.GoogleAuthProvider();
    const auth = firebase.auth()
    auth.onAuthStateChanged((user) => { if (user) { this.setState({ user }) }});
    this.setState({
      database: firebase.database(),
      firebase,
      provider,
      auth,
    })
  }

  handleChange = (e) => {
    const id = e.target.id
    const value = e.target.value
    this.setState({ [id]: value })
  }

  submit = () => {
    const { user, message } = this.state
    const { displayName } = user
    this.state.database.ref('/').push({ displayName, message });
  }

  delete = key => {
    this.state.database.ref('/').child(key).remove()
  }

  login = () => {
    const { provider, auth } = this.state
    auth.signInWithPopup(provider).then((result) => {
      const user = result.user;
      const accessToken = result.credential.accessToken;
      storage.set('accesstoken', accessToken)
      storage.set('user', JSON.stringify(user))
      this.setState({ user, accessToken })
    }).catch(function(error) {
      const code = error.code;
      const message = error.message;
      const email = error.email;
      const credential = error.credential;
      this.setState({ error: { code, message, email, credential } })
    });
  }

  logout = () => {
    const { auth } = this.state
    auth.signOut().then(() => {
      this.setState({ user: {} })
    }).catch(function(error) {
      alert(error)
    });
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
        <h3>{message.displayName}</h3>
        <p>{message.message}</p>
        <div
          style={{ position: 'absolute', top: 5, left: 5, cursor: 'pointer' }}
          onClick={() => this.delete(message.key)}
        >X</div>
      </div>
    ))
  }

  renderLogin = () => {
    const { user } = this.state
    if (user.displayName) {
      return (<button id="login" onClick={this.logout}>Log Out</button>)
    }
    return (
      <button id="login" onClick={this.login}>Login with Google</button>
    )
  }

  render() {
    const { message, user } = this.state

    return (
      <div className="App">
        <div className="App-header">
          {this.renderLogin()}
          <h2>Welcome to Chatterbox</h2>
          <h3>{user.displayName}</h3>
        </div>
        <div style={{ margin: '10px auto', textAlign: 'center' }}>

          {
            user.displayName
            ? (
              <div>
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
            )
            : <h3>Log In To Continue</h3>

          }
        </div>
        <div style={{ margin: '50px auto', textAlign: 'center' }}>
          {this.renderMessages()}
        </div>
      </div>
    );
  }
}

export default App;
