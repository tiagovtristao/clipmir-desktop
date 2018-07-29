export const addAliveService = ({ uuid, name }) => ({
  type: 'ADD_ALIVE_SERVICE',
  id: uuid,
  name,
});

export const addEstablishedConnection = uuid => ({
  type: 'ADD_ESTABLISHED_CONNECTION',
  id: uuid,
});
