import React, { ReactElement, useState } from 'react';
import { render } from 'react-dom';
import { act, renderIntoDocument } from 'react-dom/test-utils';
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

function StatefulCheckBox({ disabled }: { readonly disabled: boolean }): ReactElement {
  const [checked, setChecked] = useState(false);
  const onChange = (): void => setChecked((prev) => !prev);
  return (
    <CheckBox checked={checked} onChange={onChange} disabled={disabled} />
  );
}

it('CheckBox can correctly change state.', () => {
  const container = document.createElement('div');
  document.body.append(container);
  act(() => {
    render(<StatefulCheckBox disabled={false} />, container);
  });
  const input = container.querySelector('input');
  if (input == null) {
    throw new Error();
  }
  {
    // use the existence of span to tell the checked state, same below
    const span = container.querySelector('span');
    if (span != null) {
      throw new Error();
    }
  }
  act(() => {
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  {
    const span = container.querySelector('span');
    if (span == null) {
      throw new Error();
    }
  }
  document.body.removeChild(container);
});

it('CheckBox cannot change state when disabled', () => {
  const container = document.createElement('div');
  document.body.append(container);
  act(() => {
    render(<StatefulCheckBox disabled />, container);
  });
  const input = container.querySelector('input');
  if (input == null) {
    throw new Error();
  }
  {
    const span = container.querySelector('span');
    if (span != null) {
      throw new Error();
    }
  }
  act(() => {
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  {
    const span = container.querySelector('span');
    if (span != null) {
      throw new Error();
    }
  }
  document.body.removeChild(container);
});
