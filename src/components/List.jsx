import React from 'react';
import Indicator from './Indicator';

export default class List extends React.Component {
  render() {
    const { emptyListText, list, onItemClick } = this.props;

    if (list.length === 0) {
      return (
        <p className="no-list">{emptyListText}</p>
      );
    }

    return (
      <ul className="list">
        { list.map(({ id, name, active }) => (
          <li key={id} onClick={() => onItemClick(id)}>
            <Indicator color={active ? '#87ffbd' : '#33504b'} /> {name}
          </li>
        )) }
      </ul>
    );
  }
}
