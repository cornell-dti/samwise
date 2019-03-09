import React, { ReactElement } from 'react';

type Props = { readonly children: ReactElement };

type State = { readonly hasError: boolean };

export default class ErrorBoundary extends React.PureComponent<Props, State> {
  public readonly state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private ignoreError = (): void => this.setState({ hasError: false });

  public componentDidCatch(error: Error | null, info: object): void {
    // eslint-disable-next-line no-console
    console.log({ error, info }); // necessary for error logging!
  }

  public render(): ReactElement {
    const { children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div>
          <h1>Oh. We messed up!</h1>
          <button type="button" onClick={this.ignoreError}>
            Click me to refresh the page. It may help.
          </button>
        </div>
      );
    }
    return children;
  }
}
