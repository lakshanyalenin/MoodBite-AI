import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOyWSZjVo9-Egnxo9GoR3s67a6YReFcLI",
  authDomain: "ninth-album-xs6r9.firebaseapp.com",
  projectId: "ninth-album-xs6r9",
  storageBucket: "ninth-album-xs6r9.firebasestorage.app",
  messagingSenderId: "860236036074",
  appId: "1:860236036074:web:0300dc7c1c4ea576eae493"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc
};
