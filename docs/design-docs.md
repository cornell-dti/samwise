# Design Document

## Structure of our codebase

- `backend/` folder: It is unused after Firebase migration. It will be removed soon.
- `course-info/` folder: It contains scripts to fetch all the exam and course information from 
   Cornell websites.
- `docs/` folder: It is the place where we document important design decisions.
- `frontend/` folder: It contains all of our frontend code.

## Architecture Overview

Unlike traditional web applications that have a clearly defined frontend or backend boundary,
the Samwise team uses the [serverless](https://en.wikipedia.org/wiki/Serverless_computing) approach.
Since Samwise's backend logic is very simple, we can rely on 
[Firebase](https://firebase.google.com/)'s Auth and Database to handle the backend logic. In case
the app requires more complicated logic in the future, we can always use 
[Firebase functions](https://firebase.google.com/docs/functions/) to address the deficiencies in
Firebase's config.

In the current version of Samwise, we use [Firebase Auth](https://firebase.google.com/docs/auth/) to
authenticate users and [Firestore](https://firebase.google.com/docs/firestore) to store user
information. Security is enforced by 
[Firestore Security Rules](https://firebase.google.com/docs/firestore/security/overview) and the
config is store [here](../firestore.rules). We adopted Firebase to satisfy our need for an
efficient and correct realtime data syncing system.

Our frontend subscribes from firestore to ensure we have the latest data. The workflow will be
introduced in the next section.

## Frontend Overview

The frontend workflow can be summarized with the following ASCII art:

```
     <------------ <------------ <---------------
     |                                          |
     |   (Supported by Firebase Auth)           |
     |      |                                   |
     \/     \/                                  |
[LoginBarrier] ------> (user not logged in) ----
    |
    | (when user logged in)
    |
    \/
(Initialize Firebase Listeners to create the following cycle)

[Firestore Listeners] <------ (automatically notify) <----- Firestore
   |                                                           /\
   | (push changes to)                                         |
   |                          (add/update/delete documents in) |
   \/                                                          |
[Redux Store]                                      [Our Various Firestore Actions]
   |                                                           /\
   | (push changes to)                                 (calls) |
   |                                                           |
   -----------> [Our Various React Components] -------> ------->
```

## Firestore & Redux Store Overview

You can see the type definition of Firestore [here](../frontend/src/firebase/firestore-types.js) 
and type definition of redux store [here](../frontend/src/store/store-types.js).

We have our Firestore and Redux Store to have almost the same shape. In this way, we can speed up
our development process by making as less data conversion as possible. We only have some slight
shape different when we absolutely need them.
