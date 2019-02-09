# Project Samwise v1.0

## Contents

- [About](#about)
- [Getting Started](#getting-started)
- [Dependencies & Libraries](#dependencies--libraries)
- [External Documentation](#external-documentation)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
​
## About

A web application designed to help Cornell students plan their semesters.
​
## Getting Started

You will need the latest npm or yarn to run the frontend and at least python 3.6 to run the backend.

To run the frontend, go to the frontend folder and run `npm run start` or `yarn start`. To build the
frontend, run `npm run build` or `yarn build`.

Before running the backend, you also need to setup some environment variables. The format is shown
below

```bash
# In file backend/.env
export DATABASE_URL=the-secret-postgres-url-for-development
FIREBASE_CONFIG=app/serviceAccount.json
DEBUG=true
```

You need to ask a team member about the the value of the secret `DATABASE_URL` and 
`FIREBASE_CONFIG`. If you are not a team member, you can get those on your own in some cloud 
services.

_Last updated **02/04/2019**_.

## Dependencies & Libraries
 * [React (16.8.1)](https://reactjs.org/) - a Facebook library for frontend. We use it for frontend UI.
 * [Redux (4.0.1)](https://redux.js.org/) - a predictable state container for JavaScript apps. We used it for state management.
 * [React-Redux (5.1.1)](https://github.com/reduxjs/react-redux) - a library for bindings between React and Redux.
 * [Firebase (5.8.0)](https://firebase.google.com) - a serverless service for auth, database, etc. We used it for auth.
 * [React FirebaseUI (3.1.2)](https://github.com/firebase/firebaseui-web-react) - a simple sign-in component library for firebase auth.
 * [Semantic UI React (0.85.0)](https://react.semantic-ui.com/) - a library of pre-styled components in Semantic UI for React.
 * [React Calendar (2.14.1)](https://www.npmjs.com/package/react-calendar) - A calendar component for React.
 * [React Color (2.14.1)](https://casesandberg.github.io/react-color/) - a collection of React components for picking colors.
 * [React Search Box (2.0.1)](https://ghoshnirmalya.github.io/react-search-box/) - a search box component for React.
 * [React Toastify (4.5.0)](https://fkhadra.github.io/react-toastify/) - a library for emitting toasts in React.
​
## External Documentation

* [Backend API Documentation](https://apiary.io/) - this is an external Apiary documenting the endpoints for our application.
​
## Screenshots

<img src="./screenshots/placeholder1.png" width="250px" style="margin: 10px; border: 1px rgba(0,0,0,0.4) solid;">
​

## Contributors
​
**Since 2016**
* **Alice Zhou** - Product Manager
* **Justin Tran** - Front-end Developer
* **Kevin Li** - Back-end Developer/ Designer (2018)

**Since 2017**
* **Gautam Mekkat** - Back-end Developer
* **Matthew Epstein** - Product Manager
* **Vivian Shiu** - Designer

**Since 2018**
* **Jessica Hong** - Back-end Developer
* **Michael Xing** - Front-end Developer
* **Michelle Park** - Designer
* **Sam Zhou** - Front-end Developer
​

We are a team within **Cornell Design & Tech Initiative**. For more information, see our website [here](https://cornelldti.org/).
<img src="https://raw.githubusercontent.com/cornell-dti/design/master/Branding/Wordmark/Dark%20Text/Transparent/Wordmark-Dark%20Text-Transparent%403x.png">
​
