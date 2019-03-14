import React from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';
import Loading from './Loading';

it('Loading can render', () => {
  renderIntoDocument(<Loading />);
});
