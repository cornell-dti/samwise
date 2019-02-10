# Project Samwise v1.0

_Last updated **02/04/2019**_.

## Contents

- [Project Samwise v1.0](#project-samwise-v10)
  - [Contents](#contents)
  - [About](#about)
  - [Getting Started](#getting-started)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Contribution](#contribution)
  - [Dependencies & Libraries](#dependencies--libraries)
    - [Frontend](#frontend-1)
    - [Backend](#backend-1)
  - [External Documentation](#external-documentation)
  - [Screenshots](#screenshots)
  - [Contributors](#contributors)
    - [Since 2016](#since-2016)
    - [Since 2017](#since-2017)
    - [Since 2018](#since-2018)

## About

A web application designed to help Cornell students plan their semesters.

## Getting Started

### Backend

You will need the latest npm or yarn to run the frontend and at least python 3.7 to run the backend.
Although previous versions of Python may successfully run the code, we want the python version to
be consistent with the python version on the server.

The following operations needs to be performed in the `backend/` folder to run the backend locally.

1. You need to have `pip3` installed and use `pip3 install -r requirements.txt` to install all the
   backend dependencies. When some dependencies changes, you have to run this again.
2. You need to setup all the environment variables in the `backend/.env` file. These information
   will be auto-loaded in the python code. The format of the environment variable file is shown
   below.

   You need to ask a team member about the the value of the secret `DATABASE_URL` and
   `FIREBASE_CONFIG`. If you are not a team member, you can get those on your own in some cloud
   services.

```bash
export DATABASE_URL=the-secret-postgres-url-for-development
FIREBASE_SERVICE_CONFIG="THE_SECRET_FIREBASE_SERVICE_CONFIG"
DEBUG=true
```

After you performed the above mentioned operations, you can run the bash script `./start_server`
or just `python3 run.py` to start the server.

### Frontend

To run the frontend, go to the frontend folder and run `yarn start` or `npm run start`. To build the
frontend, run `yarn build` or `npm run build`. Although Yarn and NPM are both supported, we
recommend Yarn because it's much faster and deterministic.

We use various tools to ensure the quality of our frontend code. They should be installed and
properly configured with your IDE or text editor.

### Contribution

We disabled everyone's ability to directly commit to master branch to ensure code quality. To make
changes to the code, you can create a new branch, have some changes in your branch, and create it
a pull request with good changelog.

You are expected to follow the [Style Guide](docs/style-guide.md) in your contributed code.

## Dependencies & Libraries

### Frontend

- [React](https://reactjs.org/) - a Facebook library for frontend. We use it for frontend UI.
- [Redux](https://redux.js.org/) - a predictable state container for JavaScript apps. We used it for state management.
- [React-Redux](https://github.com/reduxjs/react-redux) - a library for bindings between React and Redux.
- [Firebase](https://firebase.google.com) - a serverless service for auth, database, etc. We used it for auth.
- [React FirebaseUI](https://github.com/firebase/firebaseui-web-react) - a simple sign-in component library for firebase auth.
- [Semantic UI React](https://react.semantic-ui.com/) - a library of pre-styled components in Semantic UI for React.
- [React Calendar](https://www.npmjs.com/package/react-calendar) - A calendar component for React.
- [React Color](https://casesandberg.github.io/react-color/) - a collection of React components for picking colors.
- [React Search Box](https://ghoshnirmalya.github.io/react-search-box/) - a search box component for React.
- [React Toastify](https://fkhadra.github.io/react-toastify/) - a library for emitting toasts in React.

To know about the specific versions of these dependencies, go to [package.json](frontend/package.json).

### Backend

- [Firebase](https://firebase.google.com) - a serverless service for auth, database, etc. We used it for auth.
- [Flask](http://flask.pocoo.org/) - a Python backend framework.
- [SQLAlchemy](https://www.sqlalchemy.org/) - a Python database toolkit.
- [Flask-SQLAlchemy](http://flask-sqlalchemy.pocoo.org/2.3/) - a Flask extension for SQLAlchemy.

To know about the specific versions of these dependencies, go to [package.json](backend/requirements.txt).

## External Documentation

- [Backend API Documentation](https://samwise.docs.apiary.io/) - this is an external Apiary documenting the endpoints for our application.
- [Design Docs](docs/design-docs.md) - this is a place where we document some of our design decisions.

## Screenshots

<img src="./screenshots/placeholder1.png" width="250px" style="margin: 10px; border: 1px rgba(0,0,0,0.4) solid;">

## Contributors

### Since 2016

- **Alice Zhou** - Product Manager
- **Justin Tran** - Front-end Developer
- **Kevin Li** - Back-end Developer/ Designer (2018)

### Since 2017

- **Gautam Mekkat** - Back-end Developer
- **Matthew Epstein** - Product Manager
- **Vivian Shiu** - Designer

### Since 2018

- **Jessica Hong** - Back-end Developer
- **Michael Xing** - Front-end Developer
- **Michelle Park** - Designer
- **Sam Zhou** - Front-end Developer

### Since 2019
- **William Evans** - Back-end Developer

We are a team within **Cornell Design & Tech Initiative**. For more information, see our website [here](https://cornelldti.org/).

![Cornell DTI](https://raw.githubusercontent.com/cornell-dti/design/master/Branding/Wordmark/Dark%20Text/Transparent/Wordmark-Dark%20Text-Transparent%403x.png)
