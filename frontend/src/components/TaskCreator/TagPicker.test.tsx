import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import { NONE_TAG_ID } from 'common/lib/util/tag-util';
import TagPicker from './TagPicker';

const dummyHandler = (): void => { };

const createTest = (tag: string, opened: boolean): void => {
  it(`TagPicker(${tag}, ${opened}) matches snapshot`, () => {
    const tree = renderer.create(
      <ProviderForTesting>
        <TagPicker
          tag={tag}
          opened={opened}
          onTagChange={dummyHandler}
          onPickerOpened={dummyHandler}
        />
      </ProviderForTesting>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
};

createTest(NONE_TAG_ID, false);
createTest(NONE_TAG_ID, true);
createTest('foo', false);
createTest('foo', true);
createTest('bar', false);
createTest('bar', true);
createTest('baz', false);
createTest('baz', true);
