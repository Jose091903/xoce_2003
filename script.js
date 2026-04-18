document.addEventListener('DOMContentLoaded', () => {
    const interactionZone = document.getElementById('interaction-zone');
    const music = document.getElementById('bg-music');
    let isPlaying = false;

    // Capas Parallax
    const layers = {
        far: { el: document.getElementById('stars-far'), factor: 0.02 },
        mid: { el: document.getElementById('stars-mid'), factor: 0.06 },
        near: { el: document.getElementById('stars-near'), factor: 0.15 }
    };

    // Generar estrellas dinámicas en 3 capas de profundidad
    const numStars = window.innerWidth < 600 ? 100 : 250; 
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2.5 + 0.5; // Tamaños variados
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 2;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;

        // Distribuimos equitativamente entre las capas según su índice 
        if (i % 3 === 0) layers.far.el.appendChild(star);
        else if (i % 3 === 1) layers.mid.el.appendChild(star);
        else layers.near.el.appendChild(star);
    }

    // --- Control de Parallax ---
    function applyParallax(xOffset, yOffset) {
        layers.far.el.style.transform = `translate(${xOffset * layers.far.factor}px, ${yOffset * layers.far.factor}px)`;
        layers.mid.el.style.transform = `translate(${xOffset * layers.mid.factor}px, ${yOffset * layers.mid.factor}px)`;
        layers.near.el.style.transform = `translate(${xOffset * layers.near.factor}px, ${yOffset * layers.near.factor}px)`;
    }

    // 1. Mouse para Desktop
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX - window.innerWidth / 2;
        const y = e.clientY - window.innerHeight / 2;
        applyParallax(x, y);
    });

    // 2. Giroscopio para Celulares
    window.addEventListener('deviceorientation', (e) => {
        // e.gamma = inclinación derecha-izq (suele estar entre -90 y 90)
        // e.beta = inclinación adelante-atrás
        if (e.gamma !== null && e.beta !== null) {
            // Amplificamos y calibramos la postura (beta en 45 suele ser la posición normal de tener el celular)
            const x = e.gamma * 15; 
            const y = (e.beta - 45) * 15; 
            applyParallax(x, y);
        }
    });

    // --- Sistema dinámico de asteroides / ráfagas de luz ---
    function spawnAsteroid() {
        const asteroid = document.createElement('div');
        asteroid.classList.add('asteroid');

        // Aparecen arriba o a los lados
        const startY = Math.random() * (window.innerHeight * 0.8);
        const startX = Math.random() > 0.5 ? -100 : window.innerWidth + 100; 
        
        // El ángulo cambia dependiento de donde sale
        const isFromLeft = startX < 0;
        const baseAngle = isFromLeft ? 15 : 165; // Va hacia la derecha (15 deg) o hacia la izquierda (165 deg)
        const angle = baseAngle + (Math.random() * 20 - 10);

        asteroid.style.left = `${startX}px`;
        asteroid.style.top = `${startY}px`;
        
        // Escala aleatoria
        const scale = Math.random() * 0.8 + 0.4;
        const duration = Math.random() * 1000 + 1500; // entre 1.5s y 2.5s
        
        document.body.appendChild(asteroid);

        // API de Animaciones de JS para dispararlo a través de la pantalla
        const endX = isFromLeft ? window.innerWidth + 200 : -200;
        
        const animation = asteroid.animate([
            { transform: `rotate(${angle}deg) translateX(0px) scale(${scale})`, opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 1, offset: 0.8 },
            { transform: `rotate(${angle}deg) translateX(${isFromLeft ? 1500 : -1500}px) scale(${scale})`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'linear',
            fill: 'forwards'
        });

        animation.onfinish = () => asteroid.remove();

        // Lanzar otro entre 2 y 6 segundos aleatoriamente
        setTimeout(spawnAsteroid, Math.random() * 4000 + 2000);
    }
    
    // Iniciar asteroides después de un momento
    setTimeout(spawnAsteroid, 1000);

    // --- Sistema de Flashes esporádicos en el fondo (1 o 2 cada ~10 seg) ---
    function spawnFlashes() {
        if (isPlaying) { // Solo si ya inició la música/eclipse
            // Elegir hacer 1 o 2 flashes diferentes
            const numFlashes = Math.random() > 0.5 ? 2 : 1;

            for (let i = 0; i < numFlashes; i++) {
                // Pequeño desfase de tiempo si disparan 2
                setTimeout(() => {
                    const flash = document.createElement('div');
                    flash.classList.add('super-flash');
                    
                    const size = Math.random() * 5 + 5;
                    flash.style.width = `${size}px`;
                    flash.style.height = `${size}px`;
                    flash.style.left = `${Math.random() * 100}vw`;
                    flash.style.top = `${Math.random() * 100}vh`;
                    
                    // Colocamos en la capa de fondo medio para tener efecto 3D
                    layers.mid.el.appendChild(flash);
                    
                    // Eliminar tras completar la animación (0.8s)
                    setTimeout(() => flash.remove(), 1000);
                }, i * (Math.random() * 400 + 100)); // separación entre 100ms y 500ms
            }
        }
        
        // Llamar la función a sí misma entre 8 y 13 segundos aleatoriamente
        setTimeout(spawnFlashes, Math.random() * 5000 + 8000);
    }
    // Iniciar el temporizador (los flashes no aparecerán visualmente hasta que isPlaying sea true)
    setTimeout(spawnFlashes, 3000);

    // --- El Evento del Eclipse ---
    interactionZone.addEventListener('click', () => {
        if (!isPlaying) {
            document.body.classList.add('active');
            
            // Requerir permiso de giroscopio en iOS 13+ (debe ejecutarse tras interacción del usuario)
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().catch(console.error);
            }

            music.volume = 0.6;
            const playPromise = music.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Música funcionando
                })
                .catch(error => {
                    console.log("No se pudo iniciar la música", error);
                });
            }
            
            isPlaying = true;
        }
    });
});
