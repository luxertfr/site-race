import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

/**
 * Function
 */

let raceStarted = false; 
let money = 100;
let winnerDeclared = true;
let betAmount;
let winnerName;
let betListElement;
let bets = [];

// Countdown

function startCountdown(callback) {
  const countdownElement = document.getElementById('countdown');
  const steps = ['3', '2', '1', 'GO!'];
  let index = 0;


  countdownElement.style.display = 'block';
  const interval = setInterval(() => {
    countdownElement.textContent = steps[index];
    index++;

    if (index >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        countdownElement.style.display = 'none';
        countdownElement.textContent = ""
        callback();
      }, 1000); 
    }
  }, 1000); 
}



function updateMoney(money) {
  document.getElementById("money-amount").innerHTML = money
}

// Winner function

function winnerText() {
  let winner = car1.position.z > car2.position.z ? "car1" : "car2";
  winnerName = car1.position.z > car2.position.z ? "Voiture blanche" : "Voiture grise";
  const winnerElement = document.getElementById("winner");
  winnerElement.style.display = "block";
  winnerElement.textContent = `${winnerName} a gagné !`
  setTimeout(() => {
    winnerElement.style.display = "none";
    calculateWinnings(winner)
  }, 2000)
}

// Bet
function placeBet() {
  let betCar1 = parseFloat(document.getElementById("car1-bet").value);
  let betCar2 = parseFloat(document.getElementById("car2-bet").value);
  
  if (money <= 0) {
    alert("Vous etes trop pauvre pour parier.");
    return;
  }

  if (betCar1 > 0 && betCar1 <= money) {
    money -= betCar1
    betAmount += betCar1
    bets.push({ car: "blanche", amount: betCar1, id: "car1" });
  } else if (betCar1 >= money) {
    alert("Vous n'avez pas assez d'argent")
  }
  if (betCar2 > 0 && betCar2 <= money) {
    money -= betCar2
    betAmount += betCar2
    bets.push({ car: "grise", amount: betCar2, id: "car2" });
  } else if (betCar1 >= money) {
    alert("Vous n'avez pas assez d'argent")
  }
  updateMoney(money)
  updateBetList();
}


function updateBetList() {
  betListElement = document.getElementById("bet-list");
  betListElement.innerHTML = '';

  bets.forEach((bet, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Voiture ${bet.car} : ${bet.amount}€`;
    betListElement.appendChild(listItem);
  });
}

function calculateWinnings(winningCar) {
  let totalWinnings = 0;

  bets.forEach(bet => {
    if (bet.id === winningCar) {
      totalWinnings += bet.amount * 2;
      money += bet.amount * 2;
      updateMoney(money) 
    } else {
      totalWinnings -= bet.amount;
    }
  });

  // Parametres par default

  const betWinning = document.getElementById("amountBet");
  betWinning.innerHTML = "";
  speedCar1 = 0;
  speedCar2 = 0;
  car1.position.set(-2, 0, -45)
  car2.position.set(2, 0, -45)
  camera.position.set(-15, 5, 0);
  camera.lookAt(0, 0, -45);
  document.getElementById("betting-menu").classList.remove("hidden");
  betListElement.innerHTML = ''
  raceStarted = false
  bets = []
  betWinning.innerHTML = `Tu as ${totalWinnings > 0 ? "gagné" : "perdu"} ${Math.abs(totalWinnings)} euros.`
  alert(`Tu as ${totalWinnings > 0 ? "gagné" : "perdu"} ${Math.abs(totalWinnings)} euros.`)
}

// Starting race
function startRace() {
  winnerDeclared = false;
  speedCar1 = 0.045;
  speedCar2 = 0.045;

  boostCar1 = false; 
  boostCar2 = false; 
  document.getElementById("betting-menu").classList.add("hidden");
  startCountdown(() => {
    raceStarted = true;
  })
}

window.placeBet = placeBet;
window.startRace = startRace;

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl');

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const roadTexture = textureLoader.load("/textures/roadtextdiff.jpg")

/**
 * GLTF 
 */
const gltfLoader = new GLTFLoader()

// Voiture Blanche
let car1
gltfLoader.load("/gltf/retrocarmodel/scene.gltf", (gltf) => {
  // Model
  car1 = gltf.scene
  car1.rotation.y = Math.PI/ 2;
  car1.position.set(-2, 0, -45);
  scene.add(car1);
});

//Voiture Grise
let car2
gltfLoader.load("/gltf/retroeagleturbo/scene.gltf", (gltf) => {
  // Model
  car2 = gltf.scene
  car2.rotation.y = Math.PI/ 2;
  car2.position.set(2, 0, -45);
  scene.add(car2);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Resize listener
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(-15, 5, 0); 
camera.lookAt(0, 0, -45)

scene.add(camera);


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Lights
 */
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

/**
 * Objects
 */

// Building
function createBuilding(width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({
    color: 0x888888,
    metalness: 0.1,
    roughness: 0.8
  });

  const building = new THREE.Mesh(geometry, material);
  building.castShadow = true;
  building.receiveShadow = true;
  return building;
}

function generateBuildings(count = 30) {
  for (let i = 0; i < count; i++) {
    const width = THREE.MathUtils.randFloat(1.5, 3);
    const height = THREE.MathUtils.randFloat(3, 8);
    const depth = THREE.MathUtils.randFloat(1.5, 3);

    const building = createBuilding(width, height, depth);

    const x = THREE.MathUtils.randFloat(7, 14);
    const z = THREE.MathUtils.randFloat(0, 50);

    building.position.set(x, height / 2, z);
    scene.add(building);
  }
}

generateBuildings(10)

function createLampPost(x, z) {
  
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(x, 1, z);
  scene.add(pole);

  const lampGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const lampMaterial = new THREE.MeshStandardMaterial({ emissive: 0xffffcc });
  const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
  lamp.position.set(x, 2.05, z);
  scene.add(lamp);

  const light = new THREE.PointLight(0xffffcc, 0.3, 5); 
  light.position.set(x, 2.05, z);
  scene.add(light);
}

function generateLampPosts() {
  const spacing = 20;  
  const leftSideX = -7; 
  const rightSideX = 7; 

  for (let z = -50; z <= 50; z += spacing) {
    createLampPost(leftSideX, z);
    createLampPost(rightSideX, z);  
  }
}
generateLampPosts()

// Border

const borderLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 100),
  new THREE.MeshBasicMaterial({ color: 0x999999 })
);
borderLeft.position.set(5.1, -0.4, 0); 
scene.add(borderLeft);

const borderRight = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 100),
  new THREE.MeshBasicMaterial({ color: 0x999999 })
);
borderRight.position.set(-5.1, -0.4, 0); 
scene.add(borderRight);

// Tree 
function createTree() {
  const group = new THREE.Group();

  const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.5;
  group.add(trunk);

  const leafGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
  const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
  leaves.position.y = 1.3;
  group.add(leaves);

  return group;
}

function generateTrees(count) {
  for (let i = 0; i < count; i++) {
    const tree = createTree();

    const zPos = Math.random() * 51 - 50; 
    const side = Math.random() < 0.5 ? -1 : 1;
    const xOffset = THREE.MathUtils.randFloat(6, 12); 
    tree.position.set(side * xOffset, 0, zPos);

    scene.add(tree);
  }
}
generateTrees(10)



// Road
const roadGeometry = new THREE.BoxGeometry(10, 0.1, 100);
const roadMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x333333,
  map: roadTexture
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.position.y = -0.5;
scene.add(road);

/**
 * Animation
 */
let speedCar1 = 0.09;
let speedCar2 = 0.09;


let boostCar1 = false; 
let boostCar2 = false; 

const boostDuration = 3; 
let boostCarTime1 = 0;
let boostCarTime2 = 0;
let boostStartTime1 = 0; 
let boostStartTime2 = 0;

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if(raceStarted) {
    if (!winnerDeclared && (car1.position.z >= 50 || car2.position.z >= 50)) {
      speedCar1 /= 2;
      speedCar2 /= 2;
      winnerDeclared = true;
      winnerText();
    }
  
    
    if (speedCar1 > 0 && speedCar2 > 0) {
      if (boostCar1) {
        speedCar1 += 0.04;
        if (elapsedTime - boostStartTime1 >= boostDuration) {
          boostCar1 = false;
        }
      } else {
        speedCar1 += (Math.random() - 0.5) * 0.001;
      }
  
      if (boostCar2) {
        speedCar2 += 0.04;
        if (elapsedTime - boostStartTime2 >= boostDuration) {
          boostCar2 = false;
        }
      } else {
        speedCar2 += (Math.random() - 0.5) * 0.001;
      }
  
      
      speedCar1 = THREE.MathUtils.clamp(speedCar1, 0.06, 0.12);
      speedCar2 = THREE.MathUtils.clamp(speedCar2, 0.06, 0.12);
  
      
      if (!boostCar1 && Math.random() < 0.01) { 
        boostCar1 = true;
        boostCarTime1 = boostDuration;
        boostStartTime1 = elapsedTime
      }
  
      if (!boostCar2 && Math.random() < 0.01) { 
        boostCar2 = true;
        boostCarTime2 = boostDuration;
        boostStartTime2 = elapsedTime
      }
  
      speedCar1 += (Math.random() - 0.5) * 0.001; 
      speedCar2 += (Math.random() - 0.5) * 0.001;
  
      const futureCarZ1 = car1.position.z + speedCar1;
      const futureCarZ2 = car2.position.z + speedCar2;
  
  
      car1.position.z = futureCarZ1
      car2.position.z = futureCarZ2
      
  
      const leadingZ = Math.max(car1.position.z, car2.position.z);
  
      camera.position.set(-10, 3, leadingZ);
  
      const centerZ = (car1.position.z + car2.position.z) / 2;
  
  
      camera.lookAt(0, 0, centerZ);
    }
  }




  // Render
  renderer.render(scene, camera);

  // Loop
  window.requestAnimationFrame(tick);
  
};

tick();