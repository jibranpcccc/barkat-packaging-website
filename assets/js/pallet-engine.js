/**
 * Barkat Packaging — Interactive Pallet Loading & Container Logistics Engine
 */
(function(window) {
  'use strict';

  var PALLET_TYPES = {
    'gma': { name: 'Standard Industrial Pallet (48" × 40")', length: 48, width: 40, maxHeight: 72 },
    'euro': { name: 'Euro Pallet (1200 × 800 mm / 47.2" × 31.5")', length: 47.2, width: 31.5, maxHeight: 72 },
    'square': { name: 'Square Heavy Duty Pallet (48" × 48")', length: 48, width: 48, maxHeight: 78 }
  };

  function PalletEngine(canvasId, controls) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.box = { length: 16, width: 12, height: 10, weightKg: 15 };
    this.palletType = 'gma';
    this.controls = controls || {};

    this.init();
  }

  PalletEngine.prototype.init = function() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.calculateAndRender();
  };

  PalletEngine.prototype.resize = function() {
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 240;
    this.calculateAndRender();
  };

  PalletEngine.prototype.setBox = function(l, w, h, wt) {
    this.box.length = parseFloat(l) || 16;
    this.box.width = parseFloat(w) || 12;
    this.box.height = parseFloat(h) || 10;
    if (wt !== undefined) this.box.weightKg = parseFloat(wt) || 15;
    this.calculateAndRender();
  };

  PalletEngine.prototype.setPalletType = function(type) {
    if (PALLET_TYPES[type]) {
      this.palletType = type;
      this.calculateAndRender();
    }
  };

  PalletEngine.prototype.calculateAndRender = function() {
    var pal = PALLET_TYPES[this.palletType];
    var bL = this.box.length;
    var bW = this.box.width;
    var bH = this.box.height;

    // 1. Calculate Arrangement A (aligned)
    var colsA = Math.floor(pal.length / bL);
    var rowsA = Math.floor(pal.width / bW);
    var countA = colsA * rowsA;

    // 2. Calculate Arrangement B (rotated)
    var colsB = Math.floor(pal.length / bW);
    var rowsB = Math.floor(pal.width / bL);
    var countB = colsB * rowsB;

    var bestCols, bestRows, boxLenOnX, boxWidOnY, perLayer;

    if (countB > countA) {
      bestCols = colsB;
      bestRows = rowsB;
      boxLenOnX = bW;
      boxWidOnY = bL;
      perLayer = countB;
    } else {
      bestCols = colsA;
      bestRows = rowsA;
      boxLenOnX = bL;
      boxWidOnY = bW;
      perLayer = countA;
    }

    // Tiers
    var maxTiers = Math.max(1, Math.floor(pal.maxHeight / bH));
    var totalBoxes = perLayer * maxTiers;
    var usedArea = perLayer * (bL * bW);
    var palletArea = pal.length * pal.width;
    var areaEfficiency = Math.min(100, Math.round((usedArea / palletArea) * 100));

    var totalPalletWeightKg = totalBoxes * this.box.weightKg;
    var c20Count = totalBoxes * 10; // 10 pallets in 20ft
    var c40Count = totalBoxes * 21; // 21 pallets in 40ft HC

    // Render Canvas
    this.renderCanvas(pal, bestCols, bestRows, boxLenOnX, boxWidOnY);

    // Update UI Stats
    if (this.controls.perLayerEl) this.controls.perLayerEl.innerText = perLayer + ' boxes';
    if (this.controls.tiersEl) this.controls.tiersEl.innerText = maxTiers + ' tiers (height: ' + (maxTiers * bH) + '")';
    if (this.controls.totalEl) this.controls.totalEl.innerText = totalBoxes.toLocaleString() + ' boxes/pallet';
    if (this.controls.effEl) this.controls.effEl.innerText = areaEfficiency + '%';
    if (this.controls.c20El) this.controls.c20El.innerText = c20Count.toLocaleString() + ' boxes (10 pallets)';
    if (this.controls.c40El) this.controls.c40El.innerText = c40Count.toLocaleString() + ' boxes (21 pallets)';
  };

  PalletEngine.prototype.renderCanvas = function(pal, cols, rows, boxX, boxY) {
    var ctx = this.ctx;
    var cw = this.canvas.width;
    var ch = this.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Studio Background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, cw, ch);

    // Scaling to fit canvas with margin
    var margin = 30;
    var availW = cw - (margin * 2);
    var availH = ch - (margin * 2);
    var scale = Math.min(availW / pal.length, availH / pal.width);

    var palPixelW = pal.length * scale;
    var palPixelH = pal.width * scale;
    var startX = (cw - palPixelW) / 2;
    var startY = (ch - palPixelH) / 2;

    // Draw Wooden Pallet Base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(startX, startY, palPixelW, palPixelH, 6);
    ctx.fill();
    ctx.stroke();

    // Pallet Slats
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    var numSlats = 7;
    for (var s = 1; s < numSlats; s++) {
      var slatX = startX + (s * (palPixelW / numSlats));
      ctx.beginPath();
      ctx.moveTo(slatX, startY);
      ctx.lineTo(slatX, startY + palPixelH);
      ctx.stroke();
    }

    // Draw Boxes
    var boxPW = boxX * scale;
    var boxPH = boxY * scale;

    var totalBoxesW = cols * boxPW;
    var totalBoxesH = rows * boxPH;
    var offsetX = startX + (palPixelW - totalBoxesW) / 2;
    var offsetY = startY + (palPixelH - totalBoxesH) / 2;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var bx = offsetX + (c * boxPW);
        var by = offsetY + (r * boxPH);

        // Box shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(bx + 2, by + 2, boxPW - 3, boxPH - 3);

        // Kraft Box body
        ctx.fillStyle = '#b7834e';
        ctx.fillRect(bx + 1, by + 1, boxPW - 3, boxPH - 3);

        // Box border & flap lines
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 1, by + 1, boxPW - 3, boxPH - 3);

        // Top seam / tape
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 1, by + (boxPH / 2));
        ctx.lineTo(bx + boxPW - 2, by + (boxPH / 2));
        ctx.stroke();
      }
    }

    // Dimension labels on Pallet
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pal.length + '" L', startX + (palPixelW / 2), startY - 8);

    ctx.save();
    ctx.translate(startX - 10, startY + (palPixelH / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(pal.width + '" W', 0, 0);
    ctx.restore();
  };

  window.PalletEngine = PalletEngine;
})(window);
