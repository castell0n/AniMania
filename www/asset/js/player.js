const vidlink = localStorage.getItem("vidlink") || "Todas";
var player = new Playerjs({id:"player", file:vidlink});
