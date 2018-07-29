export default (state = {}, { type, id, name }) => {
  switch (type) {
    case 'ADD_ALIVE_SERVICE':
      return {
        ...state,
        [id]: {
          id,
          name,
        },
      };

    default:
      return state;
  }
};
