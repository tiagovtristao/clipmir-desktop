import * as React from 'react';

export default (props) => (
  <span
    style={{
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '5px',
      backgroundColor: props.color,
    }}
  />
);
