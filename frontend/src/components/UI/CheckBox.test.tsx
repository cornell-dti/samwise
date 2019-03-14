import React from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';
import CheckBox from './CheckBox';

it('CheckBox can render', () => {
  const onChange = (): void => { };
  renderIntoDocument(<CheckBox checked onChange={onChange} />);
  renderIntoDocument(<CheckBox checked={false} onChange={onChange} />);
  renderIntoDocument(<CheckBox checked onChange={onChange} inverted={false} />);
  renderIntoDocument(<CheckBox checked={false} onChange={onChange} inverted={false} />);
  renderIntoDocument(<CheckBox checked onChange={onChange} inverted />);
  renderIntoDocument(<CheckBox checked={false} onChange={onChange} inverted />);
  renderIntoDocument(<CheckBox checked onChange={onChange} disabled={false} />);
  renderIntoDocument(<CheckBox checked={false} onChange={onChange} disabled={false} />);
  renderIntoDocument(<CheckBox checked onChange={onChange} disabled />);
  renderIntoDocument(<CheckBox checked={false} onChange={onChange} disabled />);
});
