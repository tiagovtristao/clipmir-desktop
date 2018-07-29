export default (state = [], { type, id }) => {
  switch (type) {
    case 'ADD_ESTABLISHED_CONNECTION':
      if (!state.includes(id)) {
        return [
          ...state,
          id,
        ];
      }

    default: // eslint-disable-line
      return state;
  }
};
