var canvas = document.getElementById('canvas');
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete
var ctx = canvas.getContext('2d');
var raf;

window.onresize = function () {
  initialize();
}

window.onload = function() {
  initialize();
}

var DROPLETS_PER_SPOT = 100;
var FORCE_SPACING = 20;
var MIN_FORCE = 0.2;
var MAX_FORCE = 0.8;

var forces = [];
var droplets = [];

function initialize() {
  canvas.width = document.body.clientWidth; //document.width is obsolete
  canvas.height = document.body.clientHeight; //document.height is obsolete
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, 255)";
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.closePath();
  initializeForces();
}

function initializeForces() {
  forces = [];
  for (var x = 0; x < document.body.clientWidth; x += FORCE_SPACING) {
    for (var y = 0; y < document.body.clientWidth; y += FORCE_SPACING) {
      var magnitude = MIN_FORCE + Math.random() * (MAX_FORCE - MIN_FORCE);
      var angle = Math.random() * 2.0 * Math.PI;
      forces.push(new Force(x, y, Math.cos(angle) * magnitude, Math.sin(angle) * magnitude));
    }
  }
}

class Force {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

class Bleeder {
  constructor(x, y, radius, r, g, b, a) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  update() {
    this.radius++;
    this.a -= 0.05;
  }
  draw() {
    ctx.beginPath();
    var colorInside = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    var colorOutside = "rgba(" + this.r + "," + this.g + "," + this.b + "," + 0.0 + ")";
    var gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, 0);
    gradient.addColorStop(0, colorOutside);
    gradient.addColorStop(1, colorInside);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
    this.update();
  }
}

class Droplet {
  constructor(x, y, vx, vy, radius, r, g, b, a) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.bleeders = [];
  }
  update() {
    this.a *= 0.98;
    this.radius *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    var sumVx = 0.0;
    var sumVy = 0.0;
    for (var f = 0; f < forces.length; f++) {
      var force = forces[f];
      var dist = Math.sqrt(Math.pow(force.x - this.x, 2) + Math.pow(force.y - this.y, 2));
      sumVx += force.vx / dist;
      sumVy += force.vy / dist;
    }
    this.vx = this.vx * 0.9 + sumVx;
    this.vy = this.vy * 0.9 + sumVy;
    var speed = this.radius * 0.5;
    var magnitude = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    // if (speed > max_speed) {
      this.vx *= speed / magnitude;
      this.vy *= speed / magnitude;
    // }
    // if (this.a > 0.5) {
      this.bleeders.push(new Bleeder(this.x, this.y, this.radius, this.r, this.g, this.b, this.a));
    // }
  }
  draw() {
    var numBleeders = this.bleeders.length;
    for (var b = 0; b < numBleeders; b++) {
      if (this.bleeders[b].a < 0.1) {
        this.bleeders.splice(b, 1);
        b--;
        numBleeders--;
      } else {
        this.bleeders[b].draw();
      }
    }
    ctx.beginPath();
    var colorInside = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    var colorOutside = "rgba(" + this.r + "," + this.g + "," + this.b + "," + 0.0 + ")";
    var gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, 0);
    gradient.addColorStop(0, colorOutside);
    gradient.addColorStop(1, colorInside);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
    this.update();
  }
}

function draw() {
  // ctx.beginPath();
  // ctx.fillStyle = "rgba(0, 0, 0, 0.004)";
  // ctx.fillRect(0,0, canvas.width, canvas.height);
  // ctx.closePath();

  var numDroplets = droplets.length;
  for (var i = 0; i < numDroplets; i++) {
    droplets[i].draw();
  }
  for (var i = 0; i < numDroplets; i++) {
    if (droplets[i].a <= 0.04) {
      droplets.splice(i, 1);
      numDroplets--;
      i--;
    }
  }
  if (droplets.length > 0) {
    raf = window.requestAnimationFrame(draw);
  }
}

canvas.addEventListener('mouseup', function(e) {
  var r = Math.round(Math.random() * 255);
  var g = Math.round(Math.random() * 255);
  var b = Math.round(Math.random() * 255);
  var size = 0.5 + Math.random() * 1.0;
  var mainAngle = Math.random() * 2.0 * Math.PI;
  for (var d = 0; d < DROPLETS_PER_SPOT; d++) {
    var angle = mainAngle - 0.5 + Math.random() * 0.25;
    var magnitude = Math.random() * size;
    var vx = Math.cos(angle) * magnitude;
    var vy = Math.sin(angle) * magnitude;
    var x = e.x + vx;
    var y = e.y + vy;
    droplets.push(new Droplet(x, y, vx * 10.0, vy * 10.0, Math.random() * 10.0 * size, r, g, b, 1.0));
  }
  raf = window.requestAnimationFrame(draw);
});