import { el } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 */
const locations = [
  { title: 'Reykjavík', lat: 64.1355, lng: -21.8954 },
  { title: 'Akureyri', lat: 65.6835, lng: -18.0878 },
  { title: 'New York', lat: 40.7128, lng: -74.006 },
  { title: 'Tokyo', lat: 35.6764, lng: 139.65 },
  { title: 'Sydney', lat: 33.8688, lng: 151.2093 },
];

/**
 * Render helper functions.
 */
const resultSection = document.createElement("div");
resultSection.style.display = "none";
document.body.appendChild(resultSection);

function renderLoading() {
  resultSection.style.display = "block";
  resultSection.innerHTML = "Bíð eftir svari frá vefþjónustu...";
}

function renderError(error) {
  resultSection.innerHTML = "Villa við að sækja gögn: " + error.message;
}

function renderResults(location, data) {
  resultSection.innerHTML = `<h2>Veðurspá fyrir ${location.title}</h2>`;
  const table = document.createElement("table");
  table.innerHTML = "<tr><th>Klukkustund</th><th>Hitastig (°C)</th><th>Úrkoma (mm)</th></tr>";

  data.hourly.time.forEach((time, i) => {
    const row = table.insertRow();
    row.innerHTML = `<td>${time.substring(11, 16)}</td><td>${data.hourly.temperature_2m[i]}</td><td>${data.hourly.precipitation[i]}</td>`;
  });

  resultSection.appendChild(table);
}

/**
 * Fetch and display weather data for a given location.
 */
async function onSearch(location) {
  renderLoading();
  try {
    const data = await weatherSearch(location.lat, location.lng);
    renderResults(location, data);
  } catch (error) {
    renderError(error);
  }
}

async function fetchWeatherData(position) {
  const { latitude, longitude } = position.coords;
  const location = { title: `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, lat: latitude, lng: longitude };
  await onSearch(location);
}

/**
 * Handles user location-based search with geolocation.
 */
function onSearchMyLocation() {
  if (!navigator.geolocation) return alert("Vafrinn þinn styður ekki staðsetningartengingu.");
  navigator.geolocation.getCurrentPosition(fetchWeatherData, (error) => {
    alert("Ekki var hægt að sækja staðsetningu: " + error.message);
  });
}

/**
 * Render UI elements and set event listeners.
 */
function renderUI() {
  const header = el('h1', {}, 'Veðurspá');
  const intro = el('p', {}, 'Veldu stað til að sjá hita- og úrkomuspá.');
  const locationButton = el('button', { click: onSearchMyLocation }, 'Leita út frá staðsetningu minni');

  const locationsList = el('ul', { class: 'locations__list' });
  locations.forEach((loc) => locationsList.appendChild(renderLocationButton(loc)));

  const locationsContainer = el('div', { class: 'locations' }, locationsList);

  document.body.append(header, intro, locationButton, locationsContainer);
}

function renderLocationButton(location) {
  return el('li', { class: 'locations__location' },
    el('button', { class: 'locations__button', click: () => onSearch(location) }, location.title));
}

// Initialize UI on DOM content load
document.addEventListener("DOMContentLoaded", renderUI);