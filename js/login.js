// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD79Pmy2mF1lbwYcMkZ82-cWLCeZhR-wHg",
    authDomain: "dsplay-ed00c.firebaseapp.com",
    projectId: "dsplay-ed00c",
    storageBucket: "dsplay-ed00c.firebasestorage.app",
    messagingSenderId: "769189108589",
    appId: "1:769189108589:web:fe53f4d3462fd538071864"
};

// Inicialização do Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Feedback visual
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Autenticando...";
            
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Usuário logado:", userCredential.user);
                    window.location.href = 'painel.html'; // Redireciona para painel.html
                })
                .catch(error => {
                    console.error("Erro de login:", error);
                    document.getElementById('login-message').textContent = getErrorMessage(error);
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
        });
    }
});

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'Email inválido';
        case 'auth/user-disabled': return 'Conta desativada';
        case 'auth/user-not-found': return 'Usuário não encontrado';
        case 'auth/wrong-password': return 'Senha incorreta';
        case 'auth/too-many-requests': return 'Muitas tentativas. Tente mais tarde.';
        default: return 'Erro ao fazer login: ' + error.message;
    }
}