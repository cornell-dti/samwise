// @flow strict

import React from 'react';
import type { Node } from 'react';
import { GithubPicker } from 'react-color';
import { Icon } from 'semantic-ui-react';
import { AngleDown } from '../../assets/svgs/v.svg'
import colMap from './ListColors';
import styles from './ColorEditor.css';

type Props = {|
  +color: string,
  +onChange: (color: string) => void;
|};
type State = {| +doesShowEditor: boolean |};

const colArray: string[] = Object.keys(colMap);

export default class ColorEditor extends React.Component<Props, State> {
  state: State = { doesShowEditor: false };

  /**
   * Toggle the editor.
   */
  toggleEditor = () => this.setState(s => ({ doesShowEditor: !s.doesShowEditor }));

  /**
   * Edit the color.
   *
   * @param {{hex: string}} e the color object from color picker.
   */
  onChangeComplete = (e: { hex: string }) => {
    const { onChange } = this.props;
    onChange(e.hex);
    this.setState({ doesShowEditor: false });
  };

  render(): Node {
    const { color } = this.props;
    const { doesShowEditor } = this.state;
    return (
      <React.Fragment>
        <button type="button" className={styles.ColorEdit} onClick={this.toggleEditor}>
          {colMap[color.toLowerCase()]}
          <span className={styles.ColorDisplay} style={{ backgroundColor: color }} />
          <AngleDown className={styles.Arrow}  />   // use AngleDown
        </button>
        {doesShowEditor && (
          <div className={styles.ColorPicker}>
            <GithubPicker
              color={color}
              onChangeComplete={this.onChangeComplete}
              triangle="top-right"
              colors={colArray}
            />
          </div>
        )}
      </React.Fragment>
    );
  }
}
