// Configuración de Firebase (asegúrate de tener esto en key.js)
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('episodeImage');
    const imagePreview = document.getElementById('imagePreview');
    const base64Input = document.getElementById('imageBase64');

    // Manejo de eventos de imagen
    function handleImage(file) {
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            alert("Formato no soportado. Usa JPEG, PNG o WEBP");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Configuración del banner
                const TARGET_WIDTH = 1080;
                const TARGET_HEIGHT = 700;
                canvas.width = TARGET_WIDTH;
                canvas.height = TARGET_HEIGHT;

                // Cálculo de escalado
                const imgAspect = img.width / img.height;
                const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;

                let scale, newWidth, newHeight, offsetX = 0, offsetY = 0;

                if (imgAspect > targetAspect) {
                    // Imagen más ancha
                    scale = TARGET_HEIGHT / img.height;
                    newWidth = img.width * scale;
                    newHeight = TARGET_HEIGHT;
                    offsetX = (TARGET_WIDTH - newWidth) / 2;
                } else {
                    // Imagen más alta
                    scale = TARGET_WIDTH / img.width;
                    newWidth = TARGET_WIDTH;
                    newHeight = img.height * scale;
                    offsetY = (TARGET_HEIGHT - newHeight) / 2;
                }

                // Redimensionar y recortar
                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                // Convertir a JPEG
                canvas.toBlob((blob) => {
                    const newReader = new FileReader();
                    newReader.onloadend = () => {
                        if (newReader.result.length > 2097152) { // 2MB
                            alert("¡Imagen demasiado pesada! (Máximo 2MB)");
                            resetImage();
                            return;
                        }
                        
                        imagePreview.src = newReader.result;
                        imagePreview.style.display = 'block';
                        base64Input.value = newReader.result;
                    };
                    newReader.readAsDataURL(blob);
                }, 'image/jpeg', 0.75);
            };
        };
        reader.readAsDataURL(file);
    }

    // Eventos
    dropZone.addEventListener('click', () => imageInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleImage(e.dataTransfer.files[0]);
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleImage(e.target.files[0]);
    });

    // Función para resetear imagen
    function resetImage() {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        base64Input.value = '';
    }
});

// Manejo del formulario
document.getElementById('episodioForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validación de imagen
    const base64Input = document.getElementById('imageBase64');
    if (!base64Input.value) {
        alert("¡Debes subir un banner para el episodio!");
        return;
    }

    // Referencias de Firestore
    const db = firebase.firestore();
    const animeRef = db.collection('AniMania')
        .doc("580qMp6ggI7ixvpiMADy")
        .collection('animes')
        .doc("KN4yjtNmvEYFlEasQxW7");

    const episodiosRef = db.collection('AniMania')
        .doc("580qMp6ggI7ixvpiMADy")
        .collection('episodios');

    try {
        // Obtener datos del anime
        const animeDoc = await animeRef.get();
        if (!animeDoc.exists) throw new Error("Anime no encontrado");

        // Calcular número de episodio
        const episodios = animeDoc.data().episodios || {};
        const newEpisodeNumber = Object.keys(episodios).length + 1;

        // Crear objeto del episodio
        const nuevoEpisodio = {
            animeId: "KN4yjtNmvEYFlEasQxW7",
            episodeNumber: newEpisodeNumber,
            title: animeDoc.data().title || "Sin título",
            image: base64Input.value, // Imagen procesada
            link: document.getElementById('episodeLink').value.trim(),
            date: new Date().toLocaleDateString('es-ES'),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Actualizar Firestore
        await animeRef.update({
            [`episodios.${newEpisodeNumber}`]: nuevoEpisodio
        });

        await episodiosRef.add(nuevoEpisodio);

        // Resetear formulario
        this.reset();
        document.getElementById('imagePreview').style.display = 'none';
        base64Input.value = '';
        
        alert(`Episodio #${newEpisodeNumber} agregado con éxito!`);

    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
});