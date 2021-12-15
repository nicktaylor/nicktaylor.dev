import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function OpeningScene(renderer, hasXR, onReady) {
  const scene = new THREE.Scene();
  const user = new THREE.Group();
  const gltfLoader = new GLTFLoader();
  const donuts = [];
  const models = {};

  const textures = {};
  let fonts = {};
  let camera = null;
  let controls = null;

  // TODO: Move to generic loader class and return all textures and fonts from resolved promise
  const loadTextures = async () => {
    const textureLoader = new THREE.TextureLoader();
    textures.text = textureLoader.load("/assets/textures/matcaps/9.png");
  };

  const loadFont = (name, src) => {
    const fontLoader = new FontLoader();

    return new Promise((resolve, reject) => {
      fontLoader.load(
        src,
        (font) => {
          resolve([name, font]);
        },
        () => {
        },
        () => {
          reject();
        }
      );
    });
  };

  const loadFonts = async () => {
    const results = await Promise.all([
      loadFont("wotfard", "/assets/fonts/wotfard/wotfard-semibold.json"),
    ]);
    fonts = Object.assign(...results.map(([key, val]) => ({ [key]: val })));
    console.dir(fonts);
  };

  const getMeshByName = (name, items) => {
    for (let item of items) {
      if (item.name === name) {
        return item;
      }
    }
  };

  const loadModels = async () => {
    gltfLoader.load(
      "/assets/models/desk.glb",
      (gltf) => {
        console.log("success");
        console.log(gltf);
        models['laptop'] = getMeshByName('Laptop_Bottom', gltf.scene.children)
        models['screen'] = getMeshByName('Stand_Bottom', gltf.scene.children)
        scene.add(models['laptop'])
        scene.add(models['screen'])
      },
      (progress) => {
        console.log("progress");
        console.log(progress);
      },
      (error) => {
        console.log("error");
        console.log(error);
      }
    );
  };
  // TODO: END

  const add = (object) => {
    scene.add(object);
  };

  const createCamera = () => {
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      40
    );
    camera.position.set(0, 0, 5);
    controls = new OrbitControls(camera, renderer.domElement);
    renderer.xr.updateCamera(camera);
    if (!hasXR) {
      scene.add(camera);
    }
    user.add(camera);
  };
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const init = async () => {
    createCamera();
    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    scene.add( light );
    loadModels();
    renderer.setClearColor(0x000000, 0);

    await Promise.all([loadTextures(), loadFonts()]);

    const textGeometry = new TextGeometry("Hello, world!", {
      font: fonts.wotfard,
      size: 0.5,
      height: 0.2,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    });
    const textTexture = textures.text;
    const material = new THREE.MeshMatcapMaterial({ matcap: textTexture });
    const text = new THREE.Mesh(textGeometry, material);

    textGeometry.center();

    add(text);

    const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45);

    const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: textTexture });

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 1000; i += 1) {
      const donut = new THREE.Mesh(donutGeometry, donutMaterial);
      donut.position.x = (Math.random() - 0.5) * 40;
      donut.position.y = (Math.random() - 0.5) * 40;
      donut.position.z = (Math.random() - 0.5) * 40;

      donut.rotation.x = Math.random() * Math.PI;
      donut.rotation.z = Math.random() * Math.PI;

      const scale = Math.random();
      donut.scale.set(scale, scale, scale);

      donuts.push({
        donut,
        increaseX: donut.rotation.z / 5,
        increaseZ: donut.rotation.z / 5,
      });
      add(donut);
    }

    // eslint-disable-next-line no-param-reassign
    renderer.xr.enabled = true;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    user.position.set(0, 0, 5);
    scene.add(user);
    window.addEventListener("resize", onWindowResize);
  };

  const clock = new THREE.Clock();

  const render = () => {
    const delta = clock.getDelta();
    donuts.forEach((d) => {
      d.donut.rotation.x += d.increaseX * delta;
      d.donut.rotation.y += d.increaseX * delta;
    });
    renderer.render(scene, camera);
    controls.update();
  };

  const run = () => {
    return new Promise((resolve, reject) => {
      try {
        renderer.setAnimationLoop(render);
        renderer.xr.addEventListener("sessionend", () => {
          resolve();
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };

  init()
    .then(() => onReady());

  return {
    add,
    scene,
    run,
    user,
  };
}
