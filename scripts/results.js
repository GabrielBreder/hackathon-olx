import { data } from "../api.js";

function queryString(parameter) {
  var loc = location.search.substring(1, location.search.length);
  var param_value = false;
  var params = loc.split("&");

  for (let i = 0; i < params.length; i++) {
    let param_name = params[i].substring(0, params[i].indexOf('='));
    if (param_name == parameter) {
      param_value = params[i].substring(params[i].indexOf('=') + 1)
    }
  }
  if (param_value) {
    return param_value;
  }
  else {
    return undefined;
  }
}

var map = L.map("map").setView([0, 0], 3);
var tiles = L.esri.basemapLayer("Streets").addTo(map);
const housesMarkers = [];

let positions = queryString("id").split("+");
for (let i = 0; i < positions.length; i++) {
  positions[i] = positions[i].split(",")
  createMarker(positions[i][0], positions[i][1])
}
console.log(positions)

function createMarker(latitude, longitude) {
  const myMarker = L.marker([latitude, longitude]);
  myMarker.addTo(map);
  map.setView([latitude, longitude], 14)
  checkHousesDistances(latitude, longitude);
  return myMarker;
}

function createHardMarker(latitude, longitude, name) {
  var centerIcon = L.icon({
    iconUrl: './assets/marker.png',
    iconSize: [34, 34],
    iconAnchor: [16, 34],
  });
  const houseMarker = L.marker([latitude, longitude], { icon: centerIcon });
  houseMarker.addTo(map);
  houseMarker.bindPopup(name);
  return houseMarker;
}

function checkHousesDistances(baseLat, baseLng) {
  const maxDistance = 0.7;
  const div = document.getElementById("cards-container")
  data.map(house => {
    let latitude = house.address.lat;
    let longitude = house.address.lng;

    let radiusDistance = distance(baseLat, latitude, baseLng, longitude);
    if (radiusDistance < maxDistance) {
      let marker = createHardMarker(latitude, longitude, house.name, house.id);
      housesMarkers.push(marker);


      const card = document.createElement('div')
      card.innerHTML = `
      <div class="card mb-3" style="width:700px; max-width: 740px; margin-right: 1rem;" id="${house.id}">
        <div class="row g-0">
          <div class="col-md-4">
          <img src="${house.img}" class="img-fluid rounded-start" alt="...">
          </div>
            <div class="col-md-8">
              <div class="card-body" style="height: 100%;">
                <div>
                  <h5 class="card-title">${house.name}</h5>
                  <p class="card-text">${house.address.description}</p>
                </div>
              <div>
              <p class="card-text price">R$ ${house.price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
      div.appendChild(card);

      const results_found = document.getElementById("results-found");
      if (housesMarkers.length == 0) results_found.innerText = `Nenhum imóvel foi encontrado nessa região`;
      else if (housesMarkers.length == 1) results_found.innerText = `1 imóvel encontrado`;
      else results_found.innerText = `${housesMarkers.length} imóveis encontrados`;
    };
  })
}

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