import React, { ReactElement } from 'react';
import FrontendCrash from '../../../assets/error/frontendCrash.png';

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
          <img
            src={FrontendCrash}
            alt="Uh oh - we broke something"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
              position: 'absolute',
              zIndex: -1,
              left: 0,
              top: 0,
            }}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            padding: '10px',
            textAlign: 'right',
            fontSize: '150%',
          }}
          >
            <p>
              Come yell at us:&nbsp;
              <a
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://goo.gl/forms/PZUZ1Ze6kN82EmcD2"
              >
                  Send Feedback
              </a>
            </p>
            <button type="button" onClick={this.ignoreError}>
              Click me to refresh the page. It may help.
            </button>
          </div>
        </div>
      );
    }
    return children;
  }
}
