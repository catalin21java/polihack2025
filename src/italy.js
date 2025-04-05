// clearing the console (just a CodePen thing)

console.clear();

// there are 3 parts to this
//
// Scene:           Setups and manages threejs rendering
// loadModel:       Loads the 3d model file
// setupAnimation:  Creates all the GSAP 
//                  animtions and scroll triggers 
//
// first we call loadModel, once complete we call
// setupAnimation which creates a new Scene

class Scene
{
	constructor(model)
	{
		this.views = [
			{ bottom: 0, height: 1 },
			{ bottom: 0, height: 0 }
		];
		
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);

		document.body.appendChild( this.renderer.domElement );
		
		// scene

		this.scene = new THREE.Scene();
		
		for ( var ii = 0; ii < this.views.length; ++ ii ) {

			var view = this.views[ ii ];
			var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
			camera.position.fromArray([0, 0, 180] );
			camera.layers.disableAll();
			camera.layers.enable( ii );
			view.camera = camera;
			camera.lookAt(new THREE.Vector3(0, 5, 0));
		}
		
		//light

		this.light = new THREE.PointLight( 0xffffff, 0.75 );
		this.light.position.z = 150;
		this.light.position.x = 70;
		this.light.position.y = -20;
		this.scene.add( this.light );

		this.softLight = new THREE.AmbientLight( 0xffffff, 1.5 );
		this.scene.add(this.softLight)

		// group

		this.onResize();
		window.addEventListener( 'resize', this.onResize, false );
		
		// Create a wireframe version of the model for the second view
		// Since Vespa is more complex, we'll create a simple wireframe material
		const wireframeMaterial = new THREE.MeshBasicMaterial({ 
			color: 0xffffff, 
			wireframe: true,
			transparent: true,
			opacity: 0.5
		});
		
		// Clone the model for wireframe
		const wireframeModel = model.scene.clone();
		wireframeModel.traverse(child => {
			if (child.isMesh) {
				child.material = wireframeMaterial;
			}
		});
			
		// Set up model groups and layers
		this.modelGroup = new THREE.Group();
		
		model.scene.traverse(child => {
			if (child.isMesh) {
				child.layers.set(0);
			}
		});
		
		wireframeModel.traverse(child => {
			if (child.isMesh) {
				child.layers.set(1);
			}
		});
		
		this.modelGroup.add(model.scene);
		this.modelGroup.add(wireframeModel);
		this.scene.add(this.modelGroup);
	}
	
	render = () =>
	{
		for ( var ii = 0; ii < this.views.length; ++ ii ) {

			var view = this.views[ ii ];
			var camera = view.camera;

			var bottom = Math.floor( this.h * view.bottom );
			var height = Math.floor( this.h * view.height );

			this.renderer.setViewport( 0, 0, this.w, this.h );
			this.renderer.setScissor( 0, bottom, this.w, height );
			this.renderer.setScissorTest( true );

			camera.aspect = this.w / this.h;
			this.renderer.render( this.scene, camera );
		}
	}
	
	onResize = () => 
	{
		this.w = window.innerWidth;
		this.h = window.innerHeight;
		
		for ( var ii = 0; ii < this.views.length; ++ ii ) {
			var view = this.views[ ii ];
			var camera = view.camera;
			camera.aspect = this.w / this.h;
			let camZ = (screen.width - (this.w * 1)) / 3;
			camera.position.z = camZ < 180 ? 180 : camZ;
			camera.updateProjectionMatrix();
		}

		this.renderer.setSize( this.w, this.h );		
		this.render();
	}
}

function loadModel() 
{
	gsap.registerPlugin(ScrollTrigger);
	gsap.registerPlugin(DrawSVGPlugin);
	gsap.set('#line-length', {drawSVG: 0})
	gsap.set('#line-wingspan', {drawSVG: 0})
	gsap.set('#circle-phalange', {drawSVG: 0})
	
	var model;

	function onModelLoaded(gltf) {
		// Prepare materials for the Vespa model
		gltf.scene.traverse(function(child) {
			if (child.isMesh) {
				// Enhance materials to look better
				child.material.metalness = 0.3;
				child.material.roughness = 0.8;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		
		// Scale the model down - Vespa might be differently sized than the plane
		gltf.scene.scale.set(30, 30, 30);
		
		// Setup the animation with the loaded model
		setupAnimation(gltf);
	}

	// Load the GLTF model (Vespa scooter)
	const loader = new THREE.GLTFLoader();
	loader.load('models_3d/scooter_vespa_pizza.glb', 
		function(gltf) { 
			model = gltf;
			onModelLoaded(gltf);
		},
		function(xhr) {
			// Progress indicator could be added here
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function(error) {
			console.error('Error loading model:', error);
		}
	);
}

function setupAnimation(model)
{
	let scene = new Scene(model);
	let vespa = scene.modelGroup;
	
	gsap.fromTo('canvas',{x: "50%", autoAlpha: 0},  {duration: 1, x: "0%", autoAlpha: 1});
	gsap.to('.loading', {autoAlpha: 0})
	gsap.to('.scroll-cta', {opacity: 1})
	gsap.set('svg', {autoAlpha: 1})
	
	let tau = Math.PI * 2;

	// Initial position and rotation for Vespa
	gsap.set(vespa.rotation, {y: tau * -.25});
	gsap.set(vespa.position, {x: 80, y: -32, z: -60});
	
	scene.render();
	
	var sectionDuration = 1;
	gsap.fromTo(scene.views[1], 
		{ 	height: 1, bottom: 0 }, 
		{
			height: 0, bottom: 1,
			ease: 'none',
			scrollTrigger: {
			  trigger: ".blueprint",
			  scrub: true,
			  start: "bottom bottom",
			  end: "bottom top"
			}
		})
	
	gsap.fromTo(scene.views[1], 
		{ 	height: 0, bottom: 0 }, 
		{
			height: 1, bottom: 0,
			ease: 'none',
			scrollTrigger: {
			  trigger: ".blueprint",
			  scrub: true,
			  start: "top bottom",
			  end: "top top"
			}
		})
	
	gsap.to('.ground', {
		y: "30%",
		scrollTrigger: {
		  trigger: ".ground-container",
		  scrub: true,
		  start: "top bottom",
		  end: "bottom top"
		}
	})
	
	gsap.from('.clouds', {
		y: "25%",
		scrollTrigger: {
		  trigger: ".ground-container",
		  scrub: true,
		  start: "top bottom",
		  end: "bottom top"
		}
	})
	
	gsap.to('#line-length', {
		drawSVG: 100,
		scrollTrigger: {
		  trigger: ".length",
		  scrub: true,
		  start: "top 60%",
		  end: "bottom 80%"
		}
	})
	
	gsap.to('#line-wingspan', {
		drawSVG: 100,
		scrollTrigger: {
		  trigger: ".wingspan",
		  scrub: true,
		  start: "top 40%",
		  end: "bottom 60%"
		}
	})	
	
	gsap.to('#circle-phalange', {
		drawSVG: 100,
		scrollTrigger: {
		  trigger: ".phalange",
		  scrub: true,
		  start: "top 40%",
		  end: "bottom 80%"
		}
	})
	
	gsap.to('#line-length', {
		opacity: 0,
		drawSVG: 0,
		scrollTrigger: {
		  trigger: ".length",
		  scrub: true,
		  start: "top top",
		  end: "bottom top"
		}
	})
	
	gsap.to('#line-wingspan', {
		opacity: 0,
		drawSVG: 0,
		scrollTrigger: {
		  trigger: ".wingspan",
		  scrub: true,
		  start: "top top",
		  end: "bottom top"
		}
	})	
	
	gsap.to('#circle-phalange', {
		opacity: 0,
		drawSVG: 0,
		scrollTrigger: {
		  trigger: ".phalange",
		  scrub: true,
		  start: "top top",
		  end: "bottom top"
		}
	})
	
	let tl = new gsap.timeline(
	{
		onUpdate: scene.render,
		scrollTrigger: {
		  trigger: ".content",
		  scrub: true,
		  start: "top top",
		  end: "bottom bottom",
		  endTrigger: ".content"
		},
		defaults: {duration: sectionDuration, ease: 'power2.inOut'}
	});
	
	let delay = 0;
	
	tl.to('.scroll-cta', {duration: 0.25, opacity: 0}, delay)
	tl.to(vespa.position, {x: -10, ease: 'power1.in'}, delay)
	
	delay += sectionDuration;
	
	// Animations adjusted for Vespa - more realistic movements
	tl.to(vespa.rotation, {x: tau * .05, y: 0, z: -tau * 0.05, ease: 'power1.inOut'}, delay)
	tl.to(vespa.position, {x: -40, y: 0, z: -60, ease: 'power1.inOut'}, delay)
	
	delay += sectionDuration;
	
	tl.to(vespa.rotation, {x: tau * .05, y: 0,  z: tau * 0.05, ease: 'power3.inOut'}, delay)
	tl.to(vespa.position, {x: 40, y: 0, z: -60, ease: 'power2.inOut'}, delay)
	
	delay += sectionDuration;
	
	// Make the Vespa lean into turns
	tl.to(vespa.rotation, {x: tau * .05, y: 0, z: -tau * 0.1, ease: 'power3.inOut'}, delay)
	tl.to(vespa.position, {x: -40, y: 0, z: -30, ease: 'power2.inOut'}, delay)
	
	delay += sectionDuration;
	
	tl.to(vespa.rotation, { x: 0, z: 0, y: tau * .25}, delay)
	tl.to(vespa.position, { x: 0, y: -10, z: 50}, delay)
	
	delay += sectionDuration;
	delay += sectionDuration;
	
	// Dramatic spins for showcase - keeping size consistent
	tl.to(vespa.rotation, {x: tau * 0.05, y: tau *.5, z: 0, ease:'power4.inOut'}, delay)
	tl.to(vespa.position, {z: 30, x: 20, ease:'power4.inOut'}, delay)
	
	delay += sectionDuration;
	
	tl.to(vespa.rotation, {x: tau * 0.05, y: tau *.5, z: 0, ease:'power4.inOut'}, delay)
	tl.to(vespa.position, {z: 40, x: 30, ease:'power4.inOut'}, delay)
	
	delay += sectionDuration;
	
	tl.to(vespa.rotation, {x: tau * 0.05, y: tau *.65, z: tau * 0.05, ease:'power4.inOut'}, delay)
	tl.to(vespa.position, {z: 0, x: 20, y: 0, ease:'power4.inOut'}, delay)
	
	delay += sectionDuration;
	
	// Move Vespa to top position before exit, facing left
	tl.to(vespa.rotation, {x: 0, y: tau * .75, z: 0, ease: 'power1.in'}, delay)
	tl.to(vespa.position, {z: -20, x: 0, y: 50, ease: 'power1.inOut'}, delay)
	
	delay += sectionDuration;
	
	// Exit to the left while continuing to face left - FASTER EXIT
	tl.to(vespa.rotation, {duration: sectionDuration * 0.5, x: 0, y: tau * .75, z: -tau * 0.05, ease: 'power2.in'}, delay)
	tl.to(vespa.position, {duration: sectionDuration * 0.5, x: -500, y: 50, z: -20, ease: 'power3.in'}, delay)
	
	tl.to(scene.light.position, {duration: sectionDuration * 0.5, x: 0, y: 0, z: 0}, delay)
}

loadModel();