// @flow strict

import { connect } from 'react-redux';
import type { ComponentType } from 'react';
import type { State } from './store-types';

/**
 * A connect function for react-redux that just uses the normal mapStateToProps.
 *
 * @param mapStateToProps the normal mapStateToProps function.
 * @return {*} the connect function that connects a react component.
 */
export function simpleConnect<P: Object, OP: Object, SP: Object>(
  mapStateToProps: (state: State) => SP,
): (ComponentType<P>) => (ComponentType<OP>) {
  return connect<ComponentType<P>, _, {}, _, _, OP, _>(mapStateToProps, {});
}
