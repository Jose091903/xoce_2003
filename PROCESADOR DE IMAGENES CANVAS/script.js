const imageLoader = document.getElementById('imageLoader');
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d', { willReadFrequently: true });
const slider = document.getElementById('splitSlider');
const btnSepia = document.getElementById('btnSepia');
const btnInvert = document.getElementById('btnInvert');
const btnBinary = document.getElementById('btnBinary');
const btnReset = document.getElementById('btnReset');
const btnDownload = document.getElementById('btnDownload');

let originalImage = null; 
let isImageLoaded = false;
let currentFilter = null; 

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

imageLoader.addEventListener('change', handleImageUpload);
slider.addEventListener('input', drawScene);

btnSepia.addEventListener('click', () => applyFilter('sepia'));
btnInvert.addEventListener('click', () => applyFilter('invert'));
btnBinary.addEventListener('click', () => applyFilter('binary'));
btnReset.addEventListener('click', resetCanvas);
btnDownload.addEventListener('click', downloadImage);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        originalImage = new Image();
        originalImage.onload = function() {
            mainCanvas.width = originalImage.width;
            mainCanvas.height = originalImage.height;
            offscreenCanvas.width = originalImage.width;
            offscreenCanvas.height = originalImage.height;
            
            isImageLoaded = true;
            currentFilter = null;
            
            enableControls();
            resetCanvas();
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function enableControls() {
    btnSepia.disabled = false;
    btnInvert.disabled = false;
    btnBinary.disabled = false;
    btnReset.disabled = false;
    btnDownload.disabled = false;
    slider.disabled = false;
}

function resetCanvas() {
    if (!isImageLoaded) return;
    
    currentFilter = null;
    slider.value = 50; 
    
    ctx.drawImage(originalImage, 0, 0);
    offscreenCtx.drawImage(originalImage, 0, 0);
    
    drawScene();
}

function downloadImage() {
    if (!isImageLoaded) return;
    
    const link = document.createElement('a');
    link.download = currentFilter ? `imagen-${currentFilter}.png` : 'imagen-original.png';
    link.href = offscreenCanvas.toDataURL('image/png');
    link.click();
}

function applyFilter(type) {
    if (!isImageLoaded) return;
    
    currentFilter = type;
    
    offscreenCtx.drawImage(originalImage, 0, 0);
    
    const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];     
        let g = data[i + 1]; 
        let b = data[i + 2]; 

        if (type === 'sepia') {
            let tr = (r * 0.393) + (g * 0.769) + (b * 0.189);
            let tg = (r * 0.349) + (g * 0.686) + (b * 0.168);
            let tb = (r * 0.272) + (g * 0.534) + (b * 0.131);
            
            data[i]     = tr;
            data[i + 1] = tg;
            data[i + 2] = tb;
            
        } else if (type === 'invert') {
            data[i]     = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
            
        } else if (type === 'binary') {
            let avg = (r + g + b) / 3;
            let threshold = 127;
            let val = (avg > threshold) ? 255 : 0;
            
            data[i]     = val;
            data[i + 1] = val;
            data[i + 2] = val;
        }
    }
    
    offscreenCtx.putImageData(imageData, 0, 0);
    drawScene();
}

function drawScene() {
    if (!isImageLoaded) return;
    
    const splitX = (slider.value / 100) * mainCanvas.width;
    
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.drawImage(originalImage, 0, 0);
    
    ctx.save();
    
    ctx.beginPath();
    ctx.rect(0, 0, splitX, mainCanvas.height);
    ctx.clip(); 
    
    ctx.drawImage(offscreenCanvas, 0, 0);
    ctx.restore();
    
    if (currentFilter) {
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, mainCanvas.height);
        ctx.lineWidth = 3; 
        ctx.strokeStyle = '#ffffff'; 
        ctx.stroke();
        
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(splitX, mainCanvas.height / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6'; 
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
