document.getElementById('astar').addEventListener('click', function() {
    window.location.href = "../Astar/Astar.html";
});
document.getElementById('neuralNet').addEventListener('click', function() 
{
    window.location.href = "../Neural Net/NN.html";
});
let points = [];
let centroids = [];

function createMap() {
    const size = parseInt(document.getElementById('size').value);
    if(size<2||isNaN(size))
    {
        alert("Введите корректный размер")
        throw new error();
    }
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    points = [];
    centroids = [];

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;

        cell.addEventListener('click', () => {
            cell.classList.add('startEnd');
            const x = i % size;
            const y = Math.floor(i / size);
            points.push({ x, y, index: i, cluster: null });
        });

        grid.appendChild(cell);
    }
}

function findWay() {
    const K = parseInt(document.getElementById('k').value);

    if (isNaN(K) || K < 1) {
        alert("Пожалуйста, введите корректное количество кластеров.");
        return;
    }

    if (points.length === 0) {
        alert("Сначала нужно добавить хотя бы одну точку!");
        return;
    }

    const numClusters = Math.min(K, points.length);

    centroids = [];
    let chosen = new Set();
    while (centroids.length < numClusters) {
        let idx = Math.floor(Math.random() * points.length);
        if (!chosen.has(idx)) {
            centroids.push({ x: points[idx].x, y: points[idx].y });
            chosen.add(idx);
        }
    }

    let changed;
    do {
        changed = false;
        for (let p of points) {
            let minDist = Infinity;
            let bestCluster = null;
            for (let i = 0; i < numClusters; i++) {
                const c = centroids[i];
                const dist = Math.hypot(p.x - c.x, p.y - c.y);
                if (dist < minDist) {
                    minDist = dist;
                    bestCluster = i;
                }
            }

            if (p.cluster !== bestCluster) {
                p.cluster = bestCluster;
                changed = true;
            }
        }

        for (let i = 0; i < numClusters; i++) {
            const clusterPoints = points.filter(p => p.cluster === i);
            if (clusterPoints.length === 0) continue;

            const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
            const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
            centroids[i] = { x: avgX, y: avgY };
        }

    } while (changed);

    colorClusters();
}

function colorClusters() {
    const colors = ['red', 'yellow', 'lime', 'cyan', 'magenta', 'orange'];
    const cells = document.querySelectorAll('.cell');
    for (let p of points) {
        const cell = cells[p.index];
        cell.style.backgroundColor = colors[p.cluster % colors.length];
    }
}
