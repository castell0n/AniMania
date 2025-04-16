document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const grid = document.querySelector(".grid");
    const searchInput = document.querySelector(".search");
    const modalSearch = document.getElementById("modalSearch");

    // Mensaje de no resultados
    const noResultsMessage = document.createElement("h2");
    noResultsMessage.textContent = "No se encontraron resultados";
    noResultsMessage.className = "categoryTitle";
    noResultsMessage.style.display = "none";
    modalSearch.appendChild(noResultsMessage);

    // Obtener animes filtrados por categoría
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

            // Redirigir al detalle
            card.addEventListener("click", () => {
                window.location.href = `../view/index.html?dtId=${encodeURIComponent(anime.id)}`;
            });

            grid.appendChild(card);
        });

        // Funcionalidad de búsqueda
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterCards(searchTerm);
        });

    }).catch((error) => {
        console.error("Error:", error);
        noResultsMessage.textContent = "Error al cargar los datos";
        noResultsMessage.style.display = "flex";
        grid.style.display = "none";
    });

    // Función para filtrar cards
    function filterCards(searchTerm) {
        const cards = grid.querySelectorAll(".card");
        let hasMatches = false;

        cards.forEach(card => {
            const title = card.querySelector("h2").textContent.toLowerCase();
            const date = card.querySelector(".timestamp").textContent.toLowerCase();
            const match = title.includes(searchTerm) || date.includes(searchTerm);
            
            card.style.display = match ? "block" : "none";
            if (match) hasMatches = true;
        });

        noResultsMessage.style.display = hasMatches ? "none" : "block";
        grid.style.display = hasMatches ? "grid" : "none";
    }
});