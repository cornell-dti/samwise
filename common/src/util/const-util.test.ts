import { LAST_DAY_OF_EXAMS } from './const-util';

it('We have not passed the end day of exam yet. When this test fails, we should update the date!', () => {
  expect(new Date() < LAST_DAY_OF_EXAMS).toBeTruthy();
});
