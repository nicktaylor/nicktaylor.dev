import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory";
import Controller from "./controller";

export default function Controllers(renderer) {
  const controllerModelFactory = new XRControllerModelFactory();

  const leftController = new Controller(0, renderer);
  leftController.controller.add(controllerModelFactory.createControllerModel(leftController.grip));

  const rightController = new Controller(1, renderer);
  rightController.controller.add(controllerModelFactory.createControllerModel(rightController.grip));

  return {
    leftController,
    rightController
  }
}
