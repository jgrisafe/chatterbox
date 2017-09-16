import React, { Component, PropTypes } from 'react';

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

  handleChange = (e) => {
    this.setState({ message: e.target.value })
  }

  submitMessage = (e) => {
    const { database, chat, currentUser } = this.props
    const messageObject = {
      name: currentUser.details.name,
      avatar: currentUser.details.avatar,
      message: this.state.message
    }
    database.ref(`chats/${chat.id}/messages`).push(messageObject)
    this.setState({ message: '' })
  }

  deleteMessage = (messageKey) => {
    const { database, chat } = this.props
    database.ref(`chats/${chat.id}/messages/${messageKey}`).remove()
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
    const { chat } = this.props
    if (chat && chat.messages) {
      return (
        <div style={messagesStyle}>
          {(Object.keys(chat.messages).map(messageKey => {
            return (
              <div style={messageStyle}>
                <div style={{ flexBasis: '10%', padding: 10 }}>
                  <img
                    src={chat.messages[messageKey].avatar}
                    title={chat.messages[messageKey].name}
                    alt="avatar"
                    style={avatarStyle} />
                </div>
                <div style={{display: 'flex', alignItems: 'center', flexBasis: '80%', justifyContent: 'center' }}>{chat.messages[messageKey].message}</div>
                <div
                  style={{ position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                  onClick={() => this.deleteMessage(messageKey)}
                >X</div>
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
  overflowY: 'auto'
}

const messageStyle = {
  position: 'relative',
  display: 'flex',
  boxShadow: '0 1px 4px #ccc',
  padding: '2px 10px',
  margin: 5,
}

Chat.propTypes = {}
Chat.defaultProps = {}

export default Chat
