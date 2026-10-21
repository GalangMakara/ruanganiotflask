import * as THREE from "three";
import { ROOM_W, BOSS_DESK_Z } from "../inti/konfigurasi.js";
import { root } from "../inti/scene-dasar.js";
import { chairMat, chairMetalMat } from "../inti/material.js";
import { TABLE_CENTER, TABLE_LEN, TABLE_W } from "./meja-rapat.js";

/* ---------------------------------------------------------------------
   KURSI RAPAT
   buildChair() dipakai untuk 12 kursi di sekeliling meja rapat, dan
   sekali lagi untuk kursi bos di belakang meja bos.
--------------------------------------------------------------------- */
function buildChair() {
  const grp = new THREE.Group();
  const seatH = 0.48;

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.22,0.09,16), chairMat);
  seat.position.y = seatH;
  seat.castShadow = true;
  grp.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46,0.62,0.09), chairMat);
  back.position.set(0, seatH+0.4, -0.23);
  back.rotation.x = -0.08;
  back.castShadow = true;
  grp.add(back);

  const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.14,0.08), chairMat);
  headrest.position.set(0, seatH+0.74, -0.26);
  grp.add(headrest);

  // armrest
  for (const side of [-1,1]) {
    const armPost = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.2,0.04), chairMetalMat);
    armPost.position.set(side*0.24, seatH+0.1, 0.02);
    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.04,0.28), chairMat);
    armPad.position.set(side*0.24, seatH+0.2, 0.02);
    grp.add(armPost, armPad);
  }

  // pole + star base beroda
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,seatH-0.08,10), chairMetalMat);
  pole.position.y = (seatH-0.08)/2+0.04;
  grp.add(pole);

  const baseGroup = new THREE.Group();
  const nLegs = 5;
  for (let i=0;i<nLegs;i++){
    const ang = (i/nLegs)*Math.PI*2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.03,0.045), chairMetalMat);
    leg.position.set(Math.cos(ang)*0.16, 0.05, Math.sin(ang)*0.16);
    leg.rotation.y = -ang;
    baseGroup.add(leg);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.035,10,10), new THREE.MeshStandardMaterial({color:0x0a0a0a, roughness:0.6}));
    wheel.position.set(Math.cos(ang)*0.30, 0.035, Math.sin(ang)*0.30);
    baseGroup.add(wheel);
  }
  grp.add(baseGroup);
  grp.castShadow = true;
  return grp;
}

function placeChairs() {
  const perSide = 6;
  const usableLen = TABLE_LEN - 0.9;
  for (const side of [-1,1]) {
    for (let i=0;i<perSide;i++){
      const chair = buildChair();
      const z = TABLE_CENTER.z - usableLen/2 + (usableLen/(perSide-1))*i;
      const x = TABLE_CENTER.x + side*(TABLE_W/2 + 0.5);
      chair.position.set(x, 0, z);
      chair.rotation.y = side === 1 ? -Math.PI/2 : Math.PI/2;
      root.add(chair);
    }
  }
}
placeChairs();

// kursi bos di belakang meja, menghadap ke arah meja rapat
const bossChair = buildChair();
bossChair.position.set(ROOM_W/2, 0, BOSS_DESK_Z + 0.78);
bossChair.rotation.y = Math.PI;
root.add(bossChair);
