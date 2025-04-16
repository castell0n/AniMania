
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB1-HJ8fE77mRPrcg4VpnTQQgaw1AASaWY",
    authDomain: "animania-7b86f.firebaseapp.com",
    projectId: "animania-7b86f",
    storageBucket: "animania-7b86f.firebasestorage.app",
    messagingSenderId: "721346628905",
    appId: "1:721346628905:web:e908cd892b29f0fbea7b38"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
// Obtener la base de datos de Firestore
const db = firebase.firestore();