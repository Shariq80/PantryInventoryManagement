// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiFFQo_kRct8Lj8uovDerg0nAGmVnGxJM",
  authDomain: "pantry-32b46.firebaseapp.com",
  projectId: "pantry-32b46",
  storageBucket: "pantry-32b46.appspot.com",
  messagingSenderId: "127420427303",
  appId: "1:127420427303:web:55c7f19bfe2868dca33202"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}