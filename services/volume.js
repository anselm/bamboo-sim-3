import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const volume_service = {
	id: 'volume-service',
	kind: 'service',
	
	// Three.js components
	scene: null,
	camera: null,
	renderer: null,
	controls: null,
	meshes: new Map(), // Map entity IDs to their meshes
	
	onreset: function() {
		console.log("Volume service initializing 3D scene...")
		
		// Create scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
		
		// Create camera
		this.camera = new THREE.PerspectiveCamera(
			75, 
			window.innerWidth / window.innerHeight, 
			0.1, 
			1000
		);
		this.camera.position.set(100, 50, 100);
		this.camera.lookAt(50, 0, 50);
		
		// Create renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		document.body.appendChild(this.renderer.domElement);
		
		// Add controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		
		// Add lights
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		this.scene.add(ambientLight);
		
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
		directionalLight.position.set(50, 100, 50);
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.left = -100;
		directionalLight.shadow.camera.right = 100;
		directionalLight.shadow.camera.top = 100;
		directionalLight.shadow.camera.bottom = -100;
		this.scene.add(directionalLight);
		
		// Handle window resize
		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});
		
		// Start render loop
		this.animate();
	},
	
	onentity: function(entity) {
		// Only process entities with volume information
		if (!entity.volume) return;
		
		// Create or update mesh for this entity
		let mesh = this.meshes.get(entity.id);
		
		if (!mesh) {
			// Create new mesh based on shape
			let geometry;
			const vol = entity.volume;
			
			switch (vol.shape) {
				case 'cylinder':
					geometry = new THREE.CylinderGeometry(
						vol.hwd[1] || 0.1,  // top radius
						vol.hwd[1] || 0.1,  // bottom radius
						vol.hwd[0] || 1,    // height
						16                   // segments
					);
					break;
				case 'sphere':
					geometry = new THREE.SphereGeometry(
						vol.hwd[1] || 0.5,  // radius
						16, 16              // segments
					);
					break;
				case 'box':
				default:
					geometry = new THREE.BoxGeometry(
						vol.hwd[1] || 1,    // width
						vol.hwd[0] || 1,    // height
						vol.hwd[2] || 1     // depth
					);
					break;
			}
			
			const material = new THREE.MeshPhongMaterial({
				color: vol.color || 0x00ff00,
				opacity: vol.opacity || 1.0,
				transparent: vol.opacity < 1.0
			});
			
			mesh = new THREE.Mesh(geometry, material);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			
			this.meshes.set(entity.id, mesh);
			this.scene.add(mesh);
		}
		
		// Update mesh position and scale
		const vol = entity.volume;
		mesh.position.set(vol.xyz[0], vol.xyz[1] + vol.hwd[0]/2, vol.xyz[2]);
		
		// For cylinders, update the geometry if height changed
		if (vol.shape === 'cylinder' && mesh.geometry.parameters.height !== vol.hwd[0]) {
			mesh.geometry.dispose();
			mesh.geometry = new THREE.CylinderGeometry(
				vol.hwd[1] || 0.1,
				vol.hwd[1] || 0.1,
				vol.hwd[0] || 1,
				16
			);
		}
	},
	
	animate: function() {
		requestAnimationFrame(() => this.animate());
		
		// Update controls
		this.controls.update();
		
		// Render scene
		this.renderer.render(this.scene, this.camera);
	}
};
