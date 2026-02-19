const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 0.4;
canvas.height = window.innerHeight * 0.7;
const ctx = canvas.getContext("2d");

let juegoActivo = false;
let vidas = 3;
let tiempo = 0;
let record = localStorage.getItem("recordTaco") || 0;
let kills = 0;

let cucarachas = [];
let maxCucarachas = 50;
//let grupoActual = 2;
let velocidadBase = 0.5;



document.getElementById("record").textContent = record;

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


// Clase Mesa (vista desde arriba)
class Mesa {
  constructor(x, y, width, height, color = "#8B4513") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx) {
    ctx.save();

    // Superficie de la mesa
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Borde decorativo
    ctx.strokeStyle = "#5C3317";
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.restore();
  }
}

// Clase Taco (sin plato)
class Taco {
  constructor(x, y, scale = 1) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  draw(ctx) {
    ctx.save();

    // Tortilla doblada (semicírculo amarillo)
    ctx.fillStyle = "#FFD966";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 40 * this.scale, 0, Math.PI, false); // semicírculo inferior
    ctx.fill();

    // Verdura (líneas verdes sobre la curva del semicírculo)
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 3;

    for (let i = -30; i <= 30; i += 10) {
      ctx.beginPath();
      ctx.moveTo(this.x + i * this.scale, this.y - 2 * this.scale);
      ctx.lineTo(this.x + i * this.scale, this.y - 15 * this.scale);
      ctx.stroke();
    }

    ctx.restore();
  }
}
const mesa = new Mesa(0, canvas.height - 80, canvas.width, 150);
const taco = new Taco(canvas.width/2, canvas.height - 50, 1);


class Cuca extends Cucaracha {
  constructor(x, y, scale) {
    super(x,y,scale);
    this.radius = 40 * scale;
    this.speedY = velocidadBase + Math.random();
    this.speedX = (Math.random() - 0.5) * 2;
    this.muerta = false;
    this.alpha = 1;
  }

  update() {
    if(this.muerta){
      this.alpha -= 0.03;
      if(this.alpha <= 0){
        kills++;
        document.getElementById("kills").textContent = kills;
        cucarachas.splice(cucarachas.indexOf(this),1);
      }
      return;
    }

    this.y += this.speedY;
    this.x += this.speedX;

    // Rebote lateral
    if(this.x < 40 || this.x > canvas.width - 40){
      this.speedX *= -1;
    }

    // Colisión con mesa
    if(this.y + 40 > mesa.y){
      vidas--;
      document.getElementById("vidas").textContent = vidas;
      cucarachas.splice(cucarachas.indexOf(this),1);
      if(vidas <= 0) terminarJuego();
    }
  }

  draw(ctx){
    ctx.save();

    ctx.globalAlpha = this.alpha;

    // 🔥 ROTAMOS 180° para que mire hacia abajo
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI);
    ctx.translate(-this.x, -this.y);

    super.draw(ctx);

    ctx.restore();
  }
}

// 🔥 Genera una cucaracha individual
function generarCucaracha(){
  let x = Math.random() * (canvas.width-80) + 40;
  let y = -50;
  cucarachas.push(new Cuca(x,y,0.2));
}

// 🔥 Control inteligente basado en tiempo
function controlarGeneracion(){
  let cantidadObjetivo = Math.min(
    2 + Math.floor(tiempo / 30) * 2,
    maxCucarachas
  );

  while(cucarachas.length < cantidadObjetivo){
    generarCucaracha();
  }

  velocidadBase = 0.6 + (cantidadObjetivo * 0.02);
}

function detectarHover(mouseX, mouseY){
  cucarachas.forEach(c=>{
    let dx = mouseX - c.x;
    let dy = mouseY - c.y;
    let dist = Math.sqrt(dx*dx+dy*dy);
    if(dist < 40){
      c.bodyColor = "red";
    }else{
      c.bodyColor = "#4b2e2e";
    }
  });
}

canvas.addEventListener("mousemove", e=>{
  const rect = canvas.getBoundingClientRect();
  detectarHover(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("click", e=>{
  const rect = canvas.getBoundingClientRect();
  let mx = e.clientX - rect.left;
  let my = e.clientY - rect.top;

  cucarachas.forEach(c=>{
    let dx = mx - c.x;
    let dy = my - c.y;
    let dist = Math.sqrt(dx*dx+dy*dy);
    if(dist < 40){
      c.muerta = true;
    }
  });
});

function actualizar(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  mesa.draw(ctx);
  taco.draw(ctx);

  controlarGeneracion();

  cucarachas.forEach(c=>{
    c.update();
    c.draw(ctx);
  });

  if(juegoActivo) requestAnimationFrame(actualizar);
}

function iniciarJuego(){
  juegoActivo = true;
  document.getElementById("pantallaInicio").classList.add("d-none");
  document.getElementById("panelInfo").classList.remove("d-none");

  actualizar();

  setInterval(()=>{
    if(juegoActivo){
      tiempo++;
      document.getElementById("tiempo").textContent = tiempo;
    }
  },1000);
}

function terminarJuego(){
  juegoActivo = false;
  if(tiempo > record){
    localStorage.setItem("recordTaco", tiempo);
  }
  document.getElementById("gameOver").classList.remove("d-none");
}

document.getElementById("btnStart").addEventListener("click", iniciarJuego);
