import { PerspectiveCamera } from 'three';

class Camera extends PerspectiveCamera {
    constructor(renderer) {
        super(75, 1.0, 0.1, 1000);

        this.aspect = this.aspectRatio;
        this.renderer = renderer;

        window.addEventListener('resize', this.resize.bind(this));

        this.resize();
    }

    get width() {
        return window.innerWidth;
    }

    get height() {
        return window.innerHeight;
    }

    resize() {
        this.aspect = this.width / this.height;
        this.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }
};

export default Camera;
