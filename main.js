// ===== BAGIAN A: import dan variabel =====
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, orbit;
const controllers = [];
const interactables = []; // daftar objek yang boleh berinteraksi
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const pointer = new THREE.Vector2();
const logBox = document.getElementById('log');
const lines = [];

// [EKSTRA] daftar bentuk yang bergantian saat objek diklik
const shapeFactories = [
  () => new THREE.BoxGeometry(0.3, 0.3, 0.3),
  () => new THREE.SphereGeometry(0.18, 32, 16),
  () => new THREE.ConeGeometry(0.16, 0.35, 32),
  () => new THREE.TorusGeometry(0.15, 0.05, 16, 48),
  () => new THREE.CylinderGeometry(0.14, 0.14, 0.3, 32)
];

// [EKSTRA] status mouse (hover dan klik) dan keyboard (WASD)
let hoveredObj = null;
let downX = 0;
let downY = 0;
const keys = {};
const clock = new THREE.Clock();
const moveDir = new THREE.Vector3();
const moveRight = new THREE.Vector3();
const moveDelta = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const MOVE_SPEED = 2; // meter per detik

// Log ke layar dan console, berguna sebagai bukti pengujian
function log(msg) {
  console.log(msg);
  lines.unshift(msg);
  lines.length = Math.min(lines.length, 5);
  logBox.textContent = lines.join(' | ');
}

// ===== BAGIAN B: scene dan objek interaktif =====
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1f2a);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 1.6, 2);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(2, 4, 2);
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x2e3447 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  scene.add(new THREE.GridHelper(10, 20, 0x555a6e, 0x3a3f52));

  // Tiga objek yang bisa disentuh/digenggam (angka pertama = nomor bentuk)
  addObject(0, 0xe74c3c, -0.6, 1.2, -1); // kubus
  addObject(1, 0x3498db, 0, 1.2, -1);    // bola
  addObject(2, 0x2ecc71, 0.6, 1.2, -1);  // kerucut

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // aktifkan WebXR
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  // Kontrol mouse untuk mode desktop (tidak aktif saat sesi XR)
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 1.2, -1);
  orbit.update();

  setupControllers();
  window.addEventListener('resize', onResize);

  // [EKSTRA] mouse: hover dan klik. Keyboard: WASD
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  renderer.setAnimationLoop(render);
  log('Desktop: klik objek = ganti bentuk dan warna | WASD = jalan');
}

function addObject(shapeIndex, color, x, y, z) {
  const mesh = new THREE.Mesh(
    shapeFactories[shapeIndex](),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.userData.shapeIndex = shapeIndex;
  mesh.position.set(x, y, z);
  scene.add(mesh);
  interactables.push(mesh);
}

// [EKSTRA] ganti objek ke bentuk berikutnya
function changeShape(obj) {
  obj.userData.shapeIndex = (obj.userData.shapeIndex + 1) % shapeFactories.length;
  obj.geometry.dispose();
  obj.geometry = shapeFactories[obj.userData.shapeIndex]();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== BAGIAN C: controller dan garis sinar =====
function setupControllers() {
  const modelFactory = new XRControllerModelFactory();
  for (let i = 0; i < 2; i++) {
    const controller = renderer.xr.getController(i);
    controller.addEventListener('connected', (e) => {
      controller.userData.gamepad = e.data.gamepad; // untuk haptic dan thumbstick
      controller.add(buildRay());
      log('Controller ' + i + ' terhubung (' + e.data.handedness + ')');
    });
    controller.addEventListener('disconnected', () => controller.clear());
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('squeezestart', onSqueezeStart);
    scene.add(controller);
    controllers.push(controller);

    const grip = renderer.xr.getControllerGrip(i);
    grip.add(modelFactory.createControllerModel(grip));
    scene.add(grip);
  }
}

function buildRay() {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  line.name = 'ray';
  line.scale.z = 5; // panjang sinar 5 meter
  return line;
}

// ===== BAGIAN D: raycast, select/grab, release, squeeze =====
// Menghitung objek yang terkena sinar dari sebuah controller
function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  return raycaster.intersectObjects(interactables, false);
}

// Getaran singkat pada controller (jika perangkat mendukung)
function pulse(controller, strength = 0.5, ms = 80) {
  const gp = controller.userData.gamepad;
  const actuator = gp && gp.hapticActuators && gp.hapticActuators[0];
  if (actuator && actuator.pulse) actuator.pulse(strength, ms);
}

// Trigger ditekan: genggam objek yang terkena sinar
function onSelectStart(event) {
  const controller = event.target;
  const hits = getIntersections(controller);
  if (hits.length > 0) {
    const obj = hits[0].object;
    controller.attach(obj); // objek menjadi anak controller
    controller.userData.selected = obj;
    pulse(controller);
    log('GRAB: ' + obj.geometry.type);
  }
}

// Trigger dilepas: kembalikan objek ke scene di posisi terakhirnya
function onSelectEnd(event) {
  const controller = event.target;
  const obj = controller.userData.selected;
  if (obj) {
    scene.attach(obj); // posisi dunia tetap terjaga
    controller.userData.selected = undefined;
    log('RELEASE: ' + obj.geometry.type);
  }
}

// Grip ditekan: ganti warna DAN bentuk objek yang disorot
function onSqueezeStart(event) {
  const controller = event.target;
  const hits = getIntersections(controller);
  if (hits.length > 0) {
    const obj = hits[0].object;
    obj.material.color.setHex(Math.floor(Math.random() * 0xffffff));
    changeShape(obj); // [EKSTRA] bentuk ikut berganti
    pulse(controller, 0.3, 50);
    log('SQUEEZE: warna dan bentuk diubah -> ' + obj.geometry.type);
  }
}

// ===== BAGIAN E dan F: hover, skala, gerak WASD, loop render, mouse =====
// [EKSTRA] gerak maju/mundur/kiri/kanan dengan WASD atau tombol panah (mode desktop)
function moveWithKeys(dt) {
  const forward = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
  const strafe = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
  if (forward === 0 && strafe === 0) return;

  camera.getWorldDirection(moveDir);
  moveDir.y = 0; // hanya bergerak di lantai, tidak naik-turun
  moveDir.normalize();
  moveRight.crossVectors(moveDir, UP).normalize();

  moveDelta.set(0, 0, 0)
    .addScaledVector(moveDir, forward * MOVE_SPEED * dt)
    .addScaledVector(moveRight, strafe * MOVE_SPEED * dt);

  camera.position.add(moveDelta);
  orbit.target.add(moveDelta); // target ikut bergeser supaya arah pandang tetap
}

function render() {
  const dt = clock.getDelta();

  // Reset sorotan semua objek
  interactables.forEach((o) => o.material.emissive.setHex(0x000000));

  // [EKSTRA] hover mouse: objek yang ditunjuk kursor menyala
  if (hoveredObj && !renderer.xr.isPresenting) {
    hoveredObj.material.emissive.setHex(0x555555);
  }

  controllers.forEach((c) => {
    const held = c.userData.selected;
    if (held) {
      // Objek sedang digenggam: sorot dan izinkan ubah skala dengan thumbstick
      held.material.emissive.setHex(0x222222);
      const gp = c.userData.gamepad;
      if (gp && gp.axes.length >= 4) {
        const y = gp.axes[3]; // sumbu Y thumbstick
        if (Math.abs(y) > 0.15) { // abaikan drift kecil
          held.scale.multiplyScalar(1 - y * 0.02).clampScalar(0.3, 3);
        }
      }
    } else if (c.children.length > 0) {
      // Controller sudah terhubung dan tidak memegang apa pun: cek hover
      const hits = getIntersections(c);
      if (hits.length > 0) hits[0].object.material.emissive.setHex(0x444444);
    }
  });

  if (!renderer.xr.isPresenting) {
    moveWithKeys(dt);
    orbit.update();
  }
  renderer.render(scene, camera);
}

// Mengubah posisi kursor menjadi koordinat sinar dari kamera
function pointerToRay(e) {
  pointer.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(interactables, false);
}

// [EKSTRA] hover: cari objek di bawah kursor
function onPointerMove(e) {
  if (renderer.xr.isPresenting) return;
  const hits = pointerToRay(e);
  hoveredObj = hits.length > 0 ? hits[0].object : null;
  renderer.domElement.style.cursor = hoveredObj ? 'pointer' : 'default';
}

// Catat posisi saat mouse ditekan, supaya geseran (memutar kamera) tidak dihitung klik
function onPointerDown(e) {
  downX = e.clientX;
  downY = e.clientY;
}

// Interaksi ekuivalen untuk mode desktop: klik objek mengganti warna dan bentuknya
function onPointerUp(e) {
  if (renderer.xr.isPresenting) return;
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved > 5) return; // ini geseran kamera, bukan klik
  const hits = pointerToRay(e);
  if (hits.length > 0) {
    const obj = hits[0].object;
    obj.material.color.setHex(Math.floor(Math.random() * 0xffffff));
    changeShape(obj);
    log('CLICK (desktop): warna dan bentuk diubah -> ' + obj.geometry.type);
  }
}

// ===== Jalankan (hanya satu kali, paling bawah file) =====
init();