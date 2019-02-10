// @flow strict

import { connect } from 'react-redux';
import type { ComponentType, AbstractComponent } from 'react';
import type { State } from './store-types';

/**
 * The connected component type.
 */
export type ConnectedComponent<-C, -RP = {||}> =
  AbstractComponent<$Diff<C, RP>, void>;

/**
 * The utility type to obtain own props in fullConnect.
 */
type OwnProp<-C, -RSP, -MDP> = $Diff<C, {| ...RSP; ...MDP |}>;

/**
 * A connect function for react-redux that uses the normal mapStateToProps and actionCreators.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function fullConnect<-C, -RSP, -MDP: Object>(
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
export function stateConnect<-C, -RSP>(
  mapStateToProps: (state: State, ownProps: $Diff<C, RSP>) => RSP,
): (ComponentType<C>) => ConnectedComponent<C, RSP> {
  return connect(mapStateToProps, null);
}

/**
 * A connect function for react-redux that just uses the action creators.
 *
 * @param actionCreators the action creator used to bind actions.
 * @return {*} the connect function that connects a react component.
 */
export function dispatchConnect<-C, -MDP: Object>(
  actionCreators: MDP,
): (ComponentType<C>) => ConnectedComponent<C, MDP> {
  return connect(null, actionCreators);
}
