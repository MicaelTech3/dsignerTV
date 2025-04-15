// auth.js

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD79Pmy2mF1lbwYcMkZ82-cWLCeZhR-wHg",
    authDomain: "dsplay-ed00c.firebaseapp.com",
    projectId: "dsplay-ed00c",
    storageBucket: "dsplay-ed00c.firebasestorage.app",
    messagingSenderId: "769189108589",
    appId: "1:769189108589:web:fe53f4d3462fd538071864"
};

// Inicializar Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Exportar serviços do Firebase
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Funções exportadas
const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
};

const signOut = () => {
    return auth.signOut();
};

// Exportação manual para uso como módulo
window.authModule = {
    auth,
    database,
    storage,
    onAuthStateChanged,
    signOut
};