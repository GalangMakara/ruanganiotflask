/* ---------------------------------------------------------------------
   ANIMASI — utilitas tween ringan (tanpa library eksternal), dipakai
   untuk animasi kamera zoom-in/zoom-out dan animasi bongkar-pasang AC.
--------------------------------------------------------------------- */

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Animasikan posisi kamera & target OrbitControls secara bersamaan,
 *  sekaligus membuat kamera terus lookAt ke target (supaya hasilnya
 *  selalu "lurus" menghadap target selama animasi). */
export function tweenCameraTo(camera, controls, toPos, toTarget, duration, onDone) {
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(fromPos, toPos, e);
    controls.target.lerpVectors(fromTarget, toTarget, e);
    camera.lookAt(controls.target);
    if (t < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  }
  requestAnimationFrame(step);
}

/** Animasikan satu nilai numerik dari `from` ke `to` (dipakai untuk
 *  rotasi pintu panel AC & skala tampilan mesin dalam). */
export function tweenValue(from, to, duration, onUpdate, onDone) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const e = easeInOutCubic(t);
    onUpdate(from + (to - from) * e, t);
    if (t < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  }
  requestAnimationFrame(step);
}