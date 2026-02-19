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
let maxCucarachas = 60;
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

        // 🦵 PATAS (4)
        ctx.strokeStyle = "#1a0d0d";
        ctx.lineWidth = 3 * this.scale;

        const legOffsetY = 20 * this.scale;

        // Patas izquierda
        ctx.beginPath();
        ctx.moveTo(this.x - 30 * this.scale, this.y - legOffsetY);
        ctx.lineTo(this.x - 60 * this.scale, this.y - legOffsetY - 20 * this.scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - 30 * this.scale, this.y + legOffsetY);
        ctx.lineTo(this.x - 60 * this.scale, this.y + legOffsetY + 20 * this.scale);
        ctx.stroke();

        // Patas derecha
        ctx.beginPath();
        ctx.moveTo(this.x + 30 * this.scale, this.y - legOffsetY);
        ctx.lineTo(this.x + 60 * this.scale, this.y - legOffsetY - 20 * this.scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + 30 * this.scale, this.y + legOffsetY);
        ctx.lineTo(this.x + 60 * this.scale, this.y + legOffsetY + 20 * this.scale);
        ctx.stroke();

        // 🪳 Cuerpo
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 40 * this.scale, 70 * this.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 🪳 Cabeza
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
const taco = new Taco(canvas.width / 2, canvas.height - 50, 1);


class Cuca extends Cucaracha {
    constructor(x, y, scale) {
        super(x, y, scale);
        //this.radius = 40 * scale;
        this.bodyRadius = 40 * scale;
        this.headRadius = 25 * scale;

        this.speedY = velocidadBase + Math.random();
        this.speedX = (Math.random() - 0.5) * 2;
        this.muerta = false;
        this.alpha = 1;

        /* this.aplastada = false;
        this.animTiempo = 0; */
        this.aplastada = false;
        this.animFrame = 0;


    }

    update() {

        if (this.aplastada) {
            this.animFrame++;

            if (this.animFrame > 15) {
                kills++;
                document.getElementById("kills").textContent = kills;
                cucarachas.splice(cucarachas.indexOf(this), 1);
            }

            return;
        }

        this.y += this.speedY;
        this.x += this.speedX;

        if (this.x < 40 || this.x > canvas.width - 40) {
            this.speedX *= -1;
        }

        if (this.y + 40 > mesa.y) {
            vidas--;
            document.getElementById("vidas").textContent = vidas;
            cucarachas.splice(cucarachas.indexOf(this), 1);
            if (vidas <= 0) terminarJuego();
        }
    }



    draw(ctx) {

        ctx.save();

        // 🔥 APLASTADA
        if (this.aplastada) {

            // Mancha
            ctx.fillStyle = "darkred";
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + 10, 45 * this.scale, 15 * this.scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cuerpo aplastado
            ctx.translate(this.x, this.y);
            ctx.scale(1.4, 0.3);
            ctx.translate(-this.x, -this.y);

            this.bodyColor = "#8b0000";
        }

        // Rotación normal
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI);
        ctx.translate(-this.x, -this.y);

        super.draw(ctx);

        ctx.restore();
    }


}

// 🔥 Genera una cucaracha individual
function generarCucaracha() {
    let x = Math.random() * (canvas.width - 80) + 40;
    let y = -50;
    cucarachas.push(new Cuca(x, y, 0.2));
}

// 🔥 Control inteligente basado en tiempo
function controlarGeneracion() {
    let cantidadObjetivo = Math.min(
        3 + Math.floor(tiempo / 30) * 3,
        maxCucarachas
    );

    while (cucarachas.length < cantidadObjetivo) {
        generarCucaracha();
    }

    //velocidadBase = 0.6 + (cantidadObjetivo * 0.02);
    velocidadBase = 0.6 + (cantidadObjetivo * 0.025);
}

function detectarColisionesEntreCucarachas() {
    for (let i = 0; i < cucarachas.length; i++) {
        for (let j = i + 1; j < cucarachas.length; j++) {

            const c1 = cucarachas[i];
            const c2 = cucarachas[j];

            if (c1.muerta || c2.muerta) continue;

            // Centros del cuerpo
            const body1 = { x: c1.x, y: c1.y };
            const body2 = { x: c2.x, y: c2.y };

            // Centros de la cabeza (recuerda que están rotadas 180°)
            const headOffset = 80 * c1.scale;

            const head1 = { x: c1.x, y: c1.y + headOffset };
            const head2 = { x: c2.x, y: c2.y + headOffset };

            const zonas = [
                { a: body1, rA: c1.bodyRadius, b: body2, rB: c2.bodyRadius },
                { a: head1, rA: c1.headRadius, b: head2, rB: c2.headRadius },
                { a: body1, rA: c1.bodyRadius, b: head2, rB: c2.headRadius },
                { a: head1, rA: c1.headRadius, b: body2, rB: c2.bodyRadius }
            ];

            for (let zona of zonas) {
                const dx = zona.b.x - zona.a.x;
                const dy = zona.b.y - zona.a.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);
                const minDist = zona.rA + zona.rB;

                if (distancia < minDist) {

                    // Intercambiar velocidades
                    const tempX = c1.speedX;
                    const tempY = c1.speedY;

                    c1.speedX = c2.speedX;
                    c1.speedY = c2.speedY;

                    c2.speedX = tempX;
                    c2.speedY = tempY;

                    return; // evitar múltiples rebotes
                }
            }
        }
    }
}



function detectarHover(mouseX, mouseY) {
    cucarachas.forEach(c => {
        let dx = mouseX - c.x;
        let dy = mouseY - c.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
            c.bodyColor = "red";
        } else {
            c.bodyColor = "#4b2e2e";
        }
    });
}

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    detectarHover(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    cucarachas.forEach(c => {
        let dx = mx - c.x;
        let dy = my - c.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
            //c.muerta = true;
            //c.aplastada = true;
            if (!c.aplastada) {
                c.aplastada = true;
            }


        }
    });
});

function actualizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mesa.draw(ctx);
    taco.draw(ctx);

    controlarGeneracion();

    /* cucarachas.forEach(c=>{
      c.update();
      c.draw(ctx);
    }); */
    cucarachas.forEach(c => c.update());

    // 🔥 Detectar colisiones después de moverlas
    detectarColisionesEntreCucarachas();

    cucarachas.forEach(c => c.draw(ctx));


    if (juegoActivo) requestAnimationFrame(actualizar);
}

function iniciarJuego() {
    juegoActivo = true;
    document.getElementById("pantallaInicio").classList.add("d-none");
    document.getElementById("panelInfo").classList.remove("d-none");

    actualizar();

    setInterval(() => {
        if (juegoActivo) {
            tiempo++;
            document.getElementById("tiempo").textContent = tiempo;
        }
    }, 1000);
}

function terminarJuego() {
    juegoActivo = false;
    if (tiempo > record) {
        localStorage.setItem("recordTaco", tiempo);
    }
    document.getElementById("gameOver").classList.remove("d-none");
}

document.getElementById("btnStart").addEventListener("click", iniciarJuego);
