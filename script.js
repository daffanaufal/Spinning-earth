const countries = {
    "Netherlands": { lat: 52.3676, lon: 4.9041, flag: "https://www.countryflags.io/NL/flat/64.png" },
    "Belgium": { lat: 50.8503, lon: 4.3517, flag: "https://www.countryflags.io/BE/flat/64.png" },
    "Germany": { lat: 51.1657, lon: 10.4515, flag: "https://www.countryflags.io/DE/flat/64.png" },
    "Austria": { lat: 47.5162, lon: 14.5501, flag: "https://www.countryflags.io/AT/flat/64.png" },
    "Sweden": { lat: 60.1282, lon: 18.6435, flag: "https://www.countryflags.io/SE/flat/64.png" },
    "Finland": { lat: 61.9241, lon: 25.7482, flag: "https://www.countryflags.io/FI/flat/64.png" },
    "Norway": { lat: 60.472, lon: 8.4689, flag: "https://www.countryflags.io/NO/flat/64.png" },
    "Denmark": { lat: 56.2639, lon: 9.5018, flag: "https://www.countryflags.io/DK/flat/64.png" },
    "UK": { lat: 55.3781, lon: -3.436, flag: "https://www.countryflags.io/GB/flat/64.png" }
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Create a sphere (Earth)
const geometry = new THREE.SphereGeometry(10, 32, 32);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
earthGroup.add(earth);

// Add pinpointed locations 
for (const country in countries) {
    const { lat, lon, flag } = countries[country];
    const latRad = (90 - lat) * (Math.PI / 180);
    const lonRad = (180 - lon) * (Math.PI / 180);
    const radius = 10;

    const x = radius * Math.sin(latRad) * Math.cos(lonRad);
    const y = radius * Math.cos(latRad);
    const z = radius * Math.sin(latRad) * Math.sin(lonRad);

    const dotGeometry = new THREE.SphereGeometry(0.2, 5, 5); 
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x, y, z);
    dot.userData.countryName = country;
    dot.userData.flagUrl = flag;
    earthGroup.add(dot);

    // Add country label
    const label = createLabel(country);
    label.position.set(x + 0.4, y + 0.4, z); 
    earthGroup.add(label);
}


// Function to create a text label
function createLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'Bold 30px Arial';
    context.fillStyle = 'black';
    context.fillText(text, 1, 24);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.scale.set(2, 1, 2);

    return labelSprite;
}


camera.position.z = 15;

let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

document.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
            toRadians(deltaMove.y * 1),
            toRadians(deltaMove.x * 1),
            0,
            'XYZ'
        ));

    earthGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, earthGroup.quaternion);
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
