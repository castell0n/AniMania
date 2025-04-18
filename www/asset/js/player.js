const vidlink = localStorage.getItem("vidlink") || "Todas";

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const videoContainer = document.getElementById('video-container');
    const playBtn = document.getElementById('play-btn');
    const bigPlayBtn = document.getElementById('big-play-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const progressTime = document.getElementById('progress-time');
    const currentTimeElement = document.getElementById('current-time');
    const durationElement = document.getElementById('duration');
    const muteBtn = document.getElementById('mute-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const speedOptions = document.querySelectorAll('.speed-option');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const retryBtn = document.getElementById('retry-btn');
    const notification = document.getElementById('notification');
    
    // Crear botón de landscape
    const landscapeBtn = document.createElement('button');
    landscapeBtn.className = 'control-btn landscape-btn';
    landscapeBtn.title = 'Orientación Landscape';
    landscapeBtn.innerHTML = '<i class="fas fa-mobile-alt"></i>';
    const rightControls = document.querySelector('.right-controls');
    rightControls.insertBefore(landscapeBtn, settingsBtn);
    
    // Variables para controlar la visibilidad de los controles
    let controlsTimeout;
    const CONTROLS_HIDE_DELAY = 3000; // 3 segundos
    let mouseMoveTimer;
    let isMouseOverVideo = false;
    
    // Estados del reproductor
    let isBuffering = false;
    let wasPlayingBeforeError = false;
    
    // Inicializar controles ocultos
    hideControls();

    video.src = vidlink;

    // Eventos para mostrar/ocultar controles
    videoContainer.addEventListener('mouseenter', () => {
        isMouseOverVideo = true;
        showControls();
    });
    
    videoContainer.addEventListener('mouseleave', () => {
        isMouseOverVideo = false;
    });
    
    // Detectar movimiento del mouse en todo el documento
    document.addEventListener('mousemove', (e) => {
        if (isMouseOverVideo) {
            showControlsTemporarily();
            
            clearTimeout(mouseMoveTimer);
            mouseMoveTimer = setTimeout(() => {
                if (!video.paused) {
                    hideControls();
                }
            }, CONTROLS_HIDE_DELAY);
        }
    });
    
    // Play/Pause
    playBtn.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    
    function togglePlay() {
        if (video.paused) {
            video.play().catch(error => {
                showError("No se pudo reproducir el video: " + error.message);
            });
            videoContainer.classList.remove('paused');
        } else {
            video.pause();
            videoContainer.classList.add('paused');
        }
        showControlsTemporarily();
    }
    
    // Actualizar icono de play/pause
    video.addEventListener('play', function() {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bigPlayBtn.style.display = 'none';
        hideError();
        videoContainer.classList.remove('paused');
        startControlsTimer();
    });
    
    video.addEventListener('pause', function() {
        if (!isBuffering) {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            bigPlayBtn.style.display = 'flex';
            videoContainer.classList.add('paused');
        }
        showControls();
    });
    
    // Retroceder 10 segundos
    rewindBtn.addEventListener('click', function() {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showNotification("Retrocedido 10 segundos");
        showControlsTemporarily();
    });
    
    // Barra de progreso
    video.addEventListener('timeupdate', updateProgress);
    
    function updateProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        
        currentTimeElement.textContent = formatTime(video.currentTime);
        
        if (!isNaN(video.duration)) {
            durationElement.textContent = formatTime(video.duration);
        }
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Click en la barra de progreso para saltar
    progressContainer.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const isLandscape = videoContainer.classList.contains('landscape');
        
        let clickX;
        if (isLandscape) {
            clickX = e.clientY - rect.top;
        } else {
            clickX = e.clientX - rect.left;
        }
        
        const width = isLandscape ? rect.height : rect.width;
        const duration = video.duration;
        video.currentTime = (clickX / width) * duration;
        showNotification("Saltando a " + formatTime(video.currentTime));
        showControlsTemporarily();
    });
    
    // Mostrar tiempo al pasar el mouse sobre la barra de progreso
    progressContainer.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const isLandscape = videoContainer.classList.contains('landscape');
        
        let clickX;
        if (isLandscape) {
            clickX = e.clientY - rect.top;
        } else {
            clickX = e.clientX - rect.left;
        }
        
        const width = isLandscape ? rect.height : rect.width;
        const duration = video.duration;
        const previewTime = (clickX / width) * duration;
        
        progressTime.textContent = formatTime(previewTime);
        
        if (isLandscape) {
            progressTime.style.top = `${clickX - 20}px`;
            progressTime.style.left = 'auto';
            progressTime.style.right = '0';
        } else {
            progressTime.style.left = `${clickX - 20}px`;
            progressTime.style.top = 'auto';
            progressTime.style.right = 'auto';
        }
        
        progressTime.style.display = 'block';
    });
    
    progressContainer.addEventListener('mouseout', function() {
        progressTime.style.display = 'none';
    });
    
    // Volumen
    muteBtn.addEventListener('click', toggleMute);
    
    function toggleMute() {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
        
        showNotification(video.muted ? "Silenciado" : "Sonido activado");
        showControlsTemporarily();
    }
    
    // Ajustes (velocidad)
    settingsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsMenu.classList.toggle('show');
        showControlsTemporarily();
    });
    
    // Cerrar menú de ajustes al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!settingsBtn.contains(e.target)) {
            settingsMenu.classList.remove('show');
        }
    });
    
    speedOptions.forEach(option => {
        option.addEventListener('click', function() {
            const speed = parseFloat(this.getAttribute('data-speed'));
            video.playbackRate = speed;
            
            speedOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            showNotification("Velocidad: " + speed + "x");
            settingsMenu.classList.remove('show');
            showControlsTemporarily();
        });
    });
    
    // Pantalla completa
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                showError("Error al entrar en pantalla completa: " + err.message);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
        showControlsTemporarily();
    }
    
    // Actualizar duración
    video.addEventListener('loadedmetadata', function() {
        durationElement.textContent = formatTime(video.duration);
    });
    
    // Manejo de eventos de red/buffering
    video.addEventListener('waiting', function() {
        isBuffering = true;
        loadingSpinner.style.display = 'block';
        playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        showNotification("Buffering...");
        showControls();
    });
    
    video.addEventListener('playing', function() {
        isBuffering = false;
        loadingSpinner.style.display = 'none';
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        hideNotification();
        startControlsTimer();
    });
    
    video.addEventListener('stalled', function() {
        showError("Problema de red: el video se ha detenido");
    });
    
    video.addEventListener('error', function() {
        wasPlayingBeforeError = !video.paused;
        let errorMessageText = "Error desconocido al cargar el video";
        
        switch(video.error.code) {
            case 1:
                errorMessageText = "El video fue cancelado durante la carga";
                break;
            case 2:
                errorMessageText = "Error de red al cargar el video";
                break;
            case 3:
                errorMessageText = "Error al decodificar el video";
                break;
            case 4:
                errorMessageText = "El video no es compatible";
                break;
        }
        
        showError(errorMessageText);
        showControls();
    });
    
    // Reintentar cargar el video
    retryBtn.addEventListener('click', function() {
        hideError();
        loadingSpinner.style.display = 'block';
        video.load();
        
        if (wasPlayingBeforeError) {
            video.play().catch(error => {
                showError("No se pudo reproducir el video: " + error.message);
            });
        }
        
        showControlsTemporarily();
    });
    
    // Orientación Landscape
    landscapeBtn.addEventListener('click', toggleLandscape);
    
    function toggleLandscape() {
        videoContainer.classList.toggle('landscape');
        document.body.classList.toggle('landscape');
        
        if (videoContainer.classList.contains('landscape')) {
            landscapeBtn.innerHTML = '<i class="fas fa-desktop"></i>';
            landscapeBtn.title = 'Orientación Normal';
            showNotification("Modo Landscape activado");
        } else {
            landscapeBtn.innerHTML = '<i class="fas fa-mobile-alt"></i>';
            landscapeBtn.title = 'Orientación Landscape';
            showNotification("Modo Normal activado");
        }
        
        setTimeout(() => {
            if (videoContainer.classList.contains('landscape')) {
                video.style.width = 'auto';
                video.style.height = '100%';
            } else {
                video.style.width = '100%';
                video.style.height = 'auto';
            }
        }, 10);
        
        showControlsTemporarily();
    }
    
    // Mostrar/ocultar errores
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        showControls();
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    // Mostrar notificación temporal
    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    function hideNotification() {
        notification.style.display = 'none';
    }
    
    // Detectar cambios en la conexión de red
    window.addEventListener('online', function() {
        showNotification("Conexión a internet restablecida");
        if (wasPlayingBeforeError) {
            video.play().catch(error => {
                showError("No se pudo reanudar el video: " + error.message);
            });
        }
    });
    
    window.addEventListener('offline', function() {
        showError("Se perdió la conexión a internet");
        if (!video.paused) {
            wasPlayingBeforeError = true;
            video.pause();
        }
        showControls();
    });
    
    // Mostrar controles temporalmente
    function showControlsTemporarily() {
        showControls();
        if (!video.paused) {
            startControlsTimer();
        }
    }
    
    // Mostrar controles
    function showControls() {
        clearTimeout(controlsTimeout);
        videoContainer.classList.add('controls-visible');
    }
    
    // Ocultar controles
    function hideControls() {
        if (!video.paused && !isBuffering) {
            videoContainer.classList.remove('controls-visible');
            settingsMenu.classList.remove('show');
        }
    }
    
    // Temporizador para ocultar controles
    function startControlsTimer() {
        clearTimeout(controlsTimeout);
        if (!video.paused) {
            controlsTimeout = setTimeout(hideControls, CONTROLS_HIDE_DELAY);
        }
    }
    
    // Mostrar controles al inicio por un breve momento
    showControlsTemporarily();
});
