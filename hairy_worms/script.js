var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var raf;

var MAX_DROPLETS = 1000;

var droplets = [];

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
  }
  update() {
    this.a -= 0.001;
    this.radius *= 0.995;
    this.x += this.vx;
    this.y += this.vy;
    this.vx = this.vx * (Math.random() * 0.05 + 0.95) + (Math.random() * 0.2 - 0.1);
    this.vy = this.vy * (Math.random() * 0.05 + 0.95) + (Math.random() * 0.2 - 0.1);
    this.color = "rgba(" + Math.floor(this.r) + "," + Math.floor(this.g) + "," + Math.floor(this.b) + "," + this.a + ")";
    if (droplets.length < MAX_DROPLETS && Math.random() < this.a) {
      var r = Math.floor(Math.max(0, Math.min(255, this.r + Math.random() * 2 - 1)));
      var g = Math.floor(Math.max(0, Math.min(255, this.g + Math.random() * 2 - 1)));
      var b = Math.floor(Math.max(0, Math.min(255, this.b + Math.random() * 2 - 1)));
      droplets.push(new Droplet(this.x, this.y, this.vx, this.vy, this.radius * 0.7, r, g, b, this.a));
    }
  }
  draw() {
    this.update();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function draw() {
  // ctx.fillStyle = "rgba(255, 255, 255, 0"
  // ctx.fillRect(0,0, canvas.width, canvas.height);
  
  var numDroplets = droplets.length;
  for (var i = 0; i < numDroplets; i++) {
    droplets[i].draw();
  }
  for (var i = 0; i < numDroplets; i++) {
    if (droplets[i].a <= 0.05) {
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
  var radius = Math.random() * 50;
  var speed = radius / 2.0;
  var r = Math.random() * 255;
  var g = Math.random() * 255;
  var b = Math.random() * 255;
  console.log("creating droplet, r: %d, g: %d, b: %d", r, g, b);
  droplets.push(new Droplet(e.x, e.y, Math.random() * speed - (speed / 2), Math.random() * speed - (speed / 2), radius, r, g, b, 1.0));
  raf = window.requestAnimationFrame(draw);
});