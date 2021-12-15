import '../css/index.scss';
import './vr'

window.addEventListener('DOMContentLoaded', () => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  window.addEventListener('resize', setVH);
  setTimeout(() => {
    setVH();
  }, 500);
});
