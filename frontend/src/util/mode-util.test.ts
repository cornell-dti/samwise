import mode from './mode-util';

it('testing is always done in DEV.', () => {
  expect(mode).toBe('DEV');
});
