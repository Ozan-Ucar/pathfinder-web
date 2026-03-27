const ROWS = 20;
const COLS = 40;
const grid = document.getElementById('grid-container');

function initGrid() {
    grid.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.id = `node-${r}-${c}`;
            grid.appendChild(node);
        }
    }
}

initGrid();
