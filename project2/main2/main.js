import * as THREE from '//unpkg.com/three/build/three.module.js';

const EARTH_RADIUS_KM = 6371; // km
const SAT_SIZE = 100; // km
const TIME_STEP = 3 * 1000; // per frame

const timeLogger = document.getElementById('time-log');

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

const satGeometry = new THREE.OctahedronGeometry(SAT_SIZE * world.getGlobeRadius() / EARTH_RADIUS_KM / 2, 0);
const satMaterial = new THREE.MeshLambertMaterial({ color: 'palegreen', transparent: true, opacity: 0.7 });
world.objectThreeObject(() => new THREE.Mesh(satGeometry, satMaterial));

fetch('../main2/debris.txt').then(r => r.text()).then(rawData => {
  const tleData = rawData.replace(/\r/g, '')
    .split(/\n(?=[^12])/)
    .filter(d => d)
    .map(tle => tle.split('\n'));
  const satData = tleData.map(([name, ...tle]) => ({
    satrec: satellite.twoline2satrec(...tle),
    name: name.trim().replace(/^0 /, '')
  }))
  // exclude those that can't be propagated
  .filter(d => !!satellite.propagate(d.satrec, new Date()).position)
  .slice(0, 2000);

  // time ticker
  let time = new Date();
  (function frameTicker() {
    requestAnimationFrame(frameTicker);

    time = new Date(+time + TIME_STEP);
    timeLogger.innerText = time.toString();

    // Update satellite positions
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

    world.objectsData(satData);
  })();
});

const slider_input = document.getElementById('slider_input'),
      slider_thumb = document.getElementById('slider_thumb'),
      slider_line = document.getElementById('slider_line');

function showSliderValue() {
  slider_thumb.innerHTML = slider_input.value;
  const bulletPosition = (slider_input.value /slider_input.max),
        space = slider_input.offsetWidth - slider_thumb.offsetWidth;

  slider_thumb.style.left = (bulletPosition * space) + 'px';
  slider_line.style.width = slider_input.value + '%';
}

showSliderValue();
window.addEventListener("resize",showSliderValue);
slider_input.addEventListener('input', showSliderValue, false);

