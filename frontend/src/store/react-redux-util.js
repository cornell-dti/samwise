// @flow strict

import { connect } from 'react-redux';
import type { ComponentType } from 'react';
import type { State } from './store-types';

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * Type Parameters:
 * P: all the props.
 * OP: own props. The props that the user of the component must give.
 * SP: subscribed props. The props that are derived from redux store state.
 * MP: the props of a collection of actions to be dispatched.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function fullConnect<P: Object, OP: Object, SP: Object, MP: Object>(
  mapStateToProps: (state: State) => SP,
  actionCreators: MP,
): (ComponentType<P>) => (ComponentType<OP>) {
  return connect<ComponentType<P>, _, MP, _, _, OP, _>(mapStateToProps, actionCreators);
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
export function simpleConnect<P: Object, OP: Object, SP: Object>(
  mapStateToProps: (state: State) => SP,
): (ComponentType<P>) => (ComponentType<OP>) {
  return fullConnect(mapStateToProps, {});
}
