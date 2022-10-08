import { data } from "./api.js";

var map = L.map("map").setView([0, 0], 3);
var tiles = L.esri.basemapLayer("Streets").addTo(map);
var markers = [];

function distance(lat1, lat2, lon1, lon2) {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = lon1 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return (c * r);
}

function createMarker(latitude, longitude) {
  L.marker([latitude, longitude]).addTo(map);
}
function createHardMarker(latitude, longitude) {
  var centerIcon = L.icon({
    iconUrl: './assets/marker.png',

    iconSize: [38, 95], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -76]
  });
  L.marker([latitude, longitude], { icon: cent }).addTo(map);
}

function verifica(circleLat, circleLng, circleRad) {
  console.log(data);

  data.map(index => {
    // index.address.lat;
    let distancia = distance(index.address.lat, circleLat, index.address.lng, circleLng) * 300;
    console.log(distancia);
    console.log(circleRad);

    if (distancia < circleRad) {
      console.log("dentro");
      if (distancia < circleRad / 50)
        createMarker(index.address.lat, index.address.lng);
    }
    else {
      console.log("fora");
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
    var circleHard = L.circle([centerlat, centerlng], {
      color: 'blue',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: raio / 50,
    }).addTo(map);
  }
}


// create the geocoding control and add it to the map
var searchControl = L.esri.Geocoding.geosearch({
  providers: [
    L.esri.Geocoding.arcgisOnlineProvider({
      // API Key to be passed to the ArcGIS Online Geocoding Service
      apikey: 'AAPKa226ff8bde974bad99f9582492514832sflZk2AdxoKznBIyhiskwB2wqy7Zx-rJEF_ujnGePGNKLXsGXkhufkjikP8bDIlX'
    })
  ]
}).addTo(map);

// create an empty layer group to store the results and add it to the map
var results = L.layerGroup().addTo(map);

// listen for the results event and add every result to the map
searchControl.on("results", function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
    markers.push(data.results[i].latlng);
    console.log(markers);
    atualiza();
  }
});

