import React from 'react';
import AliveServicesList from './containers/AliveServicesList';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <h2>Nearby devices</h2>

        <AliveServicesList />
      </div>
    );
  }
}
