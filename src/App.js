import React, { Component } from 'react';
import './App.css';
import * as storage from './utils/storage'

import Sidebar from './components/Sidebar'
import Chat from './components/Chat'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      firebase: null,
      database: null,
      message: '',
      messages: [],
      user: {
        uid: "",
        details: {}
      },
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
    const database = firebase.database()

    // handles page load authentication if already logged in
    auth.onAuthStateChanged((user) => {
      if (user) {

        this.setState({ user: this.mapUser(user) })

        // add user to firebase db
        this.getUsersFromFirebase(database)

        database
          .ref(`users/${user.uid}`)
          .set(this.mapUser(user))
          .catch((err) => console.log(err)) // eslint-disable-line no-console
      }
    });

    // initialize the state
    this.setState({
      database,
      firebase,
      provider,
      auth,
    })
  }

  getUsersFromFirebase = (database) => {
    database.ref('/users').on('value', (snapshot) => {
      const users = snapshot.val()
      this.setState({ users: Object.keys(users).map((userId) => ({ ...users[userId] })) })
    })
  }

  mapUser = (user) => ({
    uid: user.uid,
    details: { name: user.displayName, avatar: user.photoURL }
  })


  handleChange = (e) => {
    const id = e.target.id
    const value = e.target.value
    this.setState({ [id]: value })
  }

  submit = () => {
    const { user, message } = this.state
    const { name } = user
    this.state.database.ref('/').push({ name, message });
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
            boxShadow: '0px 1px 4px #ccc',
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

  isLoggedIn = () => {
    const { user } = this.state
    return user.details && user.details.name
  }

  renderLogin = () => {
    const { user } = this.state
    if (this.isLoggedIn()) {
      return (<button id="login" onClick={this.logout}>Log Out</button>)
    }
    return (
      <button id="login" onClick={this.login}>Login with Google</button>
    )
  }

  renderUser = () => {
    const { user } = this.state
    if (this.isLoggedIn()) {
      return (
        <div>
          <h3>{user.details.name}</h3>
          <img src={user.details.avatar} height="100" width="100" style={{ borderRadius: '50%' }}/>
        </div>
      )
    }
    return null
  }

  render() {
    const { message, user, users } = this.state

    return (
      <div className="App">
        <div className="App-header">
          {this.renderLogin()}
          <h2>Welcome to Chatterbox</h2>
          {this.renderUser()}
        </div>
        <div style={{ margin: '10px auto'}}>

          {
            this.isLoggedIn()
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
        <div style={mainStyle}>
          <Sidebar users={users}/>
          <Chat />
        </div>
      </div>
    );
  }
}

const mainStyle = {
  padding: 10,
  margin: '50px auto',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'stretch',
  minHeight: 300
}

export default App;
