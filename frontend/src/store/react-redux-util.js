// @flow strict

import { connect } from 'react-redux';
import type { AbstractComponent } from 'react';
import type { State } from './store-types';

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
): (AbstractComponent<{| ...OP; ...SP; ...MDP; |}>) => (AbstractComponent<OP>) {
  type UnconnectedComponent = AbstractComponent<{| ...OP; ...SP; ...MDP; |}>;
  return connect<UnconnectedComponent, State, OP, SP, MDP, OP, _>(mapStateToProps, actionCreators);
}

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * Type Parameters:
 * OP: own props. The props that the user of the component must give.
 * SP: subscribed props. The props that are derived from redux store state.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @return {*} the connect function that connects a react component.
 */
// flowlint-next-line unclear-type:off
export function simpleConnect<OP, SP>(
  mapStateToProps: (state: State, ownProps: OP) => SP,
): (AbstractComponent<{| ...OP; ...SP; |}>) => (AbstractComponent<OP>) {
  return fullConnect<OP, SP, {||}>(mapStateToProps, Object.freeze({}));
}
