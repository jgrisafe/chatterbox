import React, { Component, PropTypes } from 'react';

import './style.css'

const style = {
  flexBasis: '20%',
  boxShadow: '0px 1px 4px #ccc',
  marginRight: 10
}

const userStyle = {
  cursor: 'pointer',
  padding: 5
}

class index extends Component {

  startChat = (user) => {
    const { currentUser, database, setCurrentChat } = this.props
    const chatId = `${user.uid}-${currentUser.uid}`
    const reverseChatId = `${currentUser.uid}-${user.uid}`

    const chat = {
      id: chatId,
      users: {
        [user.uid]: user,
        [currentUser.uid]: currentUser
      }
    }
    const ref1 =  database.ref(`/chats/${chatId}`)
    const ref2 =  database.ref(`/chats/${reverseChatId}`)
    ref1.once('value', (snapshot) => {
      if (snapshot.val()) {
        setCurrentChat(chatId)
      } else {
        ref2.once('value', (snapshot) => {
          if (snapshot.val()) {
            setCurrentChat(reverseChatId)
          } else {
            ref1.set(chat, () => {
              setCurrentChat(chatId)
            })
          }
        })
      }
    })
    
  }

  renderUsers = () => {
    const { currentUser, users } = this.props
    const filteredUsers = users.filter((user) => user.uid !== currentUser.uid)
    if (users) {
      return (filteredUsers.map((user) => (
        <div
          className="Sidebar__user"
          key={user.uid}
          style={userStyle}
          onClick={() => {this.startChat(user)}}
        >
          {user.details.name}
        </div>
      )))
    }
  }

  render() {
    return (
      <div style={style}>
        <h2>Users</h2>
        <div className="Sidebar__user-list">
          {this.renderUsers()}
        </div>
      </div>
    )
  }
}

index.propTypes = {
  users: PropTypes.array.isRequired
}

index.defaultProps = {
  users: []
}

export default index
