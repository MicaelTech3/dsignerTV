const firebaseConfig = {
    apiKey: "AIzaSyBhj6nv3QcIHyuznWPNM4t_0NjL0ghMwFw",
    authDomain: "dsignertv.firebaseapp.com",
    databaseURL: "https://dsignertv-default-rtdb.firebaseio.com",
    projectId: "dsignertv",
    storageBucket: "dsignertv.firebasestorage.app",
    messagingSenderId: "930311416952",
    appId: "1:930311416952:web:d0e7289f0688c46492d18d"
};

// Inicializa o Firebase (mantido para compatibilidade, mas não usado para mídia offline)
firebase.initializeApp(firebaseConfig);

// DOM Elements
const elements = {
    generatorMode: document.getElementById('generator-mode'),
    playerMode: document.getElementById('player-mode'),
    activationKey: document.getElementById('activation-key'),
    viewBtn: document.getElementById('view-btn'),
    exitBtn: document.getElementById('exit-btn'),
    mediaDisplay: document.getElementById('media-display'),
    addMediaBtn: document.getElementById('add-media-btn')
};

// State Variables
let currentKey = loadKey();
let localMedia = null;

// Inicializa o IndexedDB
let db;
const dbRequest = indexedDB.open('DskeyMediaDB', 1);

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('media', { keyPath: 'id' });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    loadLocalMedia();
};

dbRequest.onerror = (event) => {
    console.error('Erro ao abrir IndexedDB:', event.target.error);
};

// Initial Setup
elements.activationKey.textContent = currentKey;
updateGenStatus('Pronto para uso (Offline)', 'offline');

// Event Listeners
elements.viewBtn.addEventListener('click', enterPlayerMode);
elements.exitBtn.addEventListener('click', exitPlayerMode);
elements.addMediaBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = handleMediaSelection;
    input.click();
});
document.addEventListener('keydown', handleKeyboardShortcuts);

// Utility Functions
function loadKey() {
    let key = localStorage.getItem('deviceKey');
    if (!key) {
        key = generateKey();
        localStorage.setItem('deviceKey', key);
    }
    return key;
}

function generateKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

function enterPlayerMode() {
    elements.generatorMode.style.display = 'none';
    elements.playerMode.style.display = 'block';
    displayLocalMedia();
    enterFullscreen();
}

function exitPlayerMode() {
    exitFullscreen();
    elements.playerMode.style.display = 'none';
    elements.generatorMode.style.display = 'flex';
    clearMedia();
}

function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();

    document.body.classList.add('fullscreen-mode');
}

function exitFullscreen() {
    if (document.fullscreenElement || document.mozFullScreenElement || 
        document.webkitFullscreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }

    document.body.classList.remove('fullscreen-mode');
}

function updateGenStatus(message, status) {
    const el = document.getElementById('gen-status');
    el.textContent = message;
    el.className = `connection-status ${status}`;
}

function clearMedia() {
    elements.mediaDisplay.innerHTML = '';
}

// Função para lidar com a seleção de mídia
function handleMediaSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const mediaData = {
            id: 'localMedia',
            type: file.type.startsWith('image/') ? 'image' : 'video',
            data: reader.result
        };
        saveLocalMedia(mediaData);
        localMedia = mediaData;
    };
    reader.readAsDataURL(file);
}

// Função para salvar mídia no IndexedDB
function saveLocalMedia(mediaData) {
    const transaction = db.transaction(['media'], 'readwrite');
    const store = transaction.objectStore('media');
    store.put(mediaData);
    transaction.oncomplete = () => {
        console.log('Mídia salva no IndexedDB');
    };
    transaction.onerror = (event) => {
        console.error('Erro ao salvar mídia:', event.target.error);
    };
}

// Função para carregar mídia do IndexedDB
function loadLocalMedia() {
    const transaction = db.transaction(['media'], 'readonly');
    const store = transaction.objectStore('media');
    const request = store.get('localMedia');
    request.onsuccess = () => {
        if (request.result) {
            localMedia = request.result;
            console.log('Mídia carregada do IndexedDB:', localMedia);
        }
    };
    request.onerror = (event) => {
        console.error('Erro ao carregar mídia:', event.target.error);
    };
}

// Função para exibir mídia local
function displayLocalMedia() {
    elements.mediaDisplay.innerHTML = '';
    if (!localMedia) {
        showError('Nenhuma mídia selecionada');
        return;
    }

    if (localMedia.type === 'image') {
        const img = document.createElement('img');
        img.src = localMedia.data;
        img.onerror = () => showError('Erro ao carregar a imagem');
        elements.mediaDisplay.appendChild(img);
    } else if (localMedia.type === 'video') {
        const video = document.createElement('video');
        video.src = localMedia.data;
        video.autoplay = true;
        video.muted = true;
        video.playsinline = true;
        video.controls = false;
        video.loop = true;
        video.onerror = () => showError('Erro ao carregar o vídeo');
        video.onloadeddata = () => video.play().catch(e => showError('Falha ao reproduzir o vídeo'));
        elements.mediaDisplay.appendChild(video);
    }
}

function showError(message) {
    elements.mediaDisplay.innerHTML = `<div class="error-message">${message}</div>`;
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape' || e.key === 'Backspace') {
        exitPlayerMode();
    }
}

// CSS adicional para erro
const style = document.createElement('style');
style.textContent = `
    .error-message {
        color: #ff5555;
        font-size: 24px;
        text-align: center;
        padding: 20px;
    }
`;
document.head.appendChild(style);