// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm7t-XD_WQVscN5Zx9t4RLCAACG4vxR7k",
    authDomain: "creditcard-00.firebaseapp.com",
    projectId: "creditcard-00",
    storageBucket: "creditcard-00.firebasestorage.app",
    messagingSenderId: "118967098183",
    appId: "1:118967098183:web:2dadb0776437969d78ca62"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Collection references
const usersCollection = db.collection('users');
const cardsCollection = db.collection('cards');
const transactionsCollection = db.collection('transactions');

// Export services to use in other scripts
// (Not necessary with script tags, but good practice for modularity) 