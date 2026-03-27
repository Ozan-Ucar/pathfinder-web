const ROWS = 20;
const COLS = 40;
const grid = document.getElementById('grid-container');

let isDrawing = false;
let startNode = {r: 10, c: 5};
let endNode = {r: 10, c: 35};

function initGrid() {
    grid.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.id = `node-${r}-${c}`;
            
            if(r === startNode.r && c === startNode.c) node.classList.add('start');
            if(r === endNode.r && c === endNode.c) node.classList.add('end');
            
            node.addEventListener('mousedown', () => {
                isDrawing = true;
                toggleWall(node, r, c);
            });
            node.addEventListener('mouseenter', () => {
                if(isDrawing) toggleWall(node, r, c);
            });
            node.addEventListener('mouseup', () => isDrawing = false);
            
            grid.appendChild(node);
        }
    }
}

function toggleWall(node, r, c) {
    if((r===startNode.r && c===startNode.c) || (r===endNode.r && c===endNode.c)) return;
    node.classList.toggle('wall');
}

grid.addEventListener('mouseleave', () => isDrawing = false);

initGrid();
