import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { AppContainer } from 'react-hot-loader';
import reducers from './reducers';
import { addAliveService, addEstablishedConnection } from './actions';
import server from './server';
import App from './App';

let store = createStore(reducers);

server.on('aliveService', data => {
  store.dispatch(addAliveService(data));
});

server.on('establishedConnection', uuid => {
  store.dispatch(addEstablishedConnection(uuid));
});

let render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>,
    document.getElementById('App') // eslint-disable-line
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}
