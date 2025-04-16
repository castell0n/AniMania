// Inicializamos las categorías en localStorage si no existen
const categorias = ["Pausados", "Pendientes", "Finalizados"];
categorias.forEach(cat => {
    if (!localStorage.getItem(cat)) {
        localStorage.setItem(cat, JSON.stringify([]));
    }
});

const elemens = {
    ttanm: document.getElementById("ttanm"),
    portada: document.getElementById("portada"),
    statusBadge: document.getElementById("statusBadge"),
    btnTrailer: document.getElementById("btnTrailer"),

    dictrlnk: document.getElementById("dictrlnk"),
    dictr: document.getElementById("dictr"),

    guionlnk: document.getElementById("guionlnk"),
    guion: document.getElementById("guion"),

    stdiolnk: document.getElementById("stdiolnk"),
    stdio: document.getElementById("stdio"),

    opninlnk: document.getElementById("opninlnk"),
    opnin: document.getElementById("opnin"),

    dtnam: document.getElementById("dtnam"),

    ednglnk: document.getElementById("ednglnk"),
    edng: document.getElementById("edng"),

    cntgnr: document.getElementById("cntgnr"),

    txtsnp: document.getElementById("txtsnp"),

    dtatv: document.getElementById("dtatv"),

    dtepis: document.getElementById("dtepis"),

    dtacap: document.getElementById("dtacap"),

    dtamin: document.getElementById("dtamin"),

    dtaini: document.getElementById("dtaini"),

    dtafin: document.getElementById("dtafin"),

    dtarating: document.getElementById("dtarating"),

    listcap: document.getElementById("listcap"),
    ttstr: document.getElementById("ttstr")
};

document.addEventListener("DOMContentLoaded", async () => {
    // const params = new URLSearchParams(window.location.search);
    // const animeId = params.get("dtId");

    const animeId = localStorage.getItem("dtId");
    if (!animeId) {
        console.error("No se encontró el ID del anime en la URL");
        return;
    }

    const aniManiaRef = db.collection("AniMania").doc("580qMp6ggI7ixvpiMADy");
    const animesRef = aniManiaRef.collection("animes").doc(animeId);

    try {
        const doc = await animesRef.get();
        if (!doc.exists) {
            console.error("El anime no existe en la base de datos.");
            return;
        }

        const data = doc.data();

        const datadetails = data.details;
        const episodes = data.episodes;

        const titlename = data.title;
        const portada = data.img;
        if (datadetails.status === 'Emisión') {
            elemens.statusBadge.classList.add('emision');
        } else if (datadetails.status === 'Finalizado') {
            elemens.statusBadge.classList.add('finalizado');
        } else if (datadetails.status === 'Estreno') {
            elemens.statusBadge.classList.add('proximo-estreno');
        }
        const trailer = datadetails.trailer;

        elemens.ttanm.textContent = titlename || 'Estado desconocido';
        elemens.portada.setAttribute("src", portada || 'Estado desconocido');
        elemens.btnTrailer.setAttribute("href", trailer || 'https://youtu.be');

        loadData(datadetails);
        loadCaps(datadetails, episodes);
    } catch (error) {
        console.error("Error al obtener los datos del anime:", error);
    }
});

function loadData(datadetails) {
    const categories = datadetails.categories;

    const openings = datadetails.openings[0];
    const endings = datadetails.endings[0];

    elemens.dictr.textContent = datadetails.director;
    elemens.guion.textContent = datadetails.guion;
    elemens.stdio.textContent = datadetails.studio;

    // Validar y asignar enlaces de openings
    if (openings.link.trim() !== "") {
        elemens.opninlnk.setAttribute("href", openings.link);
        elemens.opninlnk.style.pointerEvents = "auto"; // Habilitar clic
    } else {
        elemens.opninlnk.removeAttribute("href");
        elemens.opninlnk.style.pointerEvents = "none"; // Deshabilitar clic
    }
    // Asignar título del opening
    elemens.opnin.textContent = openings.title;

    // Validar y asignar enlaces de endings
    if (endings.link.trim() !== "") {
        elemens.ednglnk.setAttribute("href", endings.link);
        elemens.ednglnk.style.pointerEvents = "auto"; // Habilitar clic
    } else {
        elemens.ednglnk.removeAttribute("href");
        elemens.ednglnk.style.pointerEvents = "none"; // Deshabilitar clic
    }
    // Asignar título del ending
    elemens.edng.textContent = endings.title;

    categories.forEach(cat => {
        const badge = document.createElement('a');
        badge.className = 'lnkgnr';
        badge.href = `../category/index.html?dtcat=${cat}`;
        badge.textContent = cat || '...';
        elemens.cntgnr.appendChild(badge);
    });

    const relatedDocumentId = datadetails.relatedDocumentId;
    if (relatedDocumentId === "") {
        elemens.dtnam.remove();
    } else {
        elemens.dtnam.relatedDocumentId;
    }

    elemens.dtatv.textContent = datadetails.isTV ? "TV" : "N/A";
    elemens.dtepis.textContent = datadetails.caps ? datadetails.caps + " Cap" : "N/A";
    elemens.dtacap.textContent = datadetails.duration ? datadetails.duration + " Min" : "N/A";
    elemens.dtamin.textContent = datadetails.language ? datadetails.language : "N/A";
    elemens.dtarating.textContent = datadetails.rating ? datadetails.rating : "N/A";

    function formatDate(dateString, defaultText) {
        if (!dateString) return defaultText; // Si no hay fecha, mostrar el texto por defecto
        const date = new Date(dateString.replace(/-/g, '/'));
        if (isNaN(date.getTime())) return "Fecha inválida"; // Manejo de fechas inválidas

        let day = date.getDate(); // Obtiene el día sin ceros iniciales
        let month = date.getMonth() + 1; // Obtiene el mes sin ceros iniciales
        let year = date.getFullYear().toString().slice(-2); // Obtiene los últimos 2 dígitos del año

        return `${day}/${month}/${year}`;
    }

    // Asignar "Estreno" si no hay fecha de release y "Emisión" si no hay fecha de end
    if (elemens?.dtaini) {
        elemens.dtaini.textContent = formatDate(datadetails.release, "Estreno");
    }
    if (elemens?.dtafin) {
        elemens.dtafin.textContent = formatDate(datadetails.end, "Emisión");
    }

    elemens.txtsnp.textContent = datadetails.description;


    // Función para aplicar el estilo al botón seleccionado
    function applySelectedButtonStyle() {
        const idElemento = datadetails.id;

        if (!idElemento) return;

        categorias.forEach(cat => {
            let datosCat = JSON.parse(localStorage.getItem(cat)) || [];

            if (datosCat.includes(idElemento)) {
                // Si el ID está en esta categoría, seleccionamos el botón correspondiente
                const button = document.querySelector(`.itmlst[data-category="${cat}"]`);
                if (button) {
                    button.classList.add("selected");
                }
            }
        });
    }

    // Escuchamos los clics en los botones
    document.querySelectorAll(".itmlst").forEach(button => {
        button.addEventListener("click", () => {
            // Eliminar la clase 'selected' de todos los botones
            document.querySelectorAll(".itmlst").forEach(btn => {
                btn.classList.remove("selected");
            });

            // Agregar la clase 'selected' al botón clickeado
            button.classList.add("selected");

            // Guardar la categoría seleccionada en localStorage
            const categoriaSeleccionada = button.dataset.category;

            const idElemento = datadetails.id;

            if (!idElemento) {
                alert("No se encontró un ID para este elemento.");
                return;
            }

            // Eliminar el id de todas las categorías
            categorias.forEach(cat => {
                let datosCat = JSON.parse(localStorage.getItem(cat));
                const index = datosCat.indexOf(idElemento);
                if (index !== -1) {
                    datosCat.splice(index, 1);
                    localStorage.setItem(cat, JSON.stringify(datosCat));
                }
            });

            // Agregar el id a la categoría seleccionada
            let datosSeleccionados = JSON.parse(localStorage.getItem(categoriaSeleccionada));
            datosSeleccionados.push(idElemento);
            localStorage.setItem(categoriaSeleccionada, JSON.stringify(datosSeleccionados));

            alert(`ID "${idElemento}" movido a la categoría: ${categoriaSeleccionada}`);
        });
    });

    // Aplicar el estilo al botón seleccionado cuando se recarga la página
    applySelectedButtonStyle();
}

function loadCaps(datadetails, episodes) {
    const episodesArray = Object.values(episodes);
    const releaseDate = new Date(datadetails.release);

    elemens.ttstr.innerText = `${episodesArray.length || "0"}/${datadetails?.caps || "0"}`;

    if (!Array.isArray(episodesArray)) {
        console.error("Formato inválido");
        return;
    }

    // Crear cards para cada episodio solo si hay episodios
    if (episodesArray.length > 0) {
        episodesArray.forEach(episode => {
            const card = document.createElement('div');
            card.className = 'itemcard';
            card.setAttribute("data-link", episode.capLink);
            card.innerHTML = `
                <div class="image">
                    <img src="${episode.portada}" alt="${episode.title}">
                </div>
                <div class="details">
                    <h2>${episode.title}</h2>
                    <p>Capítulo: ${episode.capNumber}</p>
                    <p>${episode.time}</p>
                </div>
            `;
            elemens.listcap.appendChild(card);
            card.addEventListener('click', () => {
                const link = card.getAttribute("data-link");
                if (link) {
                    location.href = `player.html?vidlink=${link}`;
                } else {
                    console.error("El enlace no está disponible.");
                }
            });
        });
    }

    // Crear card adicional (Próximo...)
    const additionalCard = document.createElement('div');
    additionalCard.className = 'itemcard';

    let nextChapterNumber, nextDate;

    if (episodesArray.length > 0) {
        // Si hay episodios, usar el último episodio como base
        const lastEpisode = episodesArray[episodesArray.length - 1];
        nextChapterNumber = lastEpisode.capNumber + 1;

        // Calcular nueva fecha (7 días después del último episodio)
        const lastDate = new Date(lastEpisode.time);
        lastDate.setDate(lastDate.getDate() + 7);
        nextDate = lastDate.toISOString().split('T')[0];
    } else {
        // Si no hay episodios, usar la fecha de lanzamiento y capítulo 1
        nextChapterNumber = 1;
        nextDate = releaseDate.toISOString().split('T')[0];
    }

    additionalCard.innerHTML = `
        <div class="image">
            <img src="https://placehold.co/220x150" alt="Próximo capítulo">
        </div>
        <div class="details">
            <h2>Próximo...</h2>
            <p>Capítulo: ${nextChapterNumber}</p>
            <p>${nextDate}</p>
        </div>
    `;
    elemens.listcap.appendChild(additionalCard);
}
