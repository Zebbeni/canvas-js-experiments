var canvas = document.getElementById('canvas');
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete
var ctx = canvas.getContext('2d');
var raf;

window.onresize = function () {
  canvas.width = document.body.clientWidth; //document.width is obsolete
  canvas.height = document.body.clientHeight; //document.height is obsolete
}

var MIN_DROPLETS_PER_SPOT = 10;
var MAX_DROPLETS_PER_SPOT = 20;
var SPOT_TIME_TO_ANIMATE = 100;

var VBD_K = 1.5;
var VBH_K = 3.0;
var VDH_K = 0.6;

var drops = [];

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }
  times(k) {
    return new Vector(this.x * k, this.y * k);
  }
  perpendicular() {
    return new Vector(-1 * this.y, this.x);
  }
  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
  unit() {
    var magnitude = this.magnitude();
    if (magnitude != 0) {
      return new Vector(this.x / magnitude, this.y / magnitude);
    } else {
      return new Vector(0, 0);
    }
  }
}

class Droplet {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.85;
    this.vy *= 0.85;
  }
}

class Drop {
  constructor(x, y) {
    this.age = 1.0;
    this.x = x;
    this.y = y;
    this.initializeDroplets();
  }
  initializeDroplets() {
    this.droplets = [];
    var angle = 0.0;
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    var alpha = 0.8;
    this.color = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    var magnitude = 50 + Math.random() * 5;
    var numDroplets = MIN_DROPLETS_PER_SPOT + Math.round(Math.random() * (MAX_DROPLETS_PER_SPOT - MIN_DROPLETS_PER_SPOT));
    var angleInc = Math.PI * 2.0 / numDroplets;
    for (var i = 0; i < numDroplets; i++) {
      var dropletMagnitude = magnitude * 0.5 + (Math.random() * magnitude * 0.5);
      var vx = Math.cos(angle) * dropletMagnitude;
      var vy = Math.sin(angle) * dropletMagnitude;
      var droplet = new Droplet(this.x, this.y, vx, vy);
      this.droplets.push(droplet);
      angle += angleInc;
    }
  }
  draw() {
    var numDroplets = this.droplets.length;
    ctx.beginPath();
    // var gradient = ctx.createRadialGradient(this.x, this.y, 20 * this.age, this.x, this.y, 0);
    // gradient.addColorStop(0, 'rgba(255,255,255,0.0');
    // gradient.addColorStop(1, this.color);
    // ctx.fillStyle = gradient;
    ctx.fillStyle = this.color;
    ctx.moveTo(this.droplets[0].x, this.droplets[0].y);
    var d1, d2, dh, b1, b2, b3, b4, vd1, vd2, vdh, vb1, vb2, vb3, vb4, vbh_k, vbd_k, d_vx_vy;
    var droplet1, droplet2;
    var c = new Vector(this.x, this.y);
    for (var d1i = 0; d1i < numDroplets; d1i++) {
      var d2i = d1i + 1 < numDroplets ? d1i + 1 : 0;
      droplet1 = this.droplets[d1i];
      droplet2 = this.droplets[d2i];
      d1 = new Vector(droplet1.x, droplet1.y);
      d2 = new Vector(droplet2.x, droplet2.y);
      vd1 = new Vector(d1.x - c.x, d1.y - c.y);
      vd2 = new Vector(d2.x - c.x, d2.y - c.y);
      vbd_k = VBD_K * vd1.magnitude() / numDroplets;
      vb1 = vd1.perpendicular().unit().times(vbd_k);
      b1 = d1.add(vb1);
      d_vx_vy = new Vector((droplet1.vx + droplet2.vx) / 2.0, (droplet1.vy + droplet2.vy) / 2.0);
      vdh = vd1.add(vd2).add(d_vx_vy).times(0.5).times(VDH_K);
      dh = c.add(vdh);
      vbh_k = VBH_K * vdh.magnitude() / numDroplets;
      vb2 = vdh.perpendicular().unit().times(-1.0 * vbh_k);
      b2 = dh.add(vb2);
      vb3 = vdh.perpendicular().unit().times(vbh_k);
      b3 = dh.add(vb3);
      vb4 = vd2.perpendicular().unit().times(-1.0 * vbd_k);
      b4 = d2.add(vb4);
      ctx.bezierCurveTo(b1.x, b1.y, b2.x, b2.y, dh.x, dh.y);
      ctx.bezierCurveTo(b3.x, b3.y, b4.x, b4.y, d2.x, d2.y);
    }
    for (var i = 0; i < numDroplets; i++) {
      this.droplets[i].update();
    }
    ctx.fill();
    ctx.closePath();
    ctx.save();

    this.update();
  }
  update() {
    this.age += 1;
  }
}

function draw() {
  var numSpots = drops.length;
  for (var i = 0; i < numSpots; i++) {
    if (drops[i].age > SPOT_TIME_TO_ANIMATE) {
      drops.splice(i, 1);
      i--;
      numSpots--;
    } else {
      drops[i].draw();
    }
  }
  // draw fade rectangle over everything
  // ctx.beginPath();
  // ctx.fillStyle = "rgba(255,255,255,0.005)";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.closePath();
  raf = window.requestAnimationFrame(draw);
}

canvas.addEventListener('mouseup', function (e) {
  drops.push(new Drop(e.x, e.y));
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();
  raf = window.requestAnimationFrame(draw);
});