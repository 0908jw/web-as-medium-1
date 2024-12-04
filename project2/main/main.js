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
  const globeScale = 0.6; //globe size
  world.scene().scale.set(globeScale, globeScale, globeScale);
}, 0);
setTimeout(() => world.pointOfView({ altitude: 3.5 }));

const satGeometry = new THREE.BoxGeometry(
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
  SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2
);

const satMaterial = new THREE.MeshLambertMaterial({ color: 'white', transparent: true, opacity: 0.7 });

world.objectThreeObject(() => {
  const geometry = new THREE.BoxGeometry(
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2,
    SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2
  );

  //randomly categorized satellites
  const randomCategory = Math.random();
  let color;
  
  if (randomCategory < 0.05) {
    color = 'teal'; // 5% - old satellites
  } else if (randomCategory < 0.25) {
    color = 'yellow'; // 20% - rocket parts
  } else if (randomCategory < 0.95) {
    color = 'aquamarine'; // 70% - broken pieces
  } else if (randomCategory < 0.96) {
    color = 'blueviolet'; // 1% - lost tools
  } else {
    color = 'sienna'; // 4% - tiny bits and dust
  }

  const shouldGlow = Math.random() > 0.5;

  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: shouldGlow ? color : 'black',
    emissiveIntensity: shouldGlow ? Math.random() * 1.5 + 0.5 : 0,
    transparent: true,
    opacity: 0.7
  });

  const mesh = new THREE.Mesh(geometry, material);

  const randomScale = Math.random() * 2.0 + 0.5;
  // random scale between 0.5 and 2.5
  mesh.scale.set(randomScale, randomScale, randomScale);

  satellite.color = color; // Assign category color for filtering
  return mesh;
});

let satData = [];

fetch('../main/debris.txt')
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
  
    slider_thumb.innerText = sliderValue;
  
    const bulletPosition = (sliderValue - 1960) / (2020 - 1960);
    const space = slider_input.offsetWidth - slider_thumb.offsetWidth;
  
    slider_thumb.style.left = `${bulletPosition * space}px`;
    slider_line.style.width = `${bulletPosition * 100}%`;
  
    updateSatellites();
    updateYearContext(sliderValue); 
  }
  
  
  function getNonLinearScaledValue(year, minValue, maxValue) {
    const midYear = 2000;
    const steepness = 10;
    const range = 2020 - 1960;
  
    const fraction = 1 / (1 + Math.exp(-steepness * ((year - midYear) / range)));
    return Math.round(minValue + fraction * (maxValue - minValue));
  }
  
 
  function updateYearContext(sliderValue) {
    const yearContexts = document.querySelectorAll('.year-context');
    
    yearContexts.forEach((context) => {
      context.style.display = 'none';
    });

    const matchingContext = Array.from(yearContexts).find(
      (context) => parseInt(context.getAttribute('data-year'), 10) === sliderValue
    );
  
    if (matchingContext) {
      matchingContext.style.display = 'block';
    }
  }
  
  slider_input.addEventListener('input', showSliderValue, false);
  
  document.addEventListener('DOMContentLoaded', () => {
    showSliderValue(); 
  });
  
//--------------------------------
let isRotating = true;
let isDragging = false;
let currentLat = 0;
let currentLng = 0;

function rotateGlobe() {
  if (isRotating && !isDragging) {
    currentLng = (currentLng + 0.1) % 360; 
    world.pointOfView({ lat: currentLat, lng: currentLng, altitude: 2.5 });
  }
  requestAnimationFrame(rotateGlobe); 
}

rotateGlobe();

//pause rotation on interaction
const globeContainer = document.getElementById('chart');
let lastLat = 0;
let lastLng = 0;

globeContainer.addEventListener('mousedown', () => {
  isDragging = true;
  const viewpoint = world.pointOfView(); 
  lastLat = viewpoint.lat; 
  lastLng = viewpoint.lng; 
});

globeContainer.addEventListener('mousemove', (event) => {
  if (isDragging) {
    isRotating = false; 
    const deltaX = event.movementX * 0.1; 
    const deltaY = event.movementY * 0.1;

    lastLng = (lastLng + deltaX) % 360; 
    lastLat = Math.max(-90, Math.min(90, lastLat - deltaY)); 

    world.pointOfView({ lat: lastLat, lng: lastLng, altitude: 2.5 });
  }
});

globeContainer.addEventListener('mouseup', () => {
  isDragging = false;

  const viewpoint = world.pointOfView();
  currentLat = viewpoint.lat; 
  currentLng = viewpoint.lng; 

  isRotating = true; 
});

globeContainer.addEventListener('mouseleave', () => {
  isDragging = false;

  const viewpoint = world.pointOfView();
  currentLat = viewpoint.lat;
  currentLng = viewpoint.lng;

  isRotating = true; 
});

//pop up-------------------
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.querySelector('.popup');
  const overlay = document.querySelector('.popup-overlay');
  const button = document.querySelector('.circle-button');

  popup.classList.add('hidden');
  overlay.classList.add('hidden');

  function togglePopup() {
      const isHidden = popup.classList.contains('hidden');
      popup.classList.toggle('hidden', !isHidden);
      overlay.classList.toggle('hidden', !isHidden);
  }

  button.addEventListener('click', togglePopup);
  
  overlay.addEventListener('click', () => {
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
  });
});
