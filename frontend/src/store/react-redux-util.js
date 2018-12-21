// @flow strict

import { connect } from 'react-redux';
import type { ComponentType, AbstractComponent } from 'react';
import type { State, Tag } from './store-types';

/**
 * A connect function for react-redux that uses the normal mapStateToProps and actionCreators.
 *
 * Type Parameters:
 * OP: own props. The props that the user of the component must give.
 * SP: subscribed props. The props that are derived from redux store state.
 * MDP: the props of a collection of actions to be dispatched.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
// flowlint-next-line unclear-type:off
export function fullConnect<OP: Object, SP: Object, MDP: Object>(
  mapStateToProps: (state: State, ownProps: OP) => SP, actionCreators: MDP,
): (ComponentType<{| ...OP; ...SP; ...MDP; |}>) => (AbstractComponent<OP, void>) {
  type UnconnectedComponent = ComponentType<{| ...OP; ...SP; ...MDP; |}>;
  return connect<UnconnectedComponent, State, OP, SP, MDP, OP, _>(mapStateToProps, actionCreators);
}

/**
 * The connected component type.
 */
export type ConnectedComponent<Config: Object, RP: Object> = // flowlint-line unclear-type:off
  AbstractComponent<$Diff<Config, RP>, void>;

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @return {*} the connect function that connects a react component.
 */
// flowlint-next-line unclear-type:off
export function stateConnect<Config: Object, RSP: Object>(
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
// flowlint-next-line unclear-type:off
export function dispatchConnect<Config: Object, MDP: Object>(
  actionCreators: MDP,
): (component: ComponentType<Config>) => ConnectedComponent<Config, MDP> {
  return connect(null, actionCreators);
}
