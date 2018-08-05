import React from 'react';
import Indicator from './Indicator';

export default class List extends React.Component {
  render() {
    const { list, onItemClick } = this.props;

    return (
      <ul>
        { list.map(({ id, name, active }) => (
          <li key={id} onClick={() => onItemClick(id)}>
            <Indicator color={active ? '#009b00' : '#a8a8a8'} /> {name}
          </li>
        )) }
      </ul>
    );
  }
}
