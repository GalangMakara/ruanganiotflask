import * as THREE from "three";
import { ROOM_W, ROOM_L, ROOM_H, SPLIT_Y } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { floorMat, ceilingMat, wallLowerMat, wallUpperMat } from "../inti/material.js";

/* ---------------------------------------------------------------------
   STRUKTUR RUANGAN: lantai, plafon, dan 3 dinding polos
   (depan/layar, belakang/lemari, kanan). Dinding kiri punya jendela
   besar sehingga dibangun terpisah di ruangan/jendela-kiri.js, tetapi
   tetap memakai buildWall() yang diekspor dari sini.
--------------------------------------------------------------------- */

// lantai
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_L), floorMat);
floor.rotation.x = -Math.PI/2;
floor.position.set(ROOM_W/2, 0, ROOM_L/2);
floor.receiveShadow = true;
root.add(floor);

// plafon
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_L), ceilingMat);
ceiling.rotation.x = Math.PI/2;
ceiling.position.set(ROOM_W/2, ROOM_H, ROOM_L/2);
root.add(ceiling);

function makeWallSegment(w, h, mat) {
  const g = new THREE.PlaneGeometry(w, h);
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

// dinding 2 warna: bawah (0..SPLIT_Y) abu gelap, atas (SPLIT_Y..H) krem
function buildWall(lengthAxisSize, position, rotationY) {
  const group = new THREE.Group();
  const lower = makeWallSegment(lengthAxisSize, SPLIT_Y, wallLowerMat);
  lower.position.y = SPLIT_Y/2;
  const upper = makeWallSegment(lengthAxisSize, ROOM_H - SPLIT_Y, wallUpperMat);
  upper.position.y = SPLIT_Y + (ROOM_H - SPLIT_Y)/2;
  group.add(lower, upper);
  group.position.copy(position);
  group.rotation.y = rotationY;
  root.add(group);
  return group;
}

// dinding depan (layar) Z=0, menghadap +Z
buildWall(ROOM_W, new THREE.Vector3(ROOM_W/2, 0, 0), 0);
// dinding belakang (lemari) Z=ROOM_L, menghadap -Z
buildWall(ROOM_W, new THREE.Vector3(ROOM_W/2, 0, ROOM_L), Math.PI);
// dinding kanan X=ROOM_W, menghadap -X
buildWall(ROOM_L, new THREE.Vector3(ROOM_W, 0, ROOM_L/2), -Math.PI/2);

export { buildWall, makeWallSegment };
