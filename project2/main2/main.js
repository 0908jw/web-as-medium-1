import * as THREE from '//unpkg.com/three/build/three.module.js';

const EARTH_RADIUS_KM = 6371;
const SAT_SIZE = 100; 
const TIME_STEP = 3000; 

const timeLogger = document.getElementById('time-log');
const slider_input = document.getElementById('slider_input');
const slider_thumb = document.getElementById('slider_thumb');
const slider_line = document.getElementById('slider_line');
const counter = document.getElementById('counter');

const world = Globe()
  (document.getElementById('chart'))
  .globeImageUrl('../assets/moonsurface.jpeg')
  .objectLat('lat')
  .objectLng('lng')
  .objectAltitude('alt')
  .objectFacesSurface(false)
  .objectLabel('name');

setTimeout(() => {
  const globeScale = 0.7;
  world.scene().scale.set(globeScale, globeScale, globeScale);
}, 0);
setTimeout(() => world.pointOfView({ altitude: 3.5 }));

const satGeometry = new THREE.BoxGeometry(
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2
);
const satMaterial = new THREE.MeshLambertMaterial({ color: 'aquamarine', transparent: true, opacity: 0.7 });
world.objectThreeObject(() => new THREE.Mesh(satGeometry, satMaterial));

let satData = [];

fetch('../main2/debris.txt')
  .then(response => response.text())
  .then(rawData => {
    const tleData = rawData.replace(/\r/g, '')
      .split(/\n(?=[^12])/)
      .filter(d => d)
      .map(tle => tle.split('\n'));

    const allSatData = tleData.map(([name, ...tle]) => ({
      satrec: satellite.twoline2satrec(...tle),
      name: name.trim().replace(/^0 /, '')
    }))
    .filter(d => !!satellite.propagate(d.satrec, new Date()).position);

    satData = allSatData;
    updateSatellites();
  })
  .catch(err => console.error('Error fetching TLE data:', err));

let time = new Date();
(function frameTicker() {
  requestAnimationFrame(frameTicker);

  time = new Date(+time + TIME_STEP);
  timeLogger.innerText = time.toISOString();

  if (satData.length > 0) {
    const gmst = satellite.gstime(time);

    satData.forEach(d => {
      const eci = satellite.propagate(d.satrec, time);
      if (eci.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        d.lat = satellite.radiansToDegrees(gdPos.latitude);
        d.lng = satellite.radiansToDegrees(gdPos.longitude);
        d.alt = gdPos.height / EARTH_RADIUS_KM;
      }
    });
  }
})();

function updateSatellites() {
    if (satData.length === 0) return;
  
    const sliderValue = parseInt(slider_input.value);
    const minSatellites = 2;
    const maxSatellites = satData.length;
  
    const numSatellites = getNonLinearScaledValue(sliderValue, minSatellites, maxSatellites);
  
    const satellitesToShow = satData.slice(0, numSatellites);
  
    world.objectsData(satellitesToShow);
  }
  
  function showSliderValue() {
    const sliderValue = parseInt(slider_input.value);
    const minCounterValue = 2;
    const maxCounterValue = 3160;
  
    const counterValue = getNonLinearScaledValue(sliderValue, minCounterValue, maxCounterValue);
  
    counter.innerText = `${counterValue} junks`;
  
    slider_thumb.innerHTML = sliderValue;
    const bulletPosition = (sliderValue - 1960) / (2020 - 1960);
    const space = slider_input.offsetWidth - slider_thumb.offsetWidth;
  
    slider_thumb.style.left = `${bulletPosition * space}px`;
    slider_line.style.width = `${bulletPosition * 100}%`;
  
    updateSatellites();
  }
  
  function getNonLinearScaledValue(year, minValue, maxValue) {
    const midYear = 2000;
    const steepness = 10;
    const range = 2020 - 1960;
  
    const fraction = 1 / (1 + Math.exp(-steepness * ((year - midYear) / range)));
    return Math.round(minValue + fraction * (maxValue - minValue));
  }
  
  slider_input.addEventListener('input', showSliderValue, false);
  showSliderValue();
  
  //-------------button---------

  const circleButton = document.getElementById('circle-button');
const popup = document.getElementById('popup');

// Show the popup when the circle button is clicked
circleButton.addEventListener('click', () => {
  popup.classList.remove('hidden');
  createOverlay();
});

// Close the popup when clicking outside
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.classList.add('popup-overlay');
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    popup.classList.add('hidden');
    overlay.remove();
  });
}
