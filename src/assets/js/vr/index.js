import * as THREE from "three";
import OpeningScene from "./scenes/opening";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import Controllers from "./controllers";

const hasWebXR = async () => {
  if (!navigator.xr) {
    return false;
  } else {
    const immersiveOK = await navigator.xr.isSessionSupported("immersive-vr");

    return !!immersiveOK;
  }
};

document.addEventListener("DOMContentLoaded", () => {
    hasWebXR()
      .then((hasXR) => {
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        const openingScene = OpeningScene(renderer, hasXR, () => {
          const appContainer = document.getElementById("app");
          appContainer.appendChild(renderer.domElement);
          const controllers = new Controllers(renderer);
          openingScene.user.add(controllers.leftController.controller);
          openingScene.user.add(controllers.leftController.grip);
          openingScene.user.add(controllers.rightController.controller);
          openingScene.user.add(controllers.rightController.grip);

          const panel = document.querySelector(".panel");
          panel.appendChild(VRButton.createButton(renderer));

          openingScene.run()
            .then(() => console.log("Move to next scene??"));
        });
      });
  }
);
