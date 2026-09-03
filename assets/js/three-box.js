/**
 * Barkat Packaging — Interactive 3D WebGL Box Visualizer
 * Powered by Three.js (r128) + OrbitControls
 */
(function(window) {
  'use strict';

  function BoxVisualizer(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('BoxVisualizer: #' + containerId + ' not found.');
      return;
    }

    this.options = Object.assign({
      length: 16,
      width: 12,
      height: 10,
      flapAngle: 0, // 0 = closed, 90 = open
      materialType: 'kraft', // 'kraft', 'virgin', 'white'
      brandText: 'BARKAT PACKAGING',
      subtext: '5-PLY MASTER CARTON • SITE HYDERABAD',
      autoRotate: false
    }, options || {});

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.boxGroup = null;
    this.dimensionGroup = null;
    this.flaps = { topFront: null, topBack: null, topLeft: null, topRight: null };

    this.init();
  }

  BoxVisualizer.prototype.init = function() {
    var width = this.container.clientWidth || 600;
    var height = this.container.clientHeight || 450;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b14);

    // Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(28, 22, 34);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
      this.controls.minDistance = 12;
      this.controls.maxDistance = 75;
      this.controls.autoRotate = this.options.autoRotate;
      this.controls.autoRotateSpeed = 1.2;
    }

    // Lights
    this.setupLighting();
    this.setupStudioFloor();

    // Procedural Textures
    this.textures = this.generateTextures();

    // Build Box Mesh
    this.buildBox();

    // Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  };

  BoxVisualizer.prototype.setupLighting = function() {
    var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xfff3e0, 1.2);
    keyLight.position.set(25, 35, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0x7090ff, 0.55);
    rimLight.position.set(-25, 20, -25);
    this.scene.add(rimLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(0, -20, 20);
    this.scene.add(fillLight);
  };

  BoxVisualizer.prototype.setupStudioFloor = function() {
    var shadowPlaneGeo = new THREE.PlaneGeometry(100, 100);
    var shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    var shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.05;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    var grid = new THREE.GridHelper(50, 25, 0xd97706, 0x1e293b);
    grid.position.y = -0.08;
    this.scene.add(grid);
  };

  BoxVisualizer.prototype.generateTextures = function() {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b7834e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(0,0,0,0.035)';
    for (var y = 0; y < 512; y += 6) {
      ctx.fillRect(0, y, 512, 3);
    }

    for (var i = 0; i < 2000; i++) {
      var rx = Math.random() * 512;
      var ry = Math.random() * 512;
      var rw = 1 + Math.random() * 3;
      var rh = 0.5 + Math.random() * 1.5;
      var alpha = 0.03 + Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(60,35,10,' + alpha + ')' : 'rgba(255,230,180,' + alpha + ')';
      ctx.fillRect(rx, ry, rw, rh);
    }

    var kraftTex = new THREE.CanvasTexture(canvas);
    kraftTex.wrapS = THREE.RepeatWrapping;
    kraftTex.wrapT = THREE.RepeatWrapping;

    var bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 256;
    bumpCanvas.height = 256;
    var bCtx = bumpCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 256, 256);
    bCtx.fillStyle = '#8e8e8e';
    for (var by = 0; by < 256; by += 8) {
      bCtx.fillRect(0, by, 256, 4);
    }
    var bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;

    return { kraft: kraftTex, bump: bumpTex };
  };

  BoxVisualizer.prototype.createFaceTexture = function(text, subtext) {
    var c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    var ctx = c.getContext('2d');

    ctx.fillStyle = this.options.materialType === 'white' ? '#e2e8f0' : '#b7834e';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(0,0,0,0.035)';
    for (var y = 0; y < 512; y += 8) {
      ctx.fillRect(0, y, 1024, 4);
    }

    var stampColor = this.options.materialType === 'white' ? '#090d16' : '#1e1b18';
    ctx.fillStyle = stampColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('↑↑   ☂   ♻', 512, 130);

    ctx.font = '900 52px system-ui, sans-serif';
    ctx.fillText(text || 'BARKAT PACKAGING', 512, 220);

    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(880, 250, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 16px monospace';
    ctx.fillText('BST: 22 kg/cm²', 880, 230);
    ctx.fillText('ECT: 55 lb/in', 880, 255);
    ctx.fillText('S.I.T.E. HYD', 880, 280);

    ctx.font = 'bold 24px monospace';
    ctx.fillText(subtext || '5-PLY MASTER CARTON • SITE HYDERABAD', 512, 305);

    ctx.font = '17px monospace';
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillText('PLOT F 9, S.I.T.E. AREA, HYDERABAD • PHONE: 0333 2622963', 512, 355);

    var bx = 380;
    for (var b = 0; b < 60; b++) {
      var bw = (b % 3 === 0) ? 5 : 2;
      ctx.fillStyle = stampColor;
      ctx.fillRect(bx, 400, bw, 45);
      bx += bw + 2;
    }

    return new THREE.CanvasTexture(c);
  };

  BoxVisualizer.prototype.getMaterial = function(isBranded) {
    var baseColor = 0xb7834e;
    var roughness = 0.88;

    if (this.options.materialType === 'virgin') baseColor = 0xc58f55;
    if (this.options.materialType === 'white') { baseColor = 0xe5e7eb; roughness = 0.75; }

    if (isBranded) {
      return new THREE.MeshStandardMaterial({
        map: this.createFaceTexture(this.options.brandText, this.options.subtext),
        bumpMap: this.textures.bump,
        bumpScale: 0.05,
        roughness: roughness,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
    }

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      map: this.textures.kraft,
      bumpMap: this.textures.bump,
      bumpScale: 0.06,
      roughness: roughness,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
  };

  BoxVisualizer.prototype.buildBox = function() {
    if (this.boxGroup) this.scene.remove(this.boxGroup);
    if (this.dimensionGroup) this.scene.remove(this.dimensionGroup);

    this.boxGroup = new THREE.Group();
    this.dimensionGroup = new THREE.Group();

    var L = this.options.length;
    var W = this.options.width;
    var H = this.options.height;
    var t = 0.15;

    var standardMat = this.getMaterial(false);
    var brandedMat = this.getMaterial(true);

    // Front Wall
    var front = new THREE.Mesh(new THREE.BoxGeometry(L, H, t), brandedMat);
    front.position.set(0, H / 2, W / 2);
    front.castShadow = true;
    front.receiveShadow = true;
    this.boxGroup.add(front);

    // Back Wall
    var back = new THREE.Mesh(new THREE.BoxGeometry(L, H, t), standardMat);
    back.position.set(0, H / 2, -W / 2);
    back.castShadow = true;
    back.receiveShadow = true;
    this.boxGroup.add(back);

    // Left Wall
    var left = new THREE.Mesh(new THREE.BoxGeometry(t, H, W), standardMat);
    left.position.set(-L / 2, H / 2, 0);
    left.castShadow = true;
    left.receiveShadow = true;
    this.boxGroup.add(left);

    // Right Wall
    var right = new THREE.Mesh(new THREE.BoxGeometry(t, H, W), standardMat);
    right.position.set(L / 2, H / 2, 0);
    right.castShadow = true;
    right.receiveShadow = true;
    this.boxGroup.add(right);

    // Bottom
    var bot = new THREE.Mesh(new THREE.BoxGeometry(L, t, W), standardMat);
    bot.position.set(0, t / 2, 0);
    bot.receiveShadow = true;
    this.boxGroup.add(bot);

    // Top Flaps (Hinges)
    var flapDepth = W / 2;

    var frontHinge = new THREE.Group();
    frontHinge.position.set(0, H, W / 2);
    var fg = new THREE.BoxGeometry(L, t, flapDepth);
    fg.translate(0, 0, -flapDepth / 2);
    frontHinge.add(new THREE.Mesh(fg, standardMat));
    this.boxGroup.add(frontHinge);
    this.flaps.topFront = frontHinge;

    var backHinge = new THREE.Group();
    backHinge.position.set(0, H, -W / 2);
    var bg = new THREE.BoxGeometry(L, t, flapDepth);
    bg.translate(0, 0, flapDepth / 2);
    backHinge.add(new THREE.Mesh(bg, standardMat));
    this.boxGroup.add(backHinge);
    this.flaps.topBack = backHinge;

    var leftHinge = new THREE.Group();
    leftHinge.position.set(-L / 2, H, 0);
    var lg = new THREE.BoxGeometry(flapDepth, t, W);
    lg.translate(flapDepth / 2, 0, 0);
    leftHinge.add(new THREE.Mesh(lg, standardMat));
    this.boxGroup.add(leftHinge);
    this.flaps.topLeft = leftHinge;

    var rightHinge = new THREE.Group();
    rightHinge.position.set(L / 2, H, 0);
    var rg = new THREE.BoxGeometry(flapDepth, t, W);
    rg.translate(-flapDepth / 2, 0, 0);
    rightHinge.add(new THREE.Mesh(rg, standardMat));
    this.boxGroup.add(rightHinge);
    this.flaps.topRight = rightHinge;

    this.updateFlapAngle(this.options.flapAngle);
    this.buildDimensions(L, W, H);

    this.scene.add(this.boxGroup);
    this.scene.add(this.dimensionGroup);
  };

  BoxVisualizer.prototype.buildDimensions = function(L, W, H) {
    var mat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    var lGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-L / 2, 0.2, W / 2 + 1.2),
      new THREE.Vector3(L / 2, 0.2, W / 2 + 1.2)
    ]);
    this.dimensionGroup.add(new THREE.Line(lGeo, mat));

    var wGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(L / 2 + 1.2, 0.2, -W / 2),
      new THREE.Vector3(L / 2 + 1.2, 0.2, W / 2)
    ]);
    this.dimensionGroup.add(new THREE.Line(wGeo, mat));

    var hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(L / 2 + 1.2, 0, W / 2 + 1.2),
      new THREE.Vector3(L / 2 + 1.2, H, W / 2 + 1.2)
    ]);
    this.dimensionGroup.add(new THREE.Line(hGeo, mat));
  };

  BoxVisualizer.prototype.updateDimensions = function(L, W, H) {
    this.options.length = parseFloat(L) || 16;
    this.options.width = parseFloat(W) || 12;
    this.options.height = parseFloat(H) || 10;
    this.buildBox();
  };

  BoxVisualizer.prototype.updateFlapAngle = function(angleDeg) {
    this.options.flapAngle = parseFloat(angleDeg);
    var rad = (this.options.flapAngle * Math.PI) / 180;
    if (this.flaps.topFront) this.flaps.topFront.rotation.x = rad;
    if (this.flaps.topBack) this.flaps.topBack.rotation.x = -rad;
    if (this.flaps.topLeft) this.flaps.topLeft.rotation.z = -rad;
    if (this.flaps.topRight) this.flaps.topRight.rotation.z = rad;
  };

  BoxVisualizer.prototype.setMaterialType = function(type) {
    this.options.materialType = type;
    this.buildBox();
  };

  BoxVisualizer.prototype.setBrandText = function(text, subtext) {
    this.options.brandText = text;
    this.options.subtext = subtext;
    this.buildBox();
  };

  BoxVisualizer.prototype.toggleAutoRotate = function(enable) {
    if (this.controls) {
      this.controls.autoRotate = enable !== undefined ? enable : !this.controls.autoRotate;
      return this.controls.autoRotate;
    }
    return false;
  };

  BoxVisualizer.prototype.resetCamera = function() {
    if (this.controls) {
      this.camera.position.set(28, 22, 34);
      this.controls.target.set(0, this.options.height / 2, 0);
      this.controls.update();
    }
  };

  BoxVisualizer.prototype.onWindowResize = function() {
    if (!this.container || !this.renderer || !this.camera) return;
    var w = this.container.clientWidth;
    var h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  BoxVisualizer.prototype.animate = function() {
    requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  window.BoxVisualizer = BoxVisualizer;
})(window);
