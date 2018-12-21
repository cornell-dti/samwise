// @flow strict

import { connect } from 'react-redux';
import type { ComponentType, AbstractComponent } from 'react';
import type { State } from './store-types';

/**
 * The connected component type.
 */
// flowlint-next-line unclear-type:off
export type ConnectedComponent<Config: Object, RP: Object = {||}> =
  AbstractComponent<$Diff<Config, RP>, void>;

/**
 * The utility type to obtain own props in fullConnect.
 */
// flowlint-next-line unclear-type:off
type OwnProp<C: Object, RSP: Object, MDP: Object> = $Diff<C, {| ...RSP; ...MDP |}>;

/**
 * A connect function for react-redux that uses the normal mapStateToProps and actionCreators.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function fullConnect<C: Object, RSP: Object, MDP: Object>( // flowlint-line unclear-type:off
  mapStateToProps: (state: State, ownProps: OwnProp<C, RSP, MDP>) => RSP,
  actionCreators: MDP,
): (ComponentType<C>) => (ConnectedComponent<OwnProp<C, RSP, MDP>>) {
  return connect(mapStateToProps, actionCreators);
}

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @return {*} the connect function that connects a react component.
 */
export function stateConnect<Config: Object, RSP: Object>( // flowlint-line unclear-type:off
  mapStateToProps: (state: State, ownProps: $Diff<Config, RSP>) => RSP,
): (component: ComponentType<Config>) => ConnectedComponent<Config, RSP> {
  return connect(mapStateToProps, null);
}

/**
 * A connect function for react-redux that just uses the action creators.
 *
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function dispatchConnect<Config: Object, MDP: Object>( // flowlint-line unclear-type:off
  actionCreators: MDP,
): (component: ComponentType<Config>) => ConnectedComponent<Config, MDP> {
  return connect(null, actionCreators);
}
