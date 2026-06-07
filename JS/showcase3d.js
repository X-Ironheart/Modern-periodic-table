let scene, camera, renderer, controls, animationFrameId;
let activeGroup = null; // Container for the active 3D meshes

export function initShowcase() {
  const container = document.getElementById("showcase-canvas-container");
  if (!container) return;

  // 1. Setup clean scene teardown to avoid leaks
  if (renderer) {
    cancelAnimationFrame(animationFrameId);
    container.innerHTML = "";
    renderer.dispose();
    renderer = null;
  }

  // 2. Initialize Three.js essentials
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);

  const width = container.clientWidth || 500;
  const height = 500;
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Orbit controls for rotation, panning and zoom
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.4);
  dirLight2.position.set(-5, -5, 5);
  scene.add(dirLight2);

  // Active Group for dynamic loading
  activeGroup = new THREE.Group();
  scene.add(activeGroup);

  // 3. Tab switching inside showcase panel
  const btnOrbitals = document.getElementById("btn-show-orbitals");
  const btnCompounds = document.getElementById("btn-show-compounds");
  const panelOrbitals = document.getElementById("panel-show-orbitals");
  const panelCompounds = document.getElementById("panel-show-compounds");

  const selectOrbital = document.getElementById("select-orbital");
  const selectCompound = document.getElementById("select-compound");

  btnOrbitals.onclick = () => {
    btnOrbitals.classList.add("active-showcase-tab");
    btnCompounds.classList.remove("active-showcase-tab");
    panelOrbitals.classList.add("active-showcase-panel");
    panelCompounds.classList.remove("active-showcase-panel");
    loadOrbital(selectOrbital.value);
  };

  btnCompounds.onclick = () => {
    btnCompounds.classList.add("active-showcase-tab");
    btnOrbitals.classList.remove("active-showcase-tab");
    panelCompounds.classList.add("active-showcase-panel");
    panelOrbitals.classList.remove("active-showcase-panel");
    loadCompound(selectCompound.value);
  };

  // Select dropdown bindings
  selectOrbital.onchange = (e) => loadOrbital(e.target.value);
  selectCompound.onchange = (e) => loadCompound(e.target.value);

  // Load initial view
  if (btnOrbitals.classList.contains("active-showcase-tab")) {
    loadOrbital(selectOrbital.value);
  } else {
    loadCompound(selectCompound.value);
  }

  // Handle Resize
  window.addEventListener("resize", onWindowResize);

  // Start loop
  animate();
}

function onWindowResize() {
  const container = document.getElementById("showcase-canvas-container");
  if (!container || !renderer) return;
  const width = container.clientWidth;
  camera.aspect = width / 500;
  camera.updateProjectionMatrix();
  renderer.setSize(width, 500);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // Gentle default rotation if user isn't interacting
  if (activeGroup) {
    activeGroup.rotation.y += 0.005;
    activeGroup.rotation.x += 0.002;
  }

  controls.update();
  renderer.render(scene, camera);
}

// ==========================================================================
// 3D Orbitals Particle Clouds Rendering
// ==========================================================================
function loadOrbital(type) {
  clearActiveGroup();

  const title = document.getElementById("orbital-title");
  const desc = document.getElementById("orbital-desc");

  const particleCount = 4000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  if (type === "s") {
    title.textContent = "s Orbital (Spherical)";
    desc.textContent = "Spherical symmetry with the nucleus at the center. Holds a maximum of 2 electrons. Shows high probability of electron density near the nucleus.";
    
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const r = -Math.log(u) * 2.2; // Exponential radial decay
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      
      // Dynamic glowing blue/teal hues
      colors.push(0.1, 0.6 + Math.random() * 0.4, 1.0);
    }
  } else if (type === "p") {
    title.textContent = "p Orbital (Dumbbell)";
    desc.textContent = "Consists of two lobes aligned along a nodal plane (e.g., px, py, pz). The two opposite phases are represented by red and blue clouds.";
    
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      const prob = Math.cos(phi) * Math.cos(phi); // cos^2(phi) lobe amplitude
      
      if (Math.random() < prob) {
        const r = -Math.log(u) * 2.2;
        positions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        
        // Color phase lobes: Top positive (red), Bottom negative (blue)
        if (Math.cos(phi) > 0) {
          colors.push(1.0, 0.2, 0.2);
        } else {
          colors.push(0.2, 0.4, 1.0);
        }
      } else {
        i--;
      }
    }
  } else if (type === "d") {
    title.textContent = "d Orbital (Double Dumbbell / Clover)";
    desc.textContent = "Comprises 4 lobes of electron probability density. Exists in energy levels 3 and above. Important for transition metals bonding.";
    
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      // Clover probability: sin^2(phi) * cos^2(2*theta)
      const prob = Math.sin(phi) * Math.sin(phi) * Math.cos(2*theta) * Math.cos(2*theta);
      
      if (Math.random() < prob) {
        const r = -Math.log(u) * 2.2;
        positions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        
        // Alternating color phases in 4 quadrant lobes
        if (Math.cos(2*theta) > 0) {
          colors.push(1.0, 0.75, 0.1); // yellow/orange
        } else {
          colors.push(0.1, 0.9, 0.7); // emerald
        }
      } else {
        i--;
      }
    }
  } else if (type === "f") {
    title.textContent = "f Orbital (Complex / Nested)";
    desc.textContent = "Highly complex shape with 8 distinct lobes or ring structures. Available in lanthanides and actinides (energy levels 4 and above).";
    
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      // 8-lobe probability: sin^3(phi) * sin^2(3*theta)
      const prob = Math.pow(Math.sin(phi), 3) * Math.pow(Math.sin(3*theta), 2);
      
      if (Math.random() < prob) {
        const r = -Math.log(u) * 2.2;
        positions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        
        if (Math.sin(3*theta) > 0) {
          colors.push(0.95, 0.4, 0.9); // pink
        } else {
          colors.push(0.2, 0.85, 1.0); // light blue
        }
      } else {
        i--;
      }
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // Glowing point particle texture (small circular dots)
  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  activeGroup.add(points);
  camera.position.set(0, 0, 6);
  controls.reset();
}

// ==========================================================================
// 3D Compounds Ball-and-Stick Models Rendering
// ==========================================================================
function loadCompound(type) {
  clearActiveGroup();

  const title = document.getElementById("compound-title");
  const desc = document.getElementById("compound-desc");

  // Atomic representation specifications (size, color hex)
  const atoms = {
    H: { r: 0.28, color: 0xffffff },
    C: { r: 0.42, color: 0x475569 },
    O: { r: 0.44, color: 0xef4444 },
    N: { r: 0.43, color: 0x3b82f6 },
    Na: { r: 0.52, color: 0xa855f7 },
    Cl: { r: 0.58, color: 0x10b981 }
  };

  const modelGroup = new THREE.Group();

  const sphereGeomCache = {};
  function getSphereGeometry(radius) {
    if (!sphereGeomCache[radius]) {
      sphereGeomCache[radius] = new THREE.SphereGeometry(radius, 24, 24);
    }
    return sphereGeomCache[radius];
  }

  function addAtom(type, x, y, z) {
    const spec = atoms[type];
    const geom = getSphereGeometry(spec.r);
    const mat = new THREE.MeshPhongMaterial({
      color: spec.color,
      shininess: 90,
      specular: 0x333333
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    modelGroup.add(mesh);
    return mesh;
  }

  function addBond(pos1, pos2) {
    const direction = new THREE.Vector3().subVectors(pos2, pos1);
    const length = direction.length();
    
    const geom = new THREE.CylinderGeometry(0.08, 0.08, length, 12);
    const mat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const cylinder = new THREE.Mesh(geom, mat);
    
    // Position at midpoint
    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);
    
    // Rotate cylinder along bond direction vector
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    
    modelGroup.add(cylinder);
  }

  if (type === "h2o") {
    title.textContent = "Water (H₂O)";
    desc.textContent = "Consists of two Hydrogen atoms covalently bonded to a single central Oxygen atom at a bent angle of roughly 104.5 degrees.";

    const O = addAtom("O", 0, 0.35, 0).position;
    const H1 = addAtom("H", -0.9, -0.35, 0).position;
    const H2 = addAtom("H", 0.9, -0.35, 0).position;

    addBond(O, H1);
    addBond(O, H2);
    camera.position.set(0, 0, 4.5);

  } else if (type === "co2") {
    title.textContent = "Carbon Dioxide (CO₂)";
    desc.textContent = "A linear molecule with two double covalent bonds connecting two Oxygen atoms to a central Carbon atom.";

    const C = addAtom("C", 0, 0, 0).position;
    const O1 = addAtom("O", -1.3, 0, 0).position;
    const O2 = addAtom("O", 1.3, 0, 0).position;

    // Draw double bonds (parallel cylinders offset slightly)
    addBond(new THREE.Vector3(-1.3, 0.07, 0), new THREE.Vector3(0, 0.07, 0));
    addBond(new THREE.Vector3(-1.3, -0.07, 0), new THREE.Vector3(0, -0.07, 0));
    addBond(new THREE.Vector3(1.3, 0.07, 0), new THREE.Vector3(0, 0.07, 0));
    addBond(new THREE.Vector3(1.3, -0.07, 0), new THREE.Vector3(0, -0.07, 0));
    camera.position.set(0, 0, 5);

  } else if (type === "ch4") {
    title.textContent = "Methane (CH₄)";
    desc.textContent = "Simplest alkane hydrocarbons. Renders in a perfect tetrahedral geometry with a C-H bond angle of 109.5 degrees.";

    const C = addAtom("C", 0, 0, 0).position;
    const H1 = addAtom("H", 0, 1.2, 0).position;
    const H2 = addAtom("H", 1.13, -0.4, 0).position;
    const H3 = addAtom("H", -0.56, -0.4, 0.98).position;
    const H4 = addAtom("H", -0.56, -0.4, -0.98).position;

    addBond(C, H1);
    addBond(C, H2);
    addBond(C, H3);
    addBond(C, H4);
    camera.position.set(0, 0, 5);

  } else if (type === "nacl") {
    title.textContent = "Sodium Chloride Lattice (NaCl)";
    desc.textContent = "A face-centered cubic crystal lattice structure representing table salt. Green spheres represent Chloride (Cl⁻) anions, purple spheres represent Sodium (Na⁺) cations.";

    // Render a small 3x3x3 grid lattice
    const spacing = 1.1;
    const points = [];
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const type = (x + y + z) % 2 === 0 ? "Cl" : "Na";
          const px = x * spacing;
          const py = y * spacing;
          const pz = z * spacing;
          const atomMesh = addAtom(type, px, py, pz);
          points.push({ x, y, z, pos: atomMesh.position });
        }
      }
    }

    // Connect nearest neighbors with rods
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];
        const dist = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) + Math.abs(p1.z - p2.z);
        if (dist === 1) {
          addBond(p1.pos, p2.pos);
        }
      }
    }
    camera.position.set(4, 3, 6);

  } else if (type === "caffeine") {
    title.textContent = "Caffeine Molecule (C₈H₁₀N₄O₂)";
    desc.textContent = "A complex central nervous system stimulant. Displays a fused pyrimidinedione and imidazole double-ring skeletal structure.";

    // Coarse coordinates mapping of ring vertices and methyl attachments
    const scale = 0.8;
    const vertices = [
      { t: "N", x: -0.7, y: 1.1, z: 0 },   // 0: N1
      { t: "C", x: 0.6, y: 1.5, z: 0 },    // 1: C2
      { t: "N", x: 1.5, y: 0.5, z: 0 },    // 2: N3
      { t: "C", x: 1.1, y: -0.8, z: 0 },   // 3: C4
      { t: "C", x: -0.2, y: -1.1, z: 0 },  // 4: C5
      { t: "C", x: -1.1, y: -0.1, z: 0 },  // 5: C6
      
      // Imidazole fused ring attachments
      { t: "N", x: -0.9, y: -2.3, z: 0 },  // 6: N7
      { t: "C", x: -2.1, y: -2.0, z: 0 },  // 7: C8
      { t: "N", x: -2.3, y: -0.7, z: 0 },  // 8: N9
      
      // Carbonyl oxygens
      { t: "O", x: 1.0, y: 2.7, z: 0 },    // 9: O2
      { t: "O", x: -2.3, y: 0.2, z: 0 },   // 10: O6
      
      // Methyl groups (simplified C representations)
      { t: "C", x: -1.7, y: 2.1, z: 0 },   // 11: N1-Methyl
      { t: "C", x: 2.9, y: 0.9, z: 0 },    // 12: N3-Methyl
      { t: "C", x: -3.6, y: -0.1, z: 0 }   // 13: N9-Methyl
    ];

    const positions = vertices.map(v => addAtom(v.t, v.x * scale, v.y * scale, v.z * scale).position);

    // Pyrimidinedione Ring bonds
    addBond(positions[0], positions[1]);
    addBond(positions[1], positions[2]);
    addBond(positions[2], positions[3]);
    addBond(positions[3], positions[4]);
    addBond(positions[4], positions[5]);
    addBond(positions[5], positions[0]);

    // Fused Imidazole Ring bonds
    addBond(positions[4], positions[6]);
    addBond(positions[6], positions[7]);
    addBond(positions[7], positions[8]);
    addBond(positions[8], positions[5]);

    // Carbonyl Oxygen attachments
    addBond(positions[1], positions[9]);
    addBond(positions[5], positions[10]);

    // Methyl Carbon attachments
    addBond(positions[0], positions[11]);
    addBond(positions[2], positions[12]);
    addBond(positions[8], positions[13]);

    camera.position.set(0, 0, 6.5);
  }

  activeGroup.add(modelGroup);
  controls.reset();
}

function clearActiveGroup() {
  if (activeGroup) {
    // Traverse and clean geometry and materials
    activeGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    activeGroup.clear();
  }
}
