import { data } from "../api.js";

function getAddressLines(e) {
  var r = e.type, t = e.poi, s = e.address, i = e.entityType;
  if ("Point Address" === r || "Address Range" === r || "Cross Streets" === r) return [s.freeformAddress, `${s.municipality}, ${s.country}`];
  if ("POI" === r) return [t.name, s.freeformAddress]; if ("Street" === r) return [s.streetName, `${s.postalCode || ""} ${s.municipality || ""}`];
  if ("Geography" !== r) return [s.freeformAddress]; switch (i) { case "Municipality": return [s.municipality, s.country]; case "MunicipalitySubdivision": return [s.municipalitySubdivision, s.municipality]; case "Country": return [s.country, s.country]; case "CountrySubdivision": return [s.countrySubdivision, s.country]; default: return [s.freeformAddress] }
}

function getResultDistance(e) {
  return void 0 !== e.dist ? e.dist : ""
}
var SearchResultsParser = { getAddressLines: getAddressLines, getResultDistance: getResultDistance };
window.SearchResultsParser = window.SearchResultsParser || SearchResultsParser;

var map = L.map("map", { dragging: false }).setView([-14.2400732, -53.1805017], 4);
var tiles = L.esri.basemapLayer("Streets").addTo(map);

let markers = [];

function createMarker(latitude, longitude, id) {
  const myMarker = L.marker([latitude, longitude]);
  map.setView([latitude, longitude], 15)
  myMarker._id = id;
  myMarker._lat = latitude;
  myMarker._lng = longitude;
  myMarker.addTo(map);
  return myMarker;
}

function createHardMarker(latitude, longitude, id) {
  var centerIcon = L.icon({
    iconUrl: './assets/marker.png',
    iconSize: [34, 34],
    iconAnchor: [16, 34],
  });
  const houseMarker = L.marker([latitude, longitude], { icon: centerIcon });
  houseMarker._id = id;
  houseMarker._lat = latitude;
  houseMarker._lng = longitude;
  houseMarker.addTo(map);
  return houseMarker;
}


const ulSearchItems = document.getElementById("search-items");
const locationInput = document.getElementById("location-input");
let locationSelected = null;

function clearUlList(ul) {
  while (ul.lastChild) {
    ul.removeChild(ul.lastChild);
  }
}

function selectedLocation(location, address) {
  clearUlList(ulSearchItems);
  locationInput.value = `${address[0]}, ${address[1]}`
  locationSelected = location;
}
const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener('click', goToResultsPage)

const addLocationBtn = document.getElementById("add-location-btn");
addLocationBtn.addEventListener('click', () => { addLocationToMap() });

const ulAddedItems = document.getElementById("added-items");
function addLocationToMap() {
  if (locationSelected) {
    const latitude = locationSelected.position.lat;
    const longitude = locationSelected.position.lon;
    const marker = createMarker(latitude, longitude, locationSelected.id);
    markers.push(marker);

    checkHousesDistances(latitude, longitude, locationSelected.id);

    let div = document.createElement("div");
    div.innerHTML = `<li class="list-group-item list-group-item-light selected-locations">
    ${locationInput.value}</li>`
    let closeBtn = document.createElement("button");
    closeBtn.type = "button"; closeBtn.className = "btn-close"; closeBtn.id = marker._id;
    div.id = marker._id;
    closeBtn.addEventListener('click', () => { removeMarker(marker._id) });
    div.firstChild.appendChild(closeBtn);
    ulAddedItems.appendChild(div);
    locationInput.value = "";
    finishBtn.hidden = false;
    locationSelected = null;
  }
}

function removeMarker(id) {
  markers.forEach(marker => {
    console.log("opa")
    if (marker._id == id) {
      map.removeLayer(marker)
      let index = markers.indexOf(marker);
      markers.splice(index)
    };
  })

  housesMarkers.forEach(houseMarker => {
    if (houseMarker._id == id) map.removeLayer(houseMarker);
  })

  let ulChildren = ulAddedItems.children;
  ulAddedItems.removeChild(ulChildren.namedItem(id));
  if (ulChildren.length == 0) finishBtn.hidden = true;
}

const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener('click', getLocationBySearch);

function getLocationBySearch() {
  fetch(`https://api.tomtom.com/search/2/search/${locationInput.value}.json?key=IrmQGBC3GqAradGNxLK5cSIGOpyH57GJ`)
    .then(res => res.json())
    .then(locations => {
      clearUlList(ulSearchItems);
      locations.results.forEach(location => {
        let address = SearchResultsParser.getAddressLines(location);
        let li = document.createElement("li");
        li.innerHTML = `<li class="list-group-item"> ${address[0]}, ${address[1]}</li>`;
        li.addEventListener('click', () => { selectedLocation(location, address) });
        ulSearchItems.appendChild(li);
      })
    })
    .catch(err => console.log(err));
}

export let housesMarkers = [];

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

function checkHousesDistances(baseLat, baseLng, id) {
  const maxDistance = 0.7;

  data.map(house => {
    let latitude = house.address.lat;
    let longitude = house.address.lng;

    let radiusDistance = distance(baseLat, latitude, baseLng, longitude);
    if (radiusDistance < maxDistance) {
      let marker = createHardMarker(latitude, longitude, id);
      housesMarkers.push(marker);
    };
  })
}

function goToResultsPage() {
  let url = '/results.html'
  let ids_url = '?id=';
  markers.forEach(marker => {
    console.log("aqui")
    ids_url = ids_url.concat(`${marker._lat},${marker._lng}+`)
  })
  url = url.concat(ids_url);
  url = url.slice(0, -1);
  window.location.href = url;
}