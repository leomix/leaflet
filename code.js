
var markersById = {};

var locations = [
    ["CASA DE MAMA", 19.37658, -99.181137],
    ["CASA ADOLFO", 19.352773, -99.162769],
    ["CENTRO HISTORICO", 19.434057, -99.131012],
    ["TRABAJO ANTERIOR", 19.443932, -99.087925],
    ["CASA DE DAVID", 19.683283, -99.143758]
]
let myMap = L.map('myMap').setView([19.379211, -99.20414], 13)

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a', 'b', 'c']
}).addTo(myMap);

let iconMarker = L.icon({
    iconUrl: 'marker2.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
})

//A +1DESHABILITA EL ZOOM EN DOBLE CLICK +2 PONER MARCADOR EN ESE PUNTO +4 PEDIR UN NOMBRE A LA ETIQUETA Y +5 TENER LA FUNCIONALIDAD DE CENTRARSE AL DARLE CLIK AL MARCADOR +6 AGREGANDOLO AL LISTADO DE MARCADORES
// SE TRASLAPA CON D USAR UNO O OTRO

myMap.doubleClickZoom.disable()

myMap.on('dblclick', e => {
    const latLng = myMap.mouseEventToLatLng(e.originalEvent);
    const nombre = prompt("Please enter your name")
    const id = Object.keys(markersById).length
    createMarker(latLng.lat, latLng.lng,nombre,id)
    createDiv(id,nombre)
    
})

//B USA LA FUNCTION NATIVA DE LEAFLET PARA ENCONTRAR LA UBICACION DEL USUARIO Y MARCAR UN CIRCULO Y UN MARCADOR EN SU UBICACION

myMap.locate({setView: true, 
    maxZoom: 16, 
    watch:true
  });

function onLocationFound(e) {
var radius = e.accuracy / 2;
L.marker(e.latlng).addTo(myMap)
.bindPopup("You are within " + radius + " meters from this point").openPopup();
L.circle(e.latlng, radius).addTo(myMap);
}

myMap.on('locationfound', onLocationFound);

//C USA LA GEOLOCALIZACION NATIVA DEL EXPLORADOR PARA PONER UN MARCADOR ENCIMA DE TU UBICACION ACTUAL

navigator.geolocation.getCurrentPosition(
    (pos) => {
        const { coords } = pos
        const { latitude, longitude } = coords
        L.marker([latitude, longitude], { icon: iconMarker }).addTo(myMap)

        setTimeout(() => {
            myMap.panTo(new L.LatLng(latitude, longitude))
        }, 1000)
    },
    (error) => {
        console.log(error)
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    })

//D MUESTRA LA LATITUD Y LONGITUD AL DAR CLICK CON EL MOUSE SOBRE EL MAPA **AHORA TAMBIEN BUSCA LA DIRECCION Y LA AÑADE EN UN DIV EN LA PARTE INFERIOR DEL MAPA
// SE TRASLAPA CON A USAR UNO O OTRO

// async function onMapClick(e) {
//     const result = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`)
//     const json = await result.json()
//     const nueva_dir = document.createElement('div')
//     nueva_dir.innerHTML = json.display_name
//     document.querySelector('.direcciones').appendChild(nueva_dir)

// }

// myMap.on('click', onMapClick)

//E FUNCION QUE AGREGA LOS MARCADORES QUE SE OBTIENEN DEL ARREGLO DE DIRECCIONES DEL INICIO 

for (var i = 0; i < locations.length; i++) {
    createDiv(i,locations[i][0])
    createMarker(locations[i][1], locations[i][2],locations[i][0],i)

}
function centerMapOnPost() {
    myMap.panTo(this.getLatLng())
}

//F AGREGA UN CONTROL PARA BUSCAR UNA DIRECCION Y APUNTAR EN ESA DIRECCION

myMap.addControl( new L.Control.Search({
    url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}+Mexico',
    jsonpParam: 'json_callback',
    propertyName: 'display_name',
    propertyLoc: ['lat','lon'],
    marker: L.circleMarker([0,0],{radius:30}),
    autoCollapse: true,
    autoType: false,
    minLength: 2
}) );

//G FUNCION GENERAL PARA AGREGAR EL DIV DEBAJO DEL MAPA

function createDiv(id,text){
    const nueva_dir = document.createElement('div')
    nueva_dir.innerHTML = text
    nueva_dir.onclick = function(){
        myMap.panTo(markersById[id].getLatLng())
        markersById[id].fire('click')
    };
    document.querySelector('.direcciones').appendChild(nueva_dir)
}

//H FUNCION PARA GENERAR LOS MARCADORES

function createMarker(lat,lng,text,i){
    marker = new L.marker([lat, lng], { icon: iconMarker })
        .bindPopup(text)
        .addTo(myMap)
        .on('click', centerMapOnPost)
    markersById[i]=marker
    const group = new L.featureGroup(Object.values(markersById));
    myMap.fitBounds(group.getBounds());
}