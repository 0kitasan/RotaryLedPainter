const canvas = document.getElementById('ledCanvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let points = [];
let ledStates = [];
let numLEDs = 8;
let divisions = 40;  // 将 Divisions 的默认值改为 40
const LED_RADIUS = 5;  // 增大 LED 的半径
let scale = 1;  // 初始缩放比例
let isMouseDown = false;  // 鼠标按下状态
let lastPoint = null;  // 上次点击的点，用于防止重复切换

canvas.addEventListener('mousedown', () => isMouseDown = true);
canvas.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', toggleLED);

function generateInitialPoints() {
    const points = [];
    const spacing = 20;
    for (let i = 0; i < numLEDs; i++) {
        const x = centerX;
        const y = centerY - i * spacing;
        points.push({ x, y });
    }
    return points;
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);  // 移动到中心点
    ctx.scale(scale, scale);  // 根据缩放比例绘制
    ctx.translate(-centerX, -centerY);  // 移回原点
    const allPoints = [];
    const angleIncrement = (2 * Math.PI) / divisions;
    for (let i = 0; i < divisions; i++) {
        const currentAngle = i * angleIncrement;
        const rotatedPoints = points.map(point => {
            const x = point.x - centerX;
            const y = point.y - centerY;
            const rotatedX = x * Math.cos(currentAngle) - y * Math.sin(currentAngle) + centerX;
            const rotatedY = x * Math.sin(currentAngle) + y * Math.cos(currentAngle) + centerY;
            return { x: rotatedX, y: rotatedY, state: ledStates[i][points.indexOf(point)] };
        });
        allPoints.push(...rotatedPoints);
    }
    allPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, LED_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = point.state ? '#00BFFF' : 'white';  // 使用更亮的淡蓝色
        ctx.fill();
    });
    ctx.restore();
}

function rotate() {
    numLEDs = parseInt(document.getElementById('numLEDs').value);
    divisions = parseInt(document.getElementById('divisions').value);
    points = generateInitialPoints();
    ledStates = Array.from({ length: divisions }, () => Array(numLEDs).fill(0));  // 初始化 LED 状态为全灭
    drawPoints();
}

function toggleLED(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - centerX) / scale + centerX;
    const y = (event.clientY - rect.top - centerY) / scale + centerY;

    let found = false;
    const angleIncrement = (2 * Math.PI) / divisions;
    for (let i = 0; i < divisions; i++) {
        const currentAngle = i * angleIncrement;
        points.forEach((point, index) => {
            const rotatedX = (point.x - centerX) * Math.cos(currentAngle) - (point.y - centerY) * Math.sin(currentAngle) + centerX;
            const rotatedY = (point.x - centerX) * Math.sin(currentAngle) + (point.y - centerY) * Math.cos(currentAngle) + centerY;
            const dx = rotatedX - x;
            const dy = rotatedY - y;
            if (dx * dx + dy * dy < LED_RADIUS * LED_RADIUS) {  // 以点的半径5为准
                ledStates[i][index] = 1 - ledStates[i][index];  // 切换 LED 状态
                found = true;
                drawPoints();
            }
        });
        if (found) break;
    }
}

function handleMouseMove(event) {
    if (!isMouseDown) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - centerX) / scale + centerX;
    const y = (event.clientY - rect.top - centerY) / scale + centerY;

    let found = false;
    const angleIncrement = (2 * Math.PI) / divisions;
    for (let i = 0; i < divisions; i++) {
        const currentAngle = i * angleIncrement;
        points.forEach((point, index) => {
            const rotatedX = (point.x - centerX) * Math.cos(currentAngle) - (point.y - centerY) * Math.sin(currentAngle) + centerX;
            const rotatedY = (point.x - centerX) * Math.sin(currentAngle) + (point.y - centerY) * Math.cos(currentAngle) + centerY;
            const dx = rotatedX - x;
            const dy = rotatedY - y;
            if (dx * dx + dy * dy < LED_RADIUS * LED_RADIUS) {  // 以点的半径5为准
                if (!lastPoint || (lastPoint.x !== rotatedX || lastPoint.y !== rotatedY)) {
                    ledStates[i][index] = 1 - ledStates[i][index];  // 切换 LED 状态
                    lastPoint = { x: rotatedX, y: rotatedY };
                    found = true;
                    drawPoints();
                }
            }
        });
        if (found) break;
    }
}

function zoomIn() {
    scale *= 1.1;  // 放大比例
    drawPoints();
}

function zoomOut() {
    scale /= 1.1;  // 缩小比例
    drawPoints();
}

function exportResult() {
    const data = {
        numLEDs,
        divisions,
        ledStates
    };
    const json = JSON.stringify(data, null, 2);
    output.value = json;
}

function importData() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            numLEDs = data.numLEDs;
            divisions = data.divisions;
            ledStates = data.ledStates;
            points = generateInitialPoints();
            drawPoints();
        };
        reader.readAsText(file);
    }
}

rotate();