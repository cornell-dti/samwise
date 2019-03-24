# AppInit Documentation

## [`LoginBarrier`](./LoginBarrier.tsx)

### Usage

```tsx
const UserApp = (): ReactElement => (
  <div>Stuff that should only be seen by logged in users</div>
);

/*
 * Using LoginBarrier ensures the computation that involves signed-in user will never be done
 * if the user is not signed in. It also ensures that the data will be loaded when the UserApp
 * is rendered.
 */
const App = (): ReactElement => <LoginBarrier appRender={UserApp} />;
```

### Implementation Strategy

Internally, it setups up two barriers: one for login, one for data loading.

It uses the `useEffect` hook to listen for changes in login and data loading state.

It uses conditional rendering to ensure that the `appRender` function is only called when all the
barriers are passed.
