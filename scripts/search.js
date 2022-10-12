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

var map = L.map("map").setView([0, 0], 3);
var tiles = L.esri.basemapLayer("Streets").addTo(map);

const markers = [];
function createMarker(latitude, longitude) {
  var id;
  if (markers.length < 1) id = 0;
  else id = markers[markers.length - 1]._id + 1;

  const myMarker = L.marker([latitude, longitude]);
  myMarker._id = id;
  myMarker.addTo(map);
  return myMarker;
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

const addLocationBtn = document.getElementById("add-location-btn");
addLocationBtn.addEventListener('click', () => { addLocationToMap() });

const ulAddedItems = document.getElementById("added-items");
function addLocationToMap() {
  if (locationSelected) {
    const latitude = locationSelected.position.lat;
    const longitude = locationSelected.position.lon;
    const marker = createMarker(latitude, longitude);
    markers.push(marker);

    let div = document.createElement("div");
    div.innerHTML = `<li class="list-group-item list-group-item-light selected-locations">
    ${locationInput.value}</li>`
    let closeBtn = document.createElement("button");
    // closeBtn.innerHTML = `<button type="button" class="btn-close" aria-label="Close" id="close-btn-${marker._id}"></button>`
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
    if (marker._id == id) map.removeLayer(marker);
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



