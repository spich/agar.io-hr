const FULL_ANGLE = 2 * Math.PI;

const drawRoundObject = (position, radius, graph) => {
    graph.beginPath();
    graph.arc(position.x, position.y, radius, 0, FULL_ANGLE);
    graph.closePath();
    graph.fill();
    graph.stroke();
}

const drawFood = (position, food, graph) => {
    graph.fillStyle = 'hsl(' + food.hue + ', 100%, 50%)';
    graph.strokeStyle = 'hsl(' + food.hue + ', 100%, 45%)';
    graph.lineWidth = 0;
    drawRoundObject(position, food.radius, graph);
};

const drawVirus = (position, virus, graph) => {
    graph.strokeStyle = virus.stroke;
    graph.fillStyle = virus.fill;
    graph.lineWidth = virus.strokeWidth;
    let theta = 0;
    let sides = 20;

    graph.beginPath();
    for (let theta = 0; theta < FULL_ANGLE; theta += FULL_ANGLE / sides) {
        let point = circlePoint(position, virus.radius, theta);
        graph.lineTo(point.x, point.y);
    }
    graph.closePath();
    graph.stroke();
    graph.fill();
};

const drawFireFood = (position, mass, playerConfig, graph) => {
    graph.strokeStyle = 'hsl(' + mass.hue + ', 100%, 45%)';
    graph.fillStyle = 'hsl(' + mass.hue + ', 100%, 50%)';
    graph.lineWidth = playerConfig.border + 2;
    drawRoundObject(position, mass.radius - 1, graph);
};

const valueInRange = (min, max, value) => Math.min(max, Math.max(min, value))

const circlePoint = (origo, radius, theta) => ({
    x: origo.x + radius * Math.cos(theta),
    y: origo.y + radius * Math.sin(theta)
});

const cellTouchingBorders = (cell, borders) =>
    cell.x - cell.radius <= borders.left ||
    cell.x + cell.radius >= borders.right ||
    cell.y - cell.radius <= borders.top ||
    cell.y + cell.radius >= borders.bottom

const regulatePoint = (point, borders) => ({
    x: valueInRange(borders.left, borders.right, point.x),
    y: valueInRange(borders.top, borders.bottom, point.y)
});

const drawCellWithLines = (cell, borders, graph) => {
    let pointCount = 30 + ~~(cell.mass / 5);
    let points = [];
    for (let theta = 0; theta < FULL_ANGLE; theta += FULL_ANGLE / pointCount) {
        let point = circlePoint(cell, cell.radius, theta);
        points.push(regulatePoint(point, borders));
    }
    graph.beginPath();
    graph.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        graph.lineTo(points[i].x, points[i].y);
    }
    graph.closePath();
    graph.fill();
    graph.stroke();
}

const drawCells = (cells, playerConfig, toggleMassState, borders, graph) => {
    for (let cell of cells) {
        // Draw the cell itself
        graph.fillStyle = cell.color;
        graph.strokeStyle = cell.borderColor;
        graph.lineWidth = 6;
        if (cellTouchingBorders(cell, borders)) {
            // Asssemble the cell from lines
            drawCellWithLines(cell, borders, graph);
        } else {
            // Border corrections are not needed, the cell can be drawn as a circle
            drawRoundObject(cell, cell.radius, graph);
        }

        // Draw the name of the player
        let fontSize = Math.max(cell.radius / 3, 12);
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = playerConfig.textColor;
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px sans-serif';
        graph.strokeText(cell.name, cell.x, cell.y);
        graph.fillText(cell.name, cell.x, cell.y);

        // Draw the mass (if enabled)
        if (toggleMassState === 1) {
            graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
            if (cell.name.length === 0) fontSize = 0;
            graph.strokeText(Math.round(cell.mass), cell.x, cell.y + fontSize);
            graph.fillText(Math.round(cell.mass), cell.x, cell.y + fontSize);
        }
    }
};

// Feature 4: Enhanced grid drawing with 100px spacing and subtle appearance
const drawGrid = (global, player, screen, graph) => {
    graph.lineWidth = 1;
    graph.strokeStyle = global.lineColor;
    graph.globalAlpha = 0.1; // More subtle grid transparency
    graph.beginPath();

    // Draw grid lines every 100 pixels in game world
    const gridSize = 100;
    const startX = Math.floor(-player.x / gridSize) * gridSize;
    const endX = startX + Math.ceil(screen.width / gridSize + 2) * gridSize;
    const startY = Math.floor(-player.y / gridSize) * gridSize;
    const endY = startY + Math.ceil(screen.height / gridSize + 2) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
        const screenX = x + player.x;
        if (screenX >= -gridSize && screenX <= screen.width + gridSize) {
            graph.moveTo(screenX, 0);
            graph.lineTo(screenX, screen.height);
        }
    }

    for (let y = startY; y <= endY; y += gridSize) {
        const screenY = y + player.y;
        if (screenY >= -gridSize && screenY <= screen.height + gridSize) {
            graph.moveTo(0, screenY);
            graph.lineTo(screen.width, screenY);
        }
    }

    graph.stroke();
    graph.globalAlpha = 1;
};

const drawBorder = (borders, graph) => {
    graph.lineWidth = 1;
    graph.strokeStyle = '#000000'
    graph.beginPath()
    graph.moveTo(borders.left, borders.top);
    graph.lineTo(borders.right, borders.top);
    graph.lineTo(borders.right, borders.bottom);
    graph.lineTo(borders.left, borders.bottom);
    graph.closePath()
    graph.stroke();
};

const drawErrorMessage = (message, graph, screen) => {
    graph.fillStyle = '#333333';
    graph.fillRect(0, 0, screen.width, screen.height);
    graph.textAlign = 'center';
    graph.fillStyle = '#FFFFFF';
    graph.font = 'bold 30px sans-serif';
    graph.fillText(message, screen.width / 2, screen.height / 2);
}

// Feature 2: Minimap - shows overview of game world in top-left corner (200x200px)
const drawMinimap = (global, player, borders, users, graph) => {
    const minimapSize = 200;
    const minimapPadding = 10;
    const minimapX = minimapPadding;
    const minimapY = minimapPadding;
    
    // Save current state
    graph.save();
    
    // Draw minimap background
    graph.fillStyle = 'rgba(0, 0, 0, 0.3)';
    graph.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Draw minimap border
    graph.strokeStyle = '#ffffff';
    graph.lineWidth = 2;
    graph.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Calculate scaling factor from game world to minimap
    const scaleX = minimapSize / global.game.width;
    const scaleY = minimapSize / global.game.height;
    
    // Draw game boundaries on minimap
    graph.strokeStyle = '#666666';
    graph.lineWidth = 1;
    graph.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Draw other players on minimap
    graph.fillStyle = 'rgba(255, 100, 100, 0.8)';
    for (let user of users) {
        if (user.id !== player.id && user.cells && user.cells.length > 0) {
            for (let cell of user.cells) {
                const mapX = minimapX + (cell.x * scaleX);
                const mapY = minimapY + (cell.y * scaleY);
                const radius = Math.max(2, cell.radius * scaleX * 0.5); // Minimum 2px radius on minimap
                
                graph.beginPath();
                graph.arc(mapX, mapY, radius, 0, 2 * Math.PI);
                graph.fill();
            }
        }
    }
    
    // Draw current player on minimap (in different color)
    if (player.cells && player.cells.length > 0) {
        graph.fillStyle = 'rgba(100, 255, 100, 0.9)';
        for (let cell of player.cells) {
            const mapX = minimapX + (cell.x * scaleX);
            const mapY = minimapY + (cell.y * scaleY);
            const radius = Math.max(3, cell.radius * scaleX * 0.5); // Slightly larger for current player
            
            graph.beginPath();
            graph.arc(mapX, mapY, radius, 0, 2 * Math.PI);
            graph.fill();
        }
    }
    
    // Restore state
    graph.restore();
}

module.exports = {
    drawFood,
    drawVirus,
    drawFireFood,
    drawCells,
    drawErrorMessage,
    drawGrid,
    drawBorder,
    drawMinimap
};