// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword,signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { collection, addDoc, query, where, onSnapshot, orderBy, getDocs, doc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcXPKRrAiiFghaTLbqehm9hyhDCpteOvE",
  authDomain: "embrave-p2p-chat.firebaseapp.com",
  projectId: "embrave-p2p-chat",
  storageBucket: "embrave-p2p-chat.appspot.com",
  messagingSenderId: "824979934957",
  appId: "1:824979934957:web:d2bb7bfe509211f577c6e4",
  measurementId: "G-P2D594783D"
};

// Initialize Firebase
// const auth = firebase.auth()
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export {getAuth, onAuthStateChanged, createUserWithEmailAndPassword,signInWithEmailAndPassword,collection, addDoc, db, query, where, onSnapshot, orderBy, updateProfile, signOut, getDocs, doc}
