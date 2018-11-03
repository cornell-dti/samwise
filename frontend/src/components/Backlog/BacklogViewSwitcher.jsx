// @flow strict

import * as React from 'react';
import { Button } from 'semantic-ui-react';
import type { BacklogDisplayOption } from './backlog-types';

type Props = {| +onChange: (option: BacklogDisplayOption) => void |};
type State = {| +displayOption: BacklogDisplayOption |};

/**
 * The component used to render a switcher for different backlog views.
 */
export default class BacklogViewSwitcher extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayOption: 'FOUR_DAYS' };
  }

  render(): React.Node {
    const { onChange } = this.props;
    const { displayOption } = this.state;
    const setDisplayOption = (newDisplayOption: BacklogDisplayOption) => (
      () => {
        onChange(newDisplayOption); // report to parent component
        this.setState({ displayOption: newDisplayOption });
      }
    );
    const renderButton = (option: BacklogDisplayOption, text: string) => (
      <Button active={displayOption === option} onClick={setDisplayOption(option)}>{text}</Button>
    );
    return (
      <Button.Group>
        {renderButton('FOUR_DAYS', '4D')}
        <Button.Or />
        {renderButton('BIWEEKLY', '2W')}
        <Button.Or />
        {renderButton('MONTHLY', 'M')}
      </Button.Group>
    );
  }
}
