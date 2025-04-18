document.addEventListener('DOMContentLoaded', () => {
    // Obtener el enlace del video desde localStorage o usar uno por defecto
    const vidlink = localStorage.getItem("vidlink") || "https://pixeldrain.com/api/file/gxQJoZbR";
    
    // Configuración de controles
    const controls = [
        'play-large',
        'restart',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'fullscreen'
    ];

    // Opciones del reproductor
    const playerOptions = {
        controls,
        ratio: '16:9',
        settings: ['quality', 'speed'],
        storage: { enabled: true, key: 'plyr' },
        fullscreen: { enabled: true, fallback: true, iosNative: true }
    };

    // Inicializar el reproductor
    const player = new Plyr('#player', playerOptions);
    
    // Establecer la fuente del video
    player.source = {
        type: 'video',
        sources: [{
            src: vidlink,
            type: 'video/mp4'
        }],
        poster: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg'
    };

    // Elementos del DOM
    const landscapeMessage = document.getElementById('landscape-message');
    const container = document.querySelector('.container');

    // Función para verificar orientación
    function checkOrientation() {
        if (window.innerHeight > window.innerWidth) {
            landscapeMessage.style.display = 'flex';
        } else {
            landscapeMessage.style.display = 'none';
        }
    }

    // Forzar landscape en dispositivos que lo permitan
    function tryForceLandscape() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(error => {
                console.log('No se pudo bloquear la orientación:', error);
                checkOrientation();
            });
        } else {
            checkOrientation();
        }
    }

    // Evento cuando el reproductor está listo
    player.on('ready', event => {
        console.log('Reproductor listo');
        tryForceLandscape();
        
        // Intentar entrar en pantalla completa (puede ayudar en algunos dispositivos)
        setTimeout(() => {
            player.fullscreen.enter().catch(e => console.log('Pantalla completa no disponible:', e));
        }, 1000);
    });

    // Reproducir automáticamente si es posible
    player.on('loadeddata', () => {
        player.play().catch(e => console.log('Autoplay no permitido:', e));
    });

    // Manejar cambios de orientación
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
        setTimeout(checkOrientation, 500);
    });

    // Verificar orientación inicial
    checkOrientation();
});
