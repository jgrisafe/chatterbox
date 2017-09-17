import React, { Component } from 'react'
import PropTypes from 'prop-types'

const style = {
  flexBasis: '80%',
  boxShadow: '0px 1px 4px #ccc',
  display: 'flex',
  flexDirection: 'column'
}

class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      message: ''
    }

  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.getUsers(nextProps)
  }

  componentDidUpdate(prevProps) {
    if (this.messages && this.hasNewMessages(prevProps)) {
      this.messages.scrollTop = this.messages.scrollHeight
    }
  }

  hasNewMessages = (prevProps) => {
    if (prevProps.chat && prevProps.chat.messages && this.props.chat.messages) {
      return Object.keys(this.props.chat.messages).length > Object.keys(prevProps.chat.messages).length
    }
    return false
  }

  handleChange = (e) => {
    this.setState({ message: e.target.value })
  }

  handleKeyDown = (e) => {
    if (e.key.toLowerCase() === 'enter') {
      this.submitMessage()
    }
    return false
  }

  submitMessage = (e) => {
    const { database, chat, currentUser } = this.props
    if (!this.state.message.length) return;
    const messageObject = {
      name: currentUser.details.name,
      avatar: currentUser.details.avatar,
      message: this.state.message,
      uid: currentUser.uid
    }
    database.ref(`chats/${chat.id}/messages`).push(messageObject).catch(err => console.log(err))
    this.setState({ message: '' })
  }

  deleteMessage = (messageKey) => {
    const { database, chat } = this.props
    database.ref(`chats/${chat.id}/messages/${messageKey}`).remove()
      .catch(err => alert("you can't do that"))
  }

  getUsers = (nextProps) => {
    const { chat, database, currentUser } = nextProps
    if (chat && chat.users) {
      const otherUser = Object.keys(chat.users).filter((uid) => {
        return uid !== currentUser.uid
      })
      database.ref(`/users/${otherUser}`).once('value', (snapshot) => {
        this.setState({ user: snapshot.val() })
      })
    }
  }

  renderHeader = () => {
    const { currentUser } = this.props
    const { user } = this.state

    if (currentUser && user) {
      return (<h1>{`Chat with ${user.details.name}`}</h1>)
    }
  }

  renderMessages = () => {
    const { chat, currentUser } = this.props
    if (chat && chat.messages) {
      return (
        <div
          ref={component => (this.messages = component)}
          style={messagesStyle}
        >
          {(Object.keys(chat.messages).map(messageKey => {
            const message = chat.messages[messageKey]
            return (
              <div key={messageKey} style={messageStyle}>
                <div style={{ flexBasis: '10%', padding: 10 }}>
                  <img
                    src={message.avatar}
                    title={message.name}
                    alt="avatar"
                    style={avatarStyle} />
                </div>
                <div style={{display: 'flex', alignItems: 'center', flexBasis: '80%', justifyContent: 'center' }}>{message.message}</div>
                {
                  message.uid === currentUser.uid &&
                  <div
                    style={{ position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                    onClick={() => this.deleteMessage(messageKey)}
                  >X</div>
                }
              </div>
            )
          }))}
        </div>
      )
    }
  }

  renderInput = () => {
    const { message } = this.state
    const { chat } = this.props
    if (chat) {
      return (
        <div style={{ display: 'flex', marginTop: 'auto' }}>
          <input
            id="message"
            value={message}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyDown}
            placeholder="Message"
            style={{ flexBasis: '80%', padding: 15 }}
          />
          <button
            onChange={this.handleChange}
            onClick={this.submitMessage}
            value={message}
            style={{ flexBasis: '20%' }}
          >Submit</button>
      </div>)
    }
  }

  render() {
    return (
      <div style={style}>
        {this.renderHeader()}
        {this.renderMessages()}
        {this.renderInput()}
      </div>
    )
  }
}

const avatarStyle = {
  height: 50,
  width: 50,
  borderRadius: '50%'
}

const messagesStyle = {
  maxHeight: 500,
  overflowY: 'auto',
  padding: '0 0 20px 0'
}

const messageStyle = {
  position: 'relative',
  display: 'flex',
  boxShadow: '0 1px 4px #ccc',
  padding: '2px 10px',
  margin: 5,
}

Chat.propTypes = {
  chat: PropTypes.object,
}
Chat.defaultProps = {}

export default Chat
