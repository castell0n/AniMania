let openMenu = document.getElementById("btnMenu");
let closeMenu = document.getElementById("menuContent");
let menu = document.getElementById("menu");

openMenu.addEventListener("click", (event) => {
    closeMenu.style.display = "block"; // Mostrar el contenido del menú
    document.body.style.overflow = "hidden";
});

document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !openMenu.contains(event.target)) {
        closeMenu.style.display = "none"; // Ocultar el contenido del menú si se hace clic fuera del menú
        document.body.style.overflow = "inherit";
    }
});

menu.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevenir que el clic dentro del menú cierre el menú
});

// Cargar animes recientes
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid");

    // Referencias a Firebase
    const aniManiaRef = db.collection("AniMania").doc("580qMp6ggI7ixvpiMADy");
    const animesRef = aniManiaRef.collection("animes");

    // Obtener los animes y filtrar los datos necesarios
    animesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data(); // Datos completos
            const anime = {
                id: doc.id, // ID del documento
                portada: data.img, // Imagen del anime
                titulo: data.title, // Título
                status: data.details?.status || "Desconocido", // Estado (Finalizado, En emisión)
                fecha_estreno: data.details?.release ? data.details.release.replace(/-/g, '/') : "Desconocido"
            };

            // Crear la tarjeta de anime
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-id", anime.id);

            card.innerHTML = `
                <img src="${anime.portada}" alt="${anime.titulo}">
                <div class="info">
                    <h2>${anime.titulo}</h2>
                    <div class="details">
                        <span class="dataStatus">${anime.status}</span>
                        <span class="timestamp">${anime.fecha_estreno}</span>
                    </div>
                </div>
            `;

            // Redirigir al detalle del anime al hacer clic
            card.addEventListener("click", function () {
                const animeId = encodeURIComponent(anime.id);
                window.location.href = `view/index.html?dtId=${animeId}`;
            });

            // Añadir la tarjeta al contenedor grid
            grid.appendChild(card);
        });
    }).catch((error) => {
        console.error("Error al obtener los animes:", error);
    });
});