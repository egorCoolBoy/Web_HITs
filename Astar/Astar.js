function createMap() {
        const size = parseInt(document.getElementById('size').value);
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
        for (let i = 0; i < size * size; i++) 
        {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => { cell.classList.toggle('startEnd'); 
            });
            cell.addEventListener('contextmenu', (e) => { 
                e.preventDefault(); 
                cell.classList.toggle('wall'); 
            });
            grid.appendChild(cell);
        }
}

function findWay()
{
        document.writeln("СКОРО")
}
    