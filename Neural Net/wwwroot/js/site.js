const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let lastPrediction = null;

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    draw(e);
});
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 8, 8);
}

function getImageData() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 50;
    tempCanvas.height = 50;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, 50, 50);
    tempCtx.drawImage(canvas, 0, 0, 50, 50);

    const imageData = tempCtx.getImageData(0, 0, 50, 50).data;

    const pixels = [];
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const grayscale = 255 - r;
        pixels.push(grayscale);
    }

    return pixels;
}

function predict() {
    const input = getImageData();
    fetch("/api/digit/predict", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("result").innerText = `Цифра: ${data.digit}`;
            lastPrediction = data.digit;
        });
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("result").innerText = "";
    lastPrediction = null;
}

function markCorrect() {
    if (lastPrediction === null) {
        alert("Сначала нажмите 'Предсказать'");
        return;
    }

    fetch("/api/digit/train", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: getImageData(), expected: lastPrediction })
    }).then(() => alert("Ответ сохранён как верный."));
}

function markIncorrect() {
    const correct = prompt("Введите правильную цифру (0-9):");
    if (correct === null || isNaN(correct)) return;

    fetch("/api/digit/train", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: getImageData(), expected: parseInt(correct) })
    }).then(() => alert("Нейросеть запомнила правильную цифру."));
}
function sendImageWithLabel(label) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 50;
    tempCanvas.height = 50;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, 50, 50);
    tempCtx.drawImage(canvas, 0, 0, 50, 50);

    tempCanvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("image", blob, "digit.png");
        formData.append("expected", label);

        fetch("/api/digit/train-image", {
            method: "POST",
            body: formData
        }).then(() => alert("Изображение отправлено как обучающий пример."));
    }, "image/png");
}
window.onload = () => clearCanvas();
