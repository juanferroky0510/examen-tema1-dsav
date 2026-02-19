const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 0.4;
canvas.height = window.innerHeight * 0.8;
const ctx = canvas.getContext("2d");

class Cucaracha {
  constructor(x, y, scale = 1) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.bodyColor = "#4b2e2e";
    this.antennaColor = "#2b1a1a";
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.bodyColor;

    // Cuerpo
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 40 * this.scale, 70 * this.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 80 * this.scale, 25 * this.scale, 25 * this.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antenas
    ctx.strokeStyle = this.antennaColor;
    ctx.lineWidth = 2 * this.scale;

    ctx.beginPath();
    ctx.moveTo(this.x - 10 * this.scale, this.y - 95 * this.scale);
    ctx.lineTo(this.x - 40 * this.scale, this.y - 130 * this.scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.x + 10 * this.scale, this.y - 95 * this.scale);
    ctx.lineTo(this.x + 40 * this.scale, this.y - 130 * this.scale);
    ctx.stroke();

    ctx.restore();
  }
}


const cucaracha = new Cucaracha(canvas.width / 2, canvas.height / 2, 0.2); // más pequeña
cucaracha.draw(ctx);
