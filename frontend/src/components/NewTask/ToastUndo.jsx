import React from 'react';


function ToastUndo({ dispText, changeCallback }) {
  return (
    <span>
      {dispText}
      &nbsp;
      <button type="button" onClick={changeCallback}>Undo</button>
    </span>
  );
}

export default ToastUndo;
