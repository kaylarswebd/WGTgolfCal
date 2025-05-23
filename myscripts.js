function calculateShot() {
  const distance = parseFloat(document.getElementById('distance').value);
  const windSpeed = parseFloat(document.getElementById('windSpeed').value);
  let windAngle = parseFloat(document.getElementById('windAngle').value);
  const elevation = parseFloat(document.getElementById('elevation').value);
  const club = document.getElementById('club').value;
  const resultOutput = document.getElementById('result');

  if (
    isNaN(distance) ||
    isNaN(windSpeed) ||
    isNaN(windAngle) ||
    isNaN(elevation) ||
    !club
  ) {
    resultOutput.innerHTML = 'Please enter valid numbers for all fields.';
    return;
  }

  windAngle = ((windAngle % 360) + 360) % 360; // Normalize

  const clubWindEffect = {
    driver: 2.0,
    '3wood': 1.8,
    '5wood': 1.6,
    '3iron': 1.4,
    '4iron': 1.3,
    '5iron': 1.2,
    '6iron': 1.1,
    '7iron': 1.0,
    '8iron': 0.9,
    '9iron': 0.8,
    pw: 0.7,
    gw: 0.5,
    sw: 0.3,
    lw: 0.2
  };

  const clubEffect = clubWindEffect[club] || 1.0;

  const radians = windAngle * (Math.PI / 180);
  const withWindRatio = Math.cos(radians);
  const crossWindRatio = Math.sin(radians);

  const windDistanceAdjustment = windSpeed * 0.5 * withWindRatio * clubEffect;
  const elevationAdjustment = -elevation / 2;

  const crosswindStrength = Math.abs(crossWindRatio);
  const rawAimOffset = (windSpeed * crosswindStrength / 3) * clubEffect;

  let aimText = 'No aim adjustment needed';
  if (crossWindRatio > 0) {
    aimText = `Aim left approximately ${rawAimOffset.toFixed(1)} yards`;
  } else if (crossWindRatio < 0) {
    aimText = `Aim right approximately ${rawAimOffset.toFixed(1)} yards`;
  }

  const totalAdjustedDistance = distance + windDistanceAdjustment + elevationAdjustment;

  resultOutput.innerHTML = `
    <strong>Adjusted Shot Distance:</strong> ${totalAdjustedDistance.toFixed(1)} yards<br/>
    <strong>Aim Adjustment:</strong> ${aimText}<br/>
    <em>(Wind angle: ${windAngle}°, Wind speed: ${windSpeed} mph, Club: ${club.toUpperCase()}, Effect: ${clubEffect})</em>
  `;

  updateCompass(windAngle);
}

function updateCompass(angle) {
  const compassNeedle = document.getElementById('compass-needle');
  const compassLabel = document.getElementById('compass-needle').style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
  compassLabel.innerText = `${angle.toFixed(0)}°`;
}

document.addEventListener('DOMContentLoaded', () => {
  const compass = document.getElementById('compass');

  for (let angle = 0; angle < 360; angle += 22.5) {
    const label = document.createElement('div');
    label.innerText = `${angle}°`;

    const radius = 90; // Adjust based on compass size (half of container size - padding)
    const radians = (angle - 90) * (Math.PI / 180); // Start from top (0°)

    const x = 100 + radius * Math.cos(radians); // center is 100px
    const y = 100 + radius * Math.sin(radians);

    label.style.position = 'absolute';
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -50%)';
    label.style.fontSize = '10px';
    label.style.pointerEvents = 'none';

    compass.appendChild(label);
  }
});

//Compass glowing effect
function pulseCompassGlow() {
  const compass = document.getElementById('compass');
  compass.classList.remove('glow'); // reset
  void compass.offsetWidth; // force reflow
  compass.classList.add('glow'); // re-apply
}

//Saved Shots
let savedShots = JSON.parse(localStorage.getItem("savedShots")) || [];

function saveShot() {
  const name = document.getElementById("saveName").value.trim();
  if (!name) return alert("Please enter a name for this shot.");

  const shot = {
    name,
    club: document.getElementById("club").value,
    distance: parseFloat(document.getElementById("distance").value),
    windSpeed: parseFloat(document.getElementById("windSpeed").value),
    windDirection: parseFloat(document.getElementById("windDirection").value),
    elevation: parseFloat(document.getElementById("elevation").value)
  };

  savedShots.push(shot);
  localStorage.setItem("savedShots", JSON.stringify(savedShots));
  displaySavedShots();
  document.getElementById("saveName").value = "";
}

function loadShot(index) {
  const shot = savedShots[index];
  document.getElementById("club").value = shot.club;
  document.getElementById("distance").value = shot.distance;
  document.getElementById("windSpeed").value = shot.windSpeed;
  document.getElementById("windDirection").value = shot.windDirection;
  document.getElementById("elevation").value = shot.elevation;

  updateShot(); // Optional: trigger calculation after loading
}

function displaySavedShots() {
  const list = document.getElementById("savedShots");
  list.innerHTML = "";

  savedShots.forEach((shot, index) => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <span>${shot.name}</span>
      <button class="btn btn-sm btn-outline-secondary" onclick="loadShot(${index})">Load</button>
    `;
    list.appendChild(item);
  });
}

// Call this once on page load to show saved shots
displaySavedShots();