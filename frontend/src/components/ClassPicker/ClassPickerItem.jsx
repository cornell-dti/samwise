import React from 'react';


function ClassPickerItem({ classColor, classTitle, changeCallback }) {
  return (
    <li style={{ '--custom-color': classColor }}>
      <input data-color={classColor} data-class-title={classTitle} onClick={changeCallback} type="checkbox" />
      {classTitle}
    </li>
  );
}

export default ClassPickerItem;
