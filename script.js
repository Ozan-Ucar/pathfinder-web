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

// dijkstra
function runDijkstra() {
    const unvisited = [];
    const distances = {};
    const prev = {};
    
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            const id = `${r}-${c}`;
            distances[id] = Infinity;
            unvisited.push({r, c, id});
        }
    }
    
    distances[`${startNode.r}-${startNode.c}`] = 0;
    const animations = [];
    
    while(unvisited.length > 0) {
        unvisited.sort((a, b) => distances[a.id] - distances[b.id]);
        const current = unvisited.shift();
        
        if(distances[current.id] === Infinity) break;
        
        const nodeEl = document.getElementById(`node-${current.r}-${current.c}`);
        if(nodeEl.classList.contains('wall')) continue;
        
        animations.push({type: 'visit', r: current.r, c: current.c});
        
        if(current.r === endNode.r && current.c === endNode.c) break;
        
        const neighbors = [
            {r: current.r-1, c: current.c},
            {r: current.r+1, c: current.c},
            {r: current.r, c: current.c-1},
            {r: current.r, c: current.c+1}
        ];
        
        for(const n of neighbors) {
            if(n.r>=0 && n.r<ROWS && n.c>=0 && n.c<COLS) {
                const nId = `${n.r}-${n.c}`;
                if(distances[current.id] + 1 < distances[nId]) {
                    distances[nId] = distances[current.id] + 1;
                    prev[nId] = current;
                }
            }
        }
    }
    
    // backtrack path
    const path = [];
    let curr = `${endNode.r}-${endNode.c}`;
    while(prev[curr]) {
        path.unshift(prev[curr]);
        curr = `${prev[curr].r}-${prev[curr].c}`;
    }
    
    path.forEach(p => animations.push({type: 'path', r: p.r, c: p.c}));
    return animations;
}

function playAnimations(animations) {
    animations.forEach((anim, i) => {
        setTimeout(() => {
            const node = document.getElementById(`node-${anim.r}-${anim.c}`);
            if(!node.classList.contains('start') && !node.classList.contains('end')) {
                node.classList.add(anim.type === 'visit' ? 'visited' : 'path');
            }
        }, i * 8);
    });
}

document.getElementById('startButton').addEventListener('click', () => {
    // clear old
    document.querySelectorAll('.node').forEach(n => n.classList.remove('visited', 'path'));
    const anims = runDijkstra();
    playAnimations(anims);
});

document.getElementById('clearButton').addEventListener('click', () => {
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('visited', 'path', 'wall');
    });
});
