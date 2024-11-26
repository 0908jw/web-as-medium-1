import * as THREE from '//unpkg.com/three/build/three.module.js';

const EARTH_RADIUS_KM = 6371;
const SAT_SIZE = 100; 
const TIME_STEP = 3000; 

const timeLogger = document.getElementById('time-log');
const slider_input = document.getElementById('slider_input');
const slider_thumb = document.getElementById('slider_thumb');
const slider_line = document.getElementById('slider_line');

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

// Satellite object material and geometry
const satGeometry = new THREE.BoxGeometry(
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2, // Width
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2, // Height
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2  // Depth
  );
  const satMaterial = new THREE.MeshLambertMaterial({ color: 'palegreen', transparent: true, opacity: 0.7 });
  
  // Replace the satellite object creation with the updated geometry
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
  timeLogger.innerText = time.toString();

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
  const yearFraction = (sliderValue - 1960) / (2020 - 1960); 
  const minSatellites = 2; 
  const maxSatellites = satData.length; 

  const numSatellites = Math.floor(minSatellites + yearFraction * (maxSatellites - minSatellites));
  const satellitesToShow = satData.slice(0, numSatellites);

  world.objectsData(satellitesToShow); 
}

function showSliderValue() {
  const sliderValue = parseInt(slider_input.value); 
  slider_thumb.innerHTML = sliderValue; 
  const bulletPosition = (sliderValue - 1960) / (2020 - 1960); 
  const space = slider_input.offsetWidth - slider_thumb.offsetWidth;

  slider_thumb.style.left = `${bulletPosition * space}px`; 
  slider_line.style.width = `${bulletPosition * 100}%`; 

  updateSatellites(); 
}

slider_input.addEventListener('input', showSliderValue, false);
updateSatellites();


