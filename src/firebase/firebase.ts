import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

/* -----------------------------------------------------------------
   👉  REPLACE THE OBJECT BELOW with YOUR Firebase project’s config
----------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "YOUR‑API‑KEY",
  authDomain: "YOUR‑PROJECT.firebaseapp.com",
  projectId: "YOUR‑PROJECT",
  storageBucket: "YOUR‑PROJECT.appspot.com",
  messagingSenderId: "YOUR‑SENDER‑ID",
  appId: "YOUR‑APP‑ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  await signInWithPopup(auth, googleProvider);
};

export const signOutUser = async () => {
  await signOut(auth);
};

/* ---------- Firestore collections shortcuts ---------- */
export const personalBlocksCol = (uid: string) =>
  collection(db, "users", uid, "personalBlocks");

export const pointsLogCol = (uid: string) =>
  collection(db, "users", uid, "pointsLog");
