// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLVePn0doek-UTTxvHZF9E7DRNCdzG7Mo",
  authDomain: "qrproductosapp.firebaseapp.com",
  projectId: "qrproductosapp",
  storageBucket: "qrproductosapp.firebasestorage.app",
  messagingSenderId: "382837049647",
  appId: "1:382837049647:web:edd884a9dfb367eda939d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
