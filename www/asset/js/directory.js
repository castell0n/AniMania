document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search");
    const modalSearch = document.getElementById("modalSearch");
    const grid = modalSearch.querySelector(".grid");
    const categoryButtons = document.querySelectorAll(".btnList");

    // Crear mensaje de "No se encontraron resultados"
    const noResultsMessage = document.createElement("p");
    noResultsMessage.textContent = "No se encontraron resultados";
    noResultsMessage.style.display = "none";
    noResultsMessage.classList.add("noResults");
    modalSearch.appendChild(noResultsMessage);

    // Referencias a Firebase
    const aniManiaRef = db.collection("AniMania").doc("580qMp6ggI7ixvpiMADy");
    const animesRef = aniManiaRef.collection("animes");

    // Función para cargar animes por categoría
    function cargarAnimesPorCategoria(category) {
        // Limpiar grid y mensajes previos
        grid.innerHTML = "";
        noResultsMessage.style.display = "none";
        grid.style.display = "grid";
        categoryButtons.forEach(btn => btn.classList.remove("active"));

        // Marcar botón activo (en caso de que haya animes)
        const activeButton = Array.from(categoryButtons).find(btn => btn.getAttribute("data-category") === category);
        if (activeButton) activeButton.classList.add("active");

        // Obtener IDs de animes de localStorage
        const ids = JSON.parse(localStorage.getItem(category));

        // Mostrar mensaje si no hay animes en la categoría
        if (!ids || ids.length === 0) {
            grid.innerHTML = "";  // Limpiar grid
            noResultsMessage.style.display = "block";  // Mostrar mensaje
            return;
        }

        // Cargar animes de Firebase según los IDs guardados
        ids.forEach(id => {
            animesRef.doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        const anime = {
                            id: doc.id,
                            portada: data.img,
                            titulo: data.title,
                            status: data.details?.status || "Desconocido",
                            fecha_estreno: data.details?.release ? data.details.release.replace(/-/g, '/') : "Desconocido"
                        };

                        // Crear card de anime
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

                        // Redireccionar al hacer click en card
                        card.addEventListener("click", () => {
                            const animeId = encodeURIComponent(anime.id);
                            localStorage.setItem("dtId", animeId);
                            window.location.href = `go:view`;
                        });

                        // Agregar card al grid
                        grid.appendChild(card);
                    }
                })
                .catch(error => {
                    console.error("Error al obtener anime:", error);
                });
        });
    }

    // Asignar evento a botones de categoría
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            cargarAnimesPorCategoria(category);
        });
    });

    // Cargar por defecto categoría "Pausados" y marcar el botón correspondiente como activo
    const defaultCategory = "Pausados";
    const defaultButton = Array.from(categoryButtons).find(button => button.getAttribute("data-category") === defaultCategory);
    if (defaultButton) {
        defaultButton.classList.add("active");
    }
    cargarAnimesPorCategoria(defaultCategory);

    // Buscar en tiempo real en las cards
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();
        filterCards(searchText);
    });

    function filterCards(searchText) {
        const cards = grid.querySelectorAll(".card");
        let found = false;

        cards.forEach(card => {
            const title = card.querySelector("h2").textContent.toLowerCase();
            const date = card.querySelector(".timestamp").textContent.toLowerCase();

            if (title.includes(searchText) || date.includes(searchText)) {
                card.style.display = "block";
                found = true;
            } else {
                card.style.display = "none";
            }
        });

        if (cards.length === 0) {
            // No hay cards cargadas en esta categoría
            noResultsMessage.style.display = "none";
            grid.style.display = "grid";
        } else if (!found) {
            // Hay cards pero ninguna coincide con la búsqueda
            noResultsMessage.style.display = "block";
            grid.style.display = "none";
        } else {
            // Hay coincidencias
            noResultsMessage.style.display = "none";
            grid.style.display = "grid";
        }
    }
});
