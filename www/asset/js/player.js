// // Resto de tu código (creación del iframe, etc.)
// const urlParams = new URLSearchParams(window.location.search);
// const categoria = decodeURIComponent(urlParams.get('vidlink')) || "Todas";

const vidlink = localStorage.getItem("vidlink") || "Todas";

var player = new Playerjs({id:"player", file:vidlink});

// const iframe = document.createElement("iframe");
// iframe.src = vidlink;
// iframe.width = "100%";
// iframe.height = "100%";
// iframe.frameBorder = "0";
// iframe.allowFullscreen = false;
// iframe.style.overflow = "hidden";

// document.getElementById("iframeContainer").appendChild(iframe);
