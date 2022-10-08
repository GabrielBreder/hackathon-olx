import { data } from "./api.js";

var map = L.map("map").setView([0, 0], 3);
var tiles = L.esri.basemapLayer("Streets").addTo(map);
var markers = [];

function distance(lat1, lat2, lon1, lon2) {
  lon1 = lon1 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));
  let r = 6371;

  return (c * r);
}

function createMarker(latitude, longitude) {
  L.marker([latitude, longitude]).addTo(map);
}

function createHardMarker(latitude, longitude) {
  var centerIcon = L.icon({
    iconUrl: './assets/marker.png',
    iconSize: [34, 34],
    iconAnchor: [16, 34],
  });
  L.marker([latitude, longitude], { icon: centerIcon }).addTo(map);
}

function verifica(circleLat, circleLng, circleRad) {
  console.log(data);

  data.map(index => {
    let distancia = distance(index.address.lat, circleLat, index.address.lng, circleLng) * 300;

    if (distancia < circleRad) {
      createHardMarker(index.address.lat, index.address.lng);
    }
  })
}

function atualiza() {
  markers.map(marker => {
    createMarker(marker.lat, marker.lng);
    console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
  })

  if (markers[1]) {
    let centerlat = (markers[0].lat + markers[1].lat) / 2;
    let centerlng = (markers[0].lng + markers[1].lng) / 2;
    var raio = distance(markers[0].lat, markers[1].lat, markers[0].lng, markers[1].lng) * 300;
    verifica(centerlat, centerlng, raio);

    var circle = L.circle([centerlat, centerlng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: raio * 2,
    }).addTo(map);
  }
}

// create the geocoding control and add it to the map
var searchControl = L.esri.Geocoding.geosearch({
  providers: [
    L.esri.Geocoding.arcgisOnlineProvider({
      apikey: 'AAPKa226ff8bde974bad99f9582492514832sflZk2AdxoKznBIyhiskwB2wqy7Zx-rJEF_ujnGePGNKLXsGXkhufkjikP8bDIlX'
    })
  ]
}).addTo(map);
require('dotenv').config();
console.log(process.env.API_KEY)

var results = L.layerGroup().addTo(map);

searchControl.on("results", function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
    markers.push(data.results[i].latlng);
    console.log(markers);
    atualiza();
  }
});

