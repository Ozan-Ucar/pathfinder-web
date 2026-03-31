const ROWS = 20;
const COLS = 40;
const grid = document.getElementById('grid-container');

let isDrawing = false;
let dragging = null;
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
            
            node.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if(node.classList.contains('start')) {
                    dragging = 'start';
                } else if(node.classList.contains('end')) {
                    dragging = 'end';
                } else {
                    isDrawing = true;
                    toggleWall(node, r, c);
                }
            });
            node.addEventListener('mouseenter', () => {
                if(isDrawing) toggleWall(node, r, c);
                if(dragging) {
                    const oldId = dragging === 'start' 
                        ? `node-${startNode.r}-${startNode.c}` 
                        : `node-${endNode.r}-${endNode.c}`;
                    document.getElementById(oldId).classList.remove(dragging);
                    if(dragging === 'start') startNode = {r, c};
                    else endNode = {r, c};
                    node.classList.remove('wall');
                    node.classList.add(dragging);
                }
            });
            node.addEventListener('mouseup', () => {
                isDrawing = false;
                dragging = null;
            });
            
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

function getNeighbors(r, c) {
    const dirs = [{r:r-1,c},{r:r+1,c},{r,c:c-1},{r,c:c+1}];
    return dirs.filter(n => n.r>=0 && n.r<ROWS && n.c>=0 && n.c<COLS);
}

function isWall(r, c) {
    return document.getElementById(`node-${r}-${c}`).classList.contains('wall');
}

function backtrackPath(prev) {
    const path = [];
    let curr = `${endNode.r}-${endNode.c}`;
    while(prev[curr]) {
        path.unshift(prev[curr]);
        curr = `${prev[curr].r}-${prev[curr].c}`;
    }
    return path;
}

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
        if(isWall(current.r, current.c)) continue;
        
        animations.push({type: 'visit', r: current.r, c: current.c});
        if(current.r === endNode.r && current.c === endNode.c) break;
        
        for(const n of getNeighbors(current.r, current.c)) {
            const nId = `${n.r}-${n.c}`;
            if(distances[current.id] + 1 < distances[nId]) {
                distances[nId] = distances[current.id] + 1;
                prev[nId] = current;
            }
        }
    }
    
    return {animations, prev};
}

// bfs
function runBFS() {
    const queue = [{r: startNode.r, c: startNode.c}];
    const visited = new Set();
    const prev = {};
    const animations = [];
    
    visited.add(`${startNode.r}-${startNode.c}`);
    
    while(queue.length > 0) {
        const current = queue.shift();
        animations.push({type: 'visit', r: current.r, c: current.c});
        
        if(current.r === endNode.r && current.c === endNode.c) break;
        
        for(const n of getNeighbors(current.r, current.c)) {
            const nId = `${n.r}-${n.c}`;
            if(!visited.has(nId) && !isWall(n.r, n.c)) {
                visited.add(nId);
                prev[nId] = current;
                queue.push(n);
            }
        }
    }
    
    return {animations, prev};
}


// a* with manhattan
function runAStar() {
    const openSet = [{r: startNode.r, c: startNode.c, g: 0, f: 0}];
    const gScore = {};
    const prev = {};
    const closed = new Set();
    const animations = [];
    
    gScore[`${startNode.r}-${startNode.c}`] = 0;
    
    function heuristic(r, c) {
        return Math.abs(r - endNode.r) + Math.abs(c - endNode.c);
    }
    
    while(openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const cId = `${current.r}-${current.c}`;
        
        if(closed.has(cId)) continue;
        closed.add(cId);
        if(isWall(current.r, current.c)) continue;
        
        animations.push({type: 'visit', r: current.r, c: current.c});
        if(current.r === endNode.r && current.c === endNode.c) break;
        
        for(const n of getNeighbors(current.r, current.c)) {
            const nId = `${n.r}-${n.c}`;
            if(closed.has(nId) || isWall(n.r, n.c)) continue;
            
            const tentG = (gScore[cId] || 0) + 1;
            if(tentG < (gScore[nId] || Infinity)) {
                gScore[nId] = tentG;
                prev[nId] = current;
                openSet.push({r: n.r, c: n.c, g: tentG, f: tentG + heuristic(n.r, n.c)});
            }
        }
    }
    
    return {animations, prev};
}

function playAnimations(animations) {
    const speed = parseInt(document.getElementById('speedSlider').value) || 8;
    animations.forEach((anim, i) => {
        setTimeout(() => {
            const node = document.getElementById(`node-${anim.r}-${anim.c}`);
            if(!node.classList.contains('start') && !node.classList.contains('end')) {
                node.classList.add(anim.type === 'visit' ? 'visited' : 'path');
            }
        }, i * speed);
    });
}

function clearSearch() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('visited', 'path'));
}

document.getElementById('startButton').addEventListener('click', () => {
    clearSearch();
    
    const algo = document.getElementById('algoSelect').value;
    let result;
    if(algo === 'dijkstra') result = runDijkstra();
    else if(algo === 'bfs') result = runBFS();
    else if(algo === 'astar') result = runAStar();
    
    if(result) {
        const path = backtrackPath(result.prev);
        path.forEach(p => result.animations.push({type: 'path', r: p.r, c: p.c}));
        playAnimations(result.animations);
    }
});

document.getElementById('clearButton').addEventListener('click', () => {
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('visited', 'path', 'wall');
    });
});

// random maze
document.getElementById('mazeButton').addEventListener('click', () => {
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('visited', 'path', 'wall');
    });
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            if((r===startNode.r && c===startNode.c) || (r===endNode.r && c===endNode.c)) continue;
            if(Math.random() < 0.3) {
                document.getElementById(`node-${r}-${c}`).classList.add('wall');
            }
        }
    }
});
