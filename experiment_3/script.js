var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var raf;

var NUM_DROPLETS_PER_SPOT = 500;
var SPOT_TIME_TO_ANIMATE = 200;
var ANGLE_INC = Math.PI * 2 / NUM_DROPLETS_PER_SPOT;

var spots = [];

class Droplet {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
  }
  draw() {
    this.update();
    var radius = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Spot {
  constructor(x, y) {
    this.age = 0;
    this.x = x;
    this.y = y;
    this.initializeDroplets();
  }
  initializeDroplets() {
    this.droplets = [];
    var angle = 0.0;
    var color = "rgba(0, 0, 0, 1.0)";
    var magnitude = Math.random() * 3;
    for (var i = 0; i < NUM_DROPLETS_PER_SPOT; i++) {
      magnitude = Math.max(1, Math.min(2, magnitude + -0.5 + Math.random()));
      var vx = Math.cos(angle) * magnitude;
      var vy = Math.sin(angle) * magnitude;
      var droplet = new Droplet(this.x, this.y, vx, vy, color);
      this.droplets.push(droplet);
      angle += ANGLE_INC;
    }
  }
  update() {
    this.age += 1;
  }
  draw() {
    this.update();
    var numDroplets = this.droplets.length;
    for (var i = 0; i < numDroplets; i++) {
        this.droplets[i].update();
        this.droplets[i].draw();
    }
  }
}

function draw() {
  // draw fade rectangle over everything
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.fillRect(0,0, canvas.width, canvas.height);
  
  var numSpots = spots.length;
  for (var i = 0; i < numSpots; i++) {
    spots[i].draw();
  }
  for (var i = 0; i < spots.length; i++) {
    if (spots[i].age > SPOT_TIME_TO_ANIMATE) {
        spots.splice(i, 1);
    }
  }
  if (spots.length > 0) {
    raf = window.requestAnimationFrame(draw);
  }
}

canvas.addEventListener('mouseup', function(e) {
  spots.push(new Spot(e.x, e.y));
  raf = window.requestAnimationFrame(draw);
});