import { combineReducers } from 'redux';
import aliveServices from './alive-services';
import establishedConnections from './established-connections';

export default combineReducers({
  aliveServices,
  establishedConnections,
});
