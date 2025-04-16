document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search");
    const modalSearch = document.getElementById("modalSearch");
    const grid = modalSearch.querySelector(".grid");
    const categoryButtons = document.querySelectorAll(".btnList");

    let currentCategory = "Favoritos"; // Categoría por defecto

    // Crear mensaje de "No se encontraron resultados"
    const noResultsMessage = document.createElement("p");
    noResultsMessage.textContent = "No se encontraron resultados";
    noResultsMessage.style.display = "none";
    noResultsMessage.classList.add("no-results");
    modalSearch.appendChild(noResultsMessage);

    // Función para obtener los datos del localStorage
    function getDataFromLocalStorage() {
        return JSON.parse(localStorage.getItem("animeList")) || {};
    }

    // Función para guardar datos en localStorage
    function saveDataToLocalStorage(data) {
        localStorage.setItem("animeList", JSON.stringify(data));
    }

    // Función para mostrar los datos según la categoría seleccionada
    function showCategory(category) {
        currentCategory = category; // Actualizar categoría actual
        const data = getDataFromLocalStorage();
        grid.innerHTML = ""; // Limpiar la vista anterior

        if (!data[category] || data[category].length === 0) {
            noResultsMessage.style.display = "block";
            grid.style.display = "none";
        } else {
            noResultsMessage.style.display = "none";
            grid.style.display = "grid";

            data[category].forEach(item => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.setAttribute("data-id", item.id);
                card.setAttribute("data-category", category);
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="info">
                        <h2>${item.title}</h2>
                        <div class="details">
                            <span class="dataStatus">${item.status}</span>
                            <span class="timestamp">${item.date}</span>
                        </div>
                        <button class="deleteBtn">Eliminar</button>
                    </div>
                `;
                grid.appendChild(card);

                // Agregar evento de eliminación
                card.querySelector(".deleteBtn").addEventListener("click", function (event) {
                    event.stopPropagation(); // Evitar que el evento de redirección se active al hacer clic en "Eliminar"
                    deleteItem(item.id, category);
                });

                // Agregar evento de redirección al hacer clic en la card
                card.addEventListener("click", function () {
                    const animeTitle = encodeURIComponent(item.title); // Convertir el título a formato URL
                    window.location.href = `../view/index.html?anime=${animeTitle}`;
                });
            });
        }

        // Agregar clase "active" al botón seleccionado
        categoryButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.textContent === category) {
                btn.classList.add("active");
            }
        });
    }

    // Función para eliminar un item de la categoría
    function deleteItem(itemId, category) {
        let data = getDataFromLocalStorage();

        if (data[category]) {
            data[category] = data[category].filter(item => item.id !== itemId);
            saveDataToLocalStorage(data);
            showCategory(category);
        }
    }

    // Mostrar por defecto la categoría "Favoritos"
    showCategory(currentCategory);

    // Evento para cambiar de categoría al hacer clic en los botones
    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            const category = this.textContent.trim();
            showCategory(category);
        });
    });

    // Evento para filtrar en tiempo real
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();
        filterCards(searchText);
    });

    function filterCards(searchText) {
        let found = false;
        const cards = grid.querySelectorAll(".card");

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

        if (!found) {
            noResultsMessage.style.display = "block";
            grid.style.display = "none";
        } else {
            noResultsMessage.style.display = "none";
            grid.style.display = "grid";
        }
    }
});