import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Config from './config';

import Camera from '@components/Camera';

const globe = require('@assets/models/globe.gltf');
const cubeMap = require('@img/cubemap.jpg');

class Engine {
    constructor() {
        this.render = this.render.bind(this);

        // Set up the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x888888);

        // Set up renderer
        this.renderer = new THREE.WebGLRenderer();
        document.body.appendChild(this.renderer.domElement);

        // Set up camera
        this.camera = new Camera(this.renderer);
        this.camera.position.set(0, 200, 200);
        this.camera.lookAt(0, 0, 0);

        // Set up controls
        this.controls = new MapControls(this.camera, this.renderer.domElement);
        this.controls.update();

        // Grid
        const grid = new THREE.GridHelper(
            Config.WORLD_SIZE * Config.GRID_SIZE,
            Config.WORLD_SIZE,
            new THREE.Color(0xFFFFFF),
            new THREE.Color(0xAAAAAA)
        );

        this.scene.add(grid);

        this.render();

        const worldSize = Config.WORLD_SIZE * Config.GRID_SIZE;

        // Light
        this.hemiLight = new THREE.HemisphereLight(0xfcffd1, 0xa8a08e, 0.5);
        this.hemiLight.position.set(0, 100, 100);
        // this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.dirLight.position.set(100, 100, 100);
        this.scene.add(this.dirLight);

        // Water
        this.waterMaterial = new THREE.ShaderMaterial({
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            // wireframe: true,
            uniforms: {
                time: {
                    value: 1.0
                },
                noise: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/noise.png').default)
                },
                terrain: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/terrain2.png').default)
                }
            },
            vertexShader: require('@shaders/water.vert.glsl'),
            fragmentShader: require('@shaders/water.frag.glsl')
        });

        // Land
        this.landMaterial = new THREE.ShaderMaterial({
            vertexColors: true,
            // wireframe: true,
            uniforms: {
                time: {
                    value: 1.0
                },
                noise: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/noise.png').default)
                },
                terrain: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/terrain2.png').default)
                }
            },
            vertexShader: require('@shaders/land.vert.glsl'),
            fragmentShader: require('@shaders/land.frag.glsl')
        });

        /*
        this.landMaterial = new THREE.MeshPhysicalMaterial({
            // wireframe: true,
            color: 0xf2dc85,
            emissive: 0x666666,
            uniforms: {
                time: {
                    value: 1.0
                },
                noise: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/noise.png').default)
                },
                terrain: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture(require('@img/terrain2.png').default)
                }
            }
        });
        */

        /*
        this.landMaterial.onBeforeCompile = (shader, renderer) => {
            let { fragmentShader, vertexShader } = shader;

            const fragToken = '#include <color_fragment>';
            const vertToken = '#include <uv_vertex>';
        
            vertexShader = `
                uniform sampler2D noise;
                uniform sampler2D terrain;

                varying vec2 vUv;
                
                ${vertexShader}
            `;
    
            fragmentShader = `
                uniform sampler2D noise;
                uniform sampler2D terrain;
                uniform float time;

                varying vec2 vUv;
                
                ${fragmentShader}
            `;

            fragmentShader = fragmentShader.replace(fragToken, require('@shaders/land.frag.glsl'));
            vertexShader = vertexShader.replace(vertToken, require('@shaders/land.vert.glsl'));

            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader;
        };
        */

        this.waterMaterial.uniforms.noise.value.wrapS = this.waterMaterial.uniforms.noise.value.wrapT = THREE.RepeatWrapping;
        this.waterMaterial.uniforms.terrain.value.wrapS = this.waterMaterial.uniforms.terrain.value.wrapT = THREE.RepeatWrapping;

        this.landMaterial.uniforms.noise.value.wrapS = this.landMaterial.uniforms.noise.value.wrapT = THREE.RepeatWrapping;
        this.landMaterial.uniforms.terrain.value.wrapS = this.landMaterial.uniforms.terrain.value.wrapT = THREE.RepeatWrapping;

        const textureLoader = new THREE.TextureLoader();
        let textureEquirec = textureLoader.load(cubeMap.default);
        textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        textureEquirec.encoding = THREE.sRGBEncoding;

        // Model
        const loader = new GLTFLoader();

        loader.load(globe, (gltf) => {
            const { scene } = gltf;

            scene.children.map(mesh => {

                switch (mesh.name) {
                    case 'Glass_Inside':
                    case 'Glass_Outside':
                        const instance = mesh.clone();

                        instance.material = new THREE.MeshPhysicalMaterial({
                            depthWrite: false,
                            color: 0x000000,
                            emissive: 0x888888,
                            combine: THREE.MixOperation,
                            transparent: true,
                            opacity: 0.2,
                            envMap: textureEquirec,
                            reflectivity: 1,
                            clearcoat: 1,
                            roughness: 0
                        });

                        this.scene.add(instance);
                    break;

                    case 'Water':
                        const water = mesh.clone();

                        water.material = this.waterMaterial;

                        this.scene.add(water);
                        break;

                    case 'Land':
                        const land = mesh.clone();

                        land.material = this.landMaterial;

                        // land.scale.set(0.999, 0.999, 0.999);
                        
                        this.scene.add(land);
                        break;
                }
            });

        }, undefined, (error) => {
            console.error(error);
        });
    }

    render(time) {
        requestAnimationFrame(this.render);

        if (this.waterMaterial) {
            this.waterMaterial.uniforms.time.value = time / 100;
        }

        if (this.landMaterial) {
            this.landMaterial.uniforms.time.value = time / 100;
        }

        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }
};

export default Engine;
