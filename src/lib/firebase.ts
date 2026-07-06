import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyATWjkD3sQhEXlkuH_-EWma9lWHUbhdtmI",
    authDomain: "m-service-2d665.firebaseapp.com",
    projectId: "m-service-2d665",
    storageBucket: "m-service-2d665.firebasestorage.app",
    messagingSenderId: "251602110085",
    appId: "1:251602110085:web:c1534ae698c995fb5b4bec",
    measurementId: "G-7TGV0TCPW0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);