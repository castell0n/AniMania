document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const grid = document.querySelector(".grid");
    const searchInput = document.querySelector(".search");
    const container = document.getElementById("container");
    
    // // Obtener categoría desde la URL
    // const urlParams = new URLSearchParams(window.location.search);
    // const categoria = decodeURIComponent(urlParams.get('dtcat')) || "Todas";

    const categoria = localStorage.getItem("dtcat") || "Todas";

    // Mensaje de no resultados
    const noResultsMessage = document.createElement("h2");
    noResultsMessage.textContent = "No se encontraron resultados";
    noResultsMessage.className = "categoryTitle";
    noResultsMessage.style.display = "none";
    container.appendChild(noResultsMessage);

    // Obtener animes filtrados por categoría
    const aniManiaRef = db.collection("AniMania").doc("580qMp6ggI7ixvpiMADy");
    const animesQuery = aniManiaRef.collection("animes").where("details.categories", "array-contains", categoria);

    animesQuery.get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            noResultsMessage.textContent = `No hay animes en la categoría "${categoria}"`;
            noResultsMessage.style.display = "flex";
            grid.style.display = "none";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const anime = {
                id: doc.id,
                portada: data.img,
                titulo: data.title,
                status: data.details?.status || "Desconocido",
                fecha_estreno: data.details?.release ? 
                    data.details.release.replace(/-/g, '/') : "Desconocido",
                categorias: data.details?.categories || []
            };

            // Crear tarjeta
            const card = document.createElement("div");
            card.className = "card";
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
        noResultsMessage.style.display = "block";
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
