import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC802cTHxeSyY7sRkdExEI4P4o1fJGDIbk",
    authDomain: "ekoo-manager.firebaseapp.com",
    projectId: "ekoo-manager",
    storageBucket: "ekoo-manager.firebasestorage.app",
    messagingSenderId: "787204950011",
    appId: "1:787204950011:web:b223047b848644dbb9ad5e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);