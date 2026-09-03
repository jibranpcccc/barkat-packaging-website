/**
 * Barkat Packaging — Interactive Flute & Compression Strength Simulator
 */
(function(window) {
  'use strict';

  var FLUTE_DATA = {
    'b-flute': {
      name: 'B-Flute (Single Wall)',
      height: 3.0,
      pitch: 6.5,
      flutesPerFoot: 48,
      takeup: 1.32,
      baseEct: 32,
      baseBst: 10.5,
      maxLoadKg: 280,
      description: 'Superior puncture resistance & flat crush strength. Ideal for canned goods, retail mailers, and e-commerce cartons.'
    },
    'c-flute': {
      name: 'C-Flute (Single Wall)',
      height: 4.0,
      pitch: 8.0,
      flutesPerFoot: 39,
      takeup: 1.42,
      baseEct: 38,
      baseBst: 12.0,
      maxLoadKg: 360,
      description: 'Maximum vertical column stacking strength. The global standard for general industrial shipping and FMCG master boxes.'
    },
    'e-flute': {
      name: 'E-Flute (Micro Flute)',
      height: 1.5,
      pitch: 3.5,
      flutesPerFoot: 92,
      takeup: 1.24,
      baseEct: 26,
      baseBst: 8.0,
      maxLoadKg: 160,
      description: 'High-density micro-fluting. Prevents fluting washboarding on full-color printed retail cartons and pharmaceutical folding boxes.'
    },
    'bc-flute': {
      name: 'BC-Flute (Heavy 5-Ply Double Wall)',
      height: 7.0,
      pitch: 7.2,
      flutesPerFoot: 87,
      takeup: 2.74,
      baseEct: 55,
      baseBst: 22.0,
      maxLoadKg: 650,
      description: 'Double-wall powerhouse combining B-flute puncture resistance with C-flute column stacking. Replaces wooden crates for export shipments.'
    }
  };

  function FluteSimulator(canvasId, controls) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.currentFlute = 'bc-flute';
    this.appliedLoadKg = 120;
    this.controls = controls || {};

    this.init();
  }

  FluteSimulator.prototype.init = function() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.render();
  };

  FluteSimulator.prototype.resize = function() {
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 200;
    this.render();
  };

  FluteSimulator.prototype.setFlute = function(type) {
    if (FLUTE_DATA[type]) {
      this.currentFlute = type;
      this.render();
    }
  };

  FluteSimulator.prototype.setLoad = function(kg) {
    this.appliedLoadKg = parseFloat(kg) || 0;
    this.render();
  };

  FluteSimulator.prototype.render = function() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var data = FLUTE_DATA[this.currentFlute];

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    var loadRatio = Math.min(this.appliedLoadKg / data.maxLoadKg, 1.4);
    var compressionFactor = 1 - (loadRatio * 0.12);

    var linerHeight = 8;
    var startY = 42;
    var isDoubleWall = this.currentFlute === 'bc-flute';

    ctx.save();

    if (!isDoubleWall) {
      var waveH = 90 * compressionFactor;
      var topLinerY = startY;
      var botLinerY = topLinerY + waveH + linerHeight;

      // Top Liner
      ctx.fillStyle = '#d97706';
      ctx.fillRect(20, topLinerY, w - 40, linerHeight);

      // Fluting Sine Wave
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      var wavelength = data.pitch * 6;
      for (var px = 20; px <= w - 20; px++) {
        var angle = ((px - 20) / wavelength) * Math.PI * 2;
        var py = topLinerY + linerHeight + (waveH / 2) + (Math.sin(angle) * (waveH / 2));
        if (px === 20) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Bottom Liner
      ctx.fillStyle = '#b45309';
      ctx.fillRect(20, botLinerY, w - 40, linerHeight);

    } else {
      var bWaveH = 45 * compressionFactor;
      var cWaveH = 65 * compressionFactor;

      var topY = startY;
      var midY = topY + bWaveH + linerHeight;
      var botY = midY + cWaveH + linerHeight;

      // 1. Top Liner
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(20, topY, w - 40, 6);

      // 2. B-Flute Wave
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      var bWaveLength = 32;
      for (var bx = 20; bx <= w - 20; bx++) {
        var bAngle = ((bx - 20) / bWaveLength) * Math.PI * 2;
        var bpy = topY + 6 + (bWaveH / 2) + (Math.sin(bAngle) * (bWaveH / 2));
        if (bx === 20) ctx.moveTo(bx, bpy);
        else ctx.lineTo(bx, bpy);
      }
      ctx.stroke();

      // 3. Middle Liner
      ctx.fillStyle = '#d97706';
      ctx.fillRect(20, midY, w - 40, 6);

      // 4. C-Flute Wave
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      var cWaveLength = 48;
      for (var cx = 20; cx <= w - 20; cx++) {
        var cAngle = ((cx - 20) / cWaveLength) * Math.PI * 2;
        var cpy = midY + 6 + (cWaveH / 2) + (Math.sin(cAngle) * (cWaveH / 2));
        if (cx === 20) ctx.moveTo(cx, cpy);
        else ctx.lineTo(cx, cpy);
      }
      ctx.stroke();

      // 5. Bottom Liner
      ctx.fillStyle = '#92400e';
      ctx.fillRect(20, botY, w - 40, 6);
    }

    ctx.restore();

    // Render Stacking Load Pressure Arrows
    if (this.appliedLoadKg > 0) {
      ctx.fillStyle = loadRatio > 1 ? '#ef4444' : '#10b981';
      var numArrows = Math.min(Math.floor(w / 120), 6);
      for (var a = 0; a < numArrows; a++) {
        var ax = 40 + a * ((w - 80) / (numArrows - 1 || 1));
        ctx.beginPath();
        ctx.moveTo(ax, 8);
        ctx.lineTo(ax, 30);
        ctx.lineTo(ax - 5, 24);
        ctx.moveTo(ax, 30);
        ctx.lineTo(ax + 5, 24);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
      }
    }

    this.updateStats(data, loadRatio);
  };

  FluteSimulator.prototype.updateStats = function(data, loadRatio) {
    if (this.controls.nameEl) this.controls.nameEl.innerText = data.name;
    if (this.controls.heightEl) this.controls.heightEl.innerText = data.height + ' mm';
    if (this.controls.flutesEl) this.controls.flutesEl.innerText = data.flutesPerFoot + ' flutes/ft';
    if (this.controls.ectEl) this.controls.ectEl.innerText = data.baseEct + ' lb/in (' + (data.baseEct * 0.175).toFixed(1) + ' kN/m)';
    if (this.controls.bstEl) this.controls.bstEl.innerText = data.baseBst + ' kg/cm² (~' + Math.round(data.baseBst * 14.22) + ' PSI)';
    if (this.controls.descEl) this.controls.descEl.innerText = data.description;

    if (this.controls.statusEl) {
      if (loadRatio < 0.65) {
        this.controls.statusEl.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> High Safety Factor: Safe for 8+ Pallet Tiers</span>';
      } else if (loadRatio <= 1.0) {
        this.controls.statusEl.innerHTML = '<span class="text-amber-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> Nominal Load: Safe for 5–6 Pallet Tiers</span>';
      } else {
        this.controls.statusEl.innerHTML = '<span class="text-red-400 font-bold"><i class="fa-solid fa-radiation"></i> Critical Stacking Load: Recommend Upgrading to 7-Ply</span>';
      }
    }
  };

  window.FluteSimulator = FluteSimulator;
})(window);
