document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    // 1. Configuración inicial
    const categoryButtons = document.querySelectorAll(".category-btn");
    const statusButtons = document.querySelectorAll(".status-btn");
    const selectedCategories = [];
    let animeIdCounter = 1;

    // 2. Manejo de categorías
    categoryButtons.forEach(button => {
        button.addEventListener("click", function() {
            const category = this.dataset.category;
            const index = selectedCategories.indexOf(category);

            if (index > -1) {
                this.classList.remove("selected");
                selectedCategories.splice(index, 1);
            } else if (selectedCategories.length < 3) {
                this.classList.add("selected");
                selectedCategories.push(category);
            } else {
                alert("Máximo 3 categorías permitidas");
            }
        });
    });

    // 3. Manejo de estado
    statusButtons.forEach(button => {
        button.addEventListener("click", function() {
            statusButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");
            document.getElementById("animeStatus").value = this.dataset.status;
        });
    });

    // 4. Sistema de imágenes
    const dropZone = document.getElementById("dropZone");
    const imageInput = document.getElementById("animeImage");
    const imagePreview = document.getElementById("imagePreview");
    const imageBase64Input = document.getElementById("imageBase64");

    dropZone.addEventListener("click", () => imageInput.click());

    // Drag & Drop handlers
    ["dragover", "dragleave", "drop"].forEach(event => {
        dropZone.addEventListener(event, function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener("dragover", () => {
        dropZone.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "#ddd";
    });

    dropZone.addEventListener("drop", (e) => {
        handleImage(e.dataTransfer.files[0]);
    });

    imageInput.addEventListener("change", (e) => {
        handleImage(e.target.files[0]);
    });

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
                const TARGET_WIDTH = 260;
                const TARGET_HEIGHT = 370;

                canvas.width = TARGET_WIDTH;
                canvas.height = TARGET_HEIGHT;

                const scale = Math.max(
                    TARGET_WIDTH / img.width,
                    TARGET_HEIGHT / img.height
                );

                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const offsetX = (TARGET_WIDTH - newWidth) / 2;
                const offsetY = (TARGET_HEIGHT - newHeight) / 2;

                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                canvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (reader.result.length > 1048576) {
                            alert("La imagen no debe superar 1MB");
                            return;
                        }
                        imagePreview.src = reader.result;
                        imagePreview.style.display = "block";
                        imageBase64Input.value = reader.result;
                    };
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', 0.7);
            };
        };
        reader.readAsDataURL(file);
    }

    // 5. Manejo del formulario
    document.getElementById("animeForm").addEventListener("submit", async function(e) {
        e.preventDefault();

        // Validaciones
        if (selectedCategories.length === 0) return alert("Selecciona al menos 1 categoría");
        if (!imageBase64Input.value) return alert("Debes subir una imagen");

        // Recopilar datos
        const animeData = {
            img: imageBase64Input.value,
            title: document.getElementById("animeTitle").value.trim(),
            details: {
                status: document.getElementById("animeStatus").value,
                categories: selectedCategories,
                description: document.getElementById("animeDescription").value.trim(),
                release: document.getElementById("animeReleaseDate").value,
                end: document.getElementById("animeEndDate").value || null,
                duration: parseInt(document.getElementById("animeDuration").value) || 0,
                language: document.getElementById("animeLanguage").value,
                trailer: document.getElementById("animeTrailer").value.trim(),
                rating: document.getElementById("animeRating").value.trim(),
                isTV: document.getElementById("animeTVType").value.trim(),
                director: document.getElementById("animeDirector").value.trim(),
                studio: document.getElementById("animeStudio").value.trim(),
                caps: document.getElementById("animeCaps").value.trim(),
                guion: document.getElementById("animeGuion").value.trim(),
                relatedDocumentId: document.getElementById("relatedDocumentId").value.trim(),
                openings: getSongValues("openingsContainer"),
                endings: getSongValues("endingsContainer"),
                id: "",
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            },
            episodes: {}
        };

        // Validar URL de YouTube
        if (animeData.details.trailer && !isValidYoutubeUrl(animeData.details.trailer)) {
            return alert("URL de YouTube no válida");
        }

        // Subir a Firebase
        try {
            const docRef = await db.collection('AniMania').doc("580qMp6ggI7ixvpiMADy").collection('animes').add(animeData);
            await docRef.update({ 'details.id': docRef.id });

            alert("Anime guardado exitosamente!");
            this.reset();
            imagePreview.style.display = "none";
            selectedCategories.length = 0;
            categoryButtons.forEach(btn => btn.classList.remove("selected"));
            statusButtons.forEach(btn => btn.classList.remove("selected"));
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar. Verifica la consola.");
        }
    });

    // Funciones auxiliares
    window.addSongField = function(containerId, type) {
        const container = document.getElementById(containerId);
        const input = document.createElement("input");
        input.type = "text";
        input.className = "song-input";
        input.placeholder = `Título del ${type}`;
        container.appendChild(input);

        const linkInput = document.createElement("input");
        linkInput.type = "url";
        linkInput.className = "song-input";
        linkInput.placeholder = `Enlace del ${type}`;
        container.appendChild(linkInput);
    };

    function getSongValues(containerId) {
        const container = document.getElementById(containerId);
        const songInputs = container.children;
        const songs = [];

        for (let i = 0; i < songInputs.length; i += 2) {
            const titleInput = songInputs[i];
            const linkInput = songInputs[i + 1];
            songs.push({
                title: titleInput.value.trim(),
                link: linkInput.value.trim()
            });
        }

        return songs;
    }

    function isValidYoutubeUrl(url) {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
    }
});