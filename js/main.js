// Soda — can tilt, flavor switch, berry repulsion/float, leaves, bubbles.
// Verbatim from the spec; only the asset paths point at ASSET_BASE_URL.
const ASSET_BASE_URL = 'assets';

const modelViewer = document.querySelector('#product-model');
const berriesFG = document.querySelector('.berries-container');
const berriesBG = document.querySelector('.berries-container-bg');
const leavesBG = document.querySelector('.leaves-container');
const allBerries = document.querySelectorAll('.berry');
const cards = document.querySelectorAll('.card');
let isSwitching = false;
let switchSpin = 0;
let blueTexture = null;
let greenTexture = null;

// Preload textures & Warm up shaders
modelViewer.addEventListener('load', async () => {
    try {
        blueTexture = await modelViewer.createTexture(`${ASSET_BASE_URL}/blue-base-color.jpg`);
        greenTexture = await modelViewer.createTexture(`${ASSET_BASE_URL}/green-base-color.jpg`);

        // Shader Warm-up: Briefly apply textures to compile shaders
        if (modelViewer.model) {
            const material = modelViewer.model.materials[0];
            if (material && material.pbrMetallicRoughness.baseColorTexture) {
                // Apply blue
                material.pbrMetallicRoughness.baseColorTexture.setTexture(blueTexture);
                await new Promise(r => requestAnimationFrame(r));
                // Apply green back
                material.pbrMetallicRoughness.baseColorTexture.setTexture(greenTexture);
            }
        }
    } catch (e) { console.error("Texture preload failed", e); }
});

cards.forEach(card => {
    card.addEventListener('click', () => {
        if (isSwitching) return;
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const flavor = card.dataset.flavor;
        switchFlavor(flavor);
    });
});

async function switchFlavor(flavor) {
    if (isSwitching) return;
    isSwitching = true;
    const body = document.body;
    const berries = document.querySelectorAll('.berry');
    const heroCenter = document.querySelector('.hero-center');

    // 1. Background Animation
    const targetColors = flavor === 'blue' ?
        { inner: '#0b4f8a', mid: '#04294e', outer: '#010c14' } :
        { inner: '#0b8a78', mid: '#044e3b', outer: '#011411' };

    gsap.to(body, {
        '--bg-inner': targetColors.inner,
        '--bg-mid': targetColors.mid,
        '--bg-outer': targetColors.outer,
        duration: 1.5,
        ease: 'power2.inOut'
    });

    // 2. Can Spin Animation (Simple 360 spin + blur with back settle)
    const spinObj = { val: 0, blur: 0 };
    gsap.to(spinObj, {
        val: 360,
        blur: 15,
        duration: 0.6,
        ease: "power2.in",
        onUpdate: () => {
            switchSpin = spinObj.val;
            modelViewer.style.filter = `blur(${spinObj.blur}px)`;
        },
        onComplete: async () => {
            // SWAP at peak
            if (flavor === 'blue') {
                body.classList.add('blue-theme');
                if (modelViewer.model && blueTexture) {
                    modelViewer.model.materials.forEach(material => {
                        if (material.pbrMetallicRoughness.baseColorTexture) {
                            material.pbrMetallicRoughness.baseColorTexture.setTexture(blueTexture);
                        }
                    });
                }
            } else {
                body.classList.remove('blue-theme');
                if (modelViewer.model && greenTexture) {
                    modelViewer.model.materials.forEach(material => {
                        if (material.pbrMetallicRoughness.baseColorTexture) {
                            material.pbrMetallicRoughness.baseColorTexture.setTexture(greenTexture);
                        }
                    });
                }
            }

            gsap.to(spinObj, {
                val: 720,
                blur: 0,
                duration: 1.5,
                ease: "back.out(0.7)",
                onUpdate: () => {
                    switchSpin = spinObj.val;
                    modelViewer.style.filter = `blur(${spinObj.blur}px)`;
                },
                onComplete: () => {
                    switchSpin = 0;
                    modelViewer.style.filter = 'none';
                }
            });
        }
    });

    // 3. Berries "Hide & Reveal" with Dynamic Positioning
    let completedBerries = 0;
    berries.forEach((berry, i) => {
        const bW = berry.offsetWidth / 2;
        const bH = berry.offsetHeight / 2;
        const centerX = (window.innerWidth / 2 - berry.offsetLeft - bW);
        const centerY = (window.innerHeight / 2 - berry.offsetTop - bH);

        const startAngle = parseFloat(berry.dataset.angle) || 0;
        const currentBaseX = parseFloat(berry.dataset.baseX) || 0;
        const currentBaseY = parseFloat(berry.dataset.baseY) || 0;

        // New random target position - Increased range for visibility
        const nextBaseX = (Math.random() - 0.5) * 200;
        const nextBaseY = (Math.random() - 0.5) * 200;

        gsap.set(berry, {
            rotation: startAngle,
            x: currentBaseX,
            y: currentBaseY
        });

        const berryTl = gsap.timeline();

        berryTl.to(berry, {
            x: centerX,
            y: centerY,
            rotation: startAngle + 45,
            scale: 0.1,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                berry.src = flavor === 'blue' ? `${ASSET_BASE_URL}/blueberry.glb` : `${ASSET_BASE_URL}/cherry.glb`;
                heroCenter.style.zIndex = 50;
            }
        })
        .to(berry, {
            duration: 0.3
        })
        .to(berry, {
            onStart: () => {
                heroCenter.style.zIndex = 1;
            },
            x: nextBaseX,
            y: nextBaseY,
            rotation: startAngle + 90,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(1.5)",
            onComplete: () => {
                berry.dataset.angle = startAngle + 90;
                berry.dataset.baseX = nextBaseX;
                berry.dataset.baseY = nextBaseY;
                berry.dataset.rx = 0;
                berry.dataset.ry = 0;

                completedBerries++;
                if (completedBerries === berries.length) {
                    isSwitching = false;
                }
            }
        });
    });
}


// Track berry states for smoothing
allBerries.forEach(b => {
    b.dataset.rx = 0; b.dataset.ry = 0; b.dataset.angle = Math.random() * 360;
    b.dataset.baseX = 0; b.dataset.baseY = 0;
    b.dataset.targetRx = 0; b.dataset.targetRy = 0;
});

let mouse = { x: 0, y: 0, px: 0, py: 0 };
let currentMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
    mouse.px = e.clientX;
    mouse.py = e.clientY;
});

function animate() {
    const time = Date.now() * 0.001;
    // Target camera position based on mouse
    // Smoothly interpolate current mouse to target mouse
    currentMouse.x += (mouse.x - currentMouse.x) * 0.05;
    currentMouse.y += (mouse.y - currentMouse.y) * 0.05;

    // Tilt the product can + add switch spin
    modelViewer.cameraOrbit = `${(currentMouse.x * 40) + switchSpin}deg ${90 + (currentMouse.y * 20)}deg 380%`;

    // Update parallax containers - Always
    berriesFG.style.transform = `translate(${currentMouse.x * 60}px, ${currentMouse.y * 60}px)`;
    berriesBG.style.transform = `translate(${currentMouse.x * -30}px, ${currentMouse.y * -30}px)`;
    leavesBG.style.transform = `translate(${currentMouse.x * -15}px, ${currentMouse.y * -15}px)`;

    // Update each berry with its own smoothing and float - ONLY IF NOT SWITCHING
    if (!isSwitching) {
        allBerries.forEach((berry, i) => {
            const berryRect = berry.getBoundingClientRect();
            const berryX = berryRect.left + berryRect.width / 2;
            const berryY = berryRect.top + berryRect.height / 2;

            const diffX = mouse.px - berryX;
            const diffY = mouse.py - berryY;
            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            let targetRx = 0, targetRy = 0, speedMult = 1;

            if (distance < 400) {
                const force = (400 - distance) / 400;
                targetRx = (diffX / distance) * force * -80;
                targetRy = (diffY / distance) * force * -80;
                speedMult = 1 + force * 5;
            }

            // Lerp repulsion values
            let rx = parseFloat(berry.dataset.rx) || 0;
            let ry = parseFloat(berry.dataset.ry) || 0;
            let angle = parseFloat(berry.dataset.angle) || 0;
            let baseX = parseFloat(berry.dataset.baseX) || 0;
            let baseY = parseFloat(berry.dataset.baseY) || 0;

            rx += (targetRx - rx) * 0.1;
            ry += (targetRy - ry) * 0.1;
            angle += 0.2 * speedMult;

            berry.dataset.rx = rx;
            berry.dataset.ry = ry;
            berry.dataset.angle = angle;

            // Floating effect
            const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9];
            const phase = (time + i * 0.7) * (Math.PI * 2 / dur);
            const floatY = Math.sin(phase) * 15;
            const floatAngle = Math.cos(phase) * 6;

            berry.style.transform = `translate(calc(${rx + baseX}px), calc(${ry + baseY}px + ${floatY}px)) rotate(calc(${angle}deg + ${floatAngle}deg))`;
        });
    }

    // Update leaves with float - ALWAYS
    document.querySelectorAll('.leaf').forEach((leaf, i) => {
        const dur = 10 + i * 2;
        const phase = (time + i * 1.2) * (Math.PI * 2 / dur);
        const floatY = Math.sin(phase) * 20;
        const floatX = Math.cos(phase * 0.5) * 15;
        const floatAngle = Math.sin(phase * 0.3) * 15;
        leaf.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${floatAngle}deg)`;
    });

    requestAnimationFrame(animate);
}

animate();

// Bubbles Generator using bubble.png
const bubblesContainer = document.getElementById('bubbles-container');
function createBubble() {
    if (!bubblesContainer) return;
    const bubble = document.createElement('img');
    bubble.src = `${ASSET_BASE_URL}/bubble.png`;
    bubble.className = 'bubble-img';
    const size = Math.random() * 20 + 10 + 'px';
    bubble.style.width = size;
    bubble.style.height = 'auto';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = '-50px';
    bubble.style.opacity = Math.random() * 0.4 + 0.2;

    const duration = Math.random() * 6 + 4;
    bubble.style.animation = `floatUpImg ${duration}s linear forwards`;

    bubblesContainer.appendChild(bubble);
    setTimeout(() => bubble.remove(), duration * 1000);
}
setInterval(createBubble, 400);
