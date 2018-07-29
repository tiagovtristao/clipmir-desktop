import React from 'react';

export default class List extends React.Component {
  render() {
    const { list, onItemClick } = this.props;

    return (
      <ul>
        { list.map(({ id, name, active }) => (
          <li key={id} onClick={() => onItemClick(id)}>
            { active ? `${name} o` : name }
          </li>
        )) }
      </ul>
    );
  }
}
