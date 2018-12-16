// @flow strict

import { connect } from 'react-redux';
import type { ComponentType } from 'react';
import type { State } from './store-types';

/**
 * A connect function for react-redux that uses the normal mapStateToProps and actionCreators.
 *
 * Type Parameters:
 * P: all the props.
 * OP: own props. The props that the user of the component must give.
 * SP: subscribed props. The props that are derived from redux store state.
 * MDP: the props of a collection of actions to be dispatched.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function fullConnect<OP: Object, SP: Object, MDP: Object>(
  mapStateToProps: (state: State) => SP,
  actionCreators: MDP,
): (ComponentType<*>) => (ComponentType<OP>) {
  return connect<ComponentType<*>, State, {}, SP, MDP, OP, _>(mapStateToProps, actionCreators);
}

type ConnectOptions<S: Object, OP: Object, RSP: Object, RMP: Object> = {|
  pure?: boolean,
  withRef?: boolean,
  areStatesEqual?: (next: S, prev: S) => boolean,
  areOwnPropsEqual?: (next: OP, prev: OP) => boolean,
  areStatePropsEqual?: (next: RSP, prev: RSP) => boolean,
  areMergedPropsEqual?: (next: RMP, prev: RMP) => boolean,
  storeKey?: string
|};

/**
 * A connect function for react-redux that uses the normal mapStateToProps and connect options.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param options other connect options.
 * @return {*} the connect function that connects a react component.
 */
export function connectWithOptions<OP: Object, SP: Object>(
  mapStateToProps: (state: State) => SP,
  options: ConnectOptions<State, OP, SP, {}>,
): (ComponentType<*>) => (ComponentType<OP>) {
  return connect<ComponentType<*>, _, State, _, _, SP, _, _, _, _>(
    mapStateToProps, null, null, options,
  );
}

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * Type Parameters:
 * P: all the props.
 * OP: own props. The props that the user of the component must give.
 * SP: subscribed props. The props that are derived from redux store state.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @return {*} the connect function that connects a react component.
 */
export function simpleConnect<OP: Object, SP: Object>(
  mapStateToProps: (state: State) => SP,
): (ComponentType<*>) => (ComponentType<OP>) {
  return fullConnect<OP, SP, {}>(mapStateToProps, {});
}
