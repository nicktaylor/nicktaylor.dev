import * as THREE from 'three'

export default function Controller(id, renderer) {
  const controller = renderer.xr.getController(id);
  const grip = renderer.xr.getControllerGrip(id);
  grip.add(controller)

  const onSelectStart = () => {
    console.log("Select Start")
  };

  const onSelectEnd = () => {
    console.log("Select End")
  };

  const setUpController = (data) => {
    let geometry, material;

    switch ( data.targetRayMode ) {

      case 'tracked-pointer':
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

        material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

        return new THREE.Line( geometry, material );
      case 'gaze':
        geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
        material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
        return new THREE.Mesh( geometry, material );
    }
  };

  controller.addEventListener("selectstart", onSelectStart)
  controller.addEventListener("selectend", onSelectEnd)
  controller.addEventListener("connected", function (connectEvent) {
    this.add(setUpController(connectEvent.data));
  });
  controller.addEventListener("disconnected", function (disconnectEvent) {
    this.remove(this.children[0]);
  });

  return {
    controller,
    grip
  }
}
