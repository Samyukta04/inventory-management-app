
# Pantry Management App

A simple inventory tracking app built with Next.js and Firebase. Helps you keep track of items in your pantry with categories and quantities.

## Features

- Google authentication
- Add/delete items
- Search and filter
- Real-time updates
- Activity log

## Tech Stack

- Next.js 14
- React 18
- Firebase (Auth + Firestore)
- Material-UI

## Setup

1. Clone the repo
```
git clone https://github.com/Samyukta04/inventory-management-app.git
cd inventory-management-app
```

2. Install dependencies
```
npm install
```

3. Create `firebase.js` in the root with your Firebase config:
```
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // your config here
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export { GoogleAuthProvider };
```

4. Enable Google sign-in in Firebase Console
   - Go to Authentication > Sign-in method
   - Enable Google provider

5. Set Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{itemId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Run the app
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── components/
│   └── SignIn.js
├── styles/
│   ├── Home.module.css
│   └── SignIn.module.css
├── layout.tsx
└── page.js
firebase.js
package.json
```

## Usage

- Sign in with Google
- Add items with name, count, and category
- Search to filter items
- Delete items when needed
- Check activity log for recent changes

