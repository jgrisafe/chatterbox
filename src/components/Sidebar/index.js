import React, { Component, PropTypes } from 'react';

const style = {
  flexBasis: '20%',
  boxShadow: '0px 1px 4px #ccc',
  marginRight: 10
}

class index extends Component {

  render() {
    console.log(this.props.users) // eslint-disable-line no-console
    return (
      <div style={style}>
        <h2>Users</h2>
        <div className="Sidebar__user-list">
          {this.props.users.map((user) => (<div key={user.uid}>{user.details.name}</div>))}
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
