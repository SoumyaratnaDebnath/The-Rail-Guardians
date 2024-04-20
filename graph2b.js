var currentRedVertices = [];
var movedRedVertices = [];
var exRedVertices = [];
var icon_defender;
var icon_junction;

const iconPaths = [
    'assets/builder.png',
    'assets/station.png'
];
const icons = [];

function confirmSelection() {
    document.getElementById('popup').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function() {

    // for light and dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    var colors = ['#9b5de5','#f15bb5','#00bbf9','#00f5d4', 'blueviolet'];
    if(mode === 'dark') {
        colors = ['#041C32','#04293A','#070F2B','#1B1A55', '#2D3250'];
    }
    document.getElementById('out-top').style.fill = colors[0];
    document.getElementById('in-top').style.fill = colors[1];
    document.getElementById('out-bottom').style.fill = colors[2];
    document.getElementById('in-bottom').style.fill = colors[3];
    document.getElementById('svg_bg').style.backgroundColor = colors[4];
    document.getElementById('out-top-pop').style.fill = colors[0];
    document.getElementById('in-top-pop').style.fill = colors[1];
    document.getElementById('out-bottom-pop').style.fill = colors[2];
    document.getElementById('in-bottom-pop').style.fill = colors[3];
    document.getElementById('svg_bg-pop').style.backgroundColor = colors[4];    
    
    document.getElementById('playAgain1').href = window.location.href;
    document.getElementById('playAgain2').href = window.location.href;
    document.getElementById('mainMenu1').href = "main_menu.html?mode=" + mode;
    document.getElementById('mainMenu2').href = "main_menu.html?mode=" + mode;
    
    document.getElementById('popup').style.display = 'block'; // to be changed to block

    var canvas = document.getElementById("graphCanvas"); // the canvas
    var parent = canvas.parentElement;
    var player1pass_btn = document.getElementById("player1pass"); // button that layer 1 can use when he do not want to change any config
    var ctx = canvas.getContext("2d"); // getting the canvas
    var maxRedVerticesSelector = document.getElementById("maxRedVertices");
    var playerTurn = 1; // 1 for Player 1, 2 for Player 2
    var putRedVertex = true;
    var status = document.getElementById("status");
    var maxRounds = document.getElementById("maxRounds");

    var vertices = [
        // Letter 'I'
        {x: 100, y: 100, color: "black", neighbors: [1]},       // 0
        {x: 100, y: 300, color: "black", neighbors: []},        // 1
    
        // Second 'I'
        {x: 200, y: 100, color: "black", neighbors: [3]},       // 2
        {x: 200, y: 300, color: "black", neighbors: []},        // 3
    
        // Letter 'T'
        {x: 400, y: 100, color: "black", neighbors: [5]},       // 4
        {x: 400, y: 300, color: "black", neighbors: []},        // 5
        {x: 500, y: 100, color: "black", neighbors: [4]},       // 6
        {x: 300, y: 100, color: "black", neighbors: [4]},       // 7

        // Letter 'G'
        {x: 600, y: 100, color: "black", neighbors: [9]},       // 8
        {x: 600, y: 300, color: "black", neighbors: []},        // 9
        {x: 750, y: 100, color: "black", neighbors: [8]},       // 10
        {x: 750, y: 200, color: "black", neighbors: [12]},      // 11
        {x: 750, y: 300, color: "black", neighbors: [9]},       // 12
        
        // Letter 'N'
        {x: 850, y: 100, color: "black", neighbors: [14, 16]},      // 13
        {x: 850, y: 300, color: "black", neighbors: []},            // 14
        {x: 1000, y: 100, color: "black", neighbors: [16]},         // 15
        {x: 1000, y: 300, color: "black", neighbors: []},           // 16

        {x: 300, y: 450, color: "black", neighbors: [1, 3, 5, 18]},       // 17
        {x: 800, y: 450, color: "black", neighbors: [12, 9, 14, 16]},     // 18
    ];

    function createEdges(vertices) {
        let edges = [];
        let addedEdges = new Set(); // To track added edges and avoid duplicates
    
        vertices.forEach((vertex, index) => {
            vertex.neighbors.forEach(neighbor => {
                // Create a string representation of the edge to easily check for duplicates
                // Ensure the smaller index is first to avoid duplicates like "0-1" and "1-0"
                let edgeRepresentation = index < neighbor ? `${index}-${neighbor}` : `${neighbor}-${index}`;
                
                if (!addedEdges.has(edgeRepresentation)) {
                    edges.push({from: index, to: neighbor, color: "black"});
                    addedEdges.add(edgeRepresentation);
                }
            });
        });
    
        return edges;
    }
    var edges = createEdges(vertices);

    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw each edge as railway tracks
        edges.forEach(function(edge) {
            var from = vertices[edge.from];
            var to = vertices[edge.to];
            
            // Calculate direction vector
            var dx = to.x - from.x;
            var dy = to.y - from.y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var unitDx = dx / length;
            var unitDy = dy / length;

            // Define track width and sleeper length
            var trackWidth = 5; // Distance between the two parallel lines
            var sleeperLength = 8; // Length of the sleepers
            var sleeperSpacing = 20; // Distance between sleepers

            // Calculate perpendicular vector for track width and sleeper direction
            var perpDx = unitDy;
            var perpDy = -unitDx;

            // Function to draw a line segment
            function drawLineSegment(x1, y1, x2, y2, width = 1, color = "black") {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.stroke();
            }

            // Draw parallel tracks
            for (let side = -1; side <= 1; side += 2) {
                let offsetX = perpDx * trackWidth * side * 2;
                let offsetY = perpDy * trackWidth * side * 2;
                // let offsetX = perpDx * trackWidth * side * 1;
                // let offsetY = perpDy * trackWidth * side * 1;
                if(!putRedVertex)
                    drawLineSegment(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY, 1, color='white');
                else
                    drawLineSegment(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY, 1, color='rgba(0, 0, 0, 0)');
            }

            // Draw sleepers
            for (let dist = 0; dist <= length; dist += sleeperSpacing) {
                let sleeperCenterX = from.x + unitDx * dist;
                let sleeperCenterY = from.y + unitDy * dist;

                let sleeperStartX = sleeperCenterX - perpDx * sleeperLength / 1;
                let sleeperStartY = sleeperCenterY - perpDy * sleeperLength / 1;
                let sleeperEndX = sleeperCenterX + perpDx * sleeperLength / 1;
                let sleeperEndY = sleeperCenterY + perpDy * sleeperLength / 1;
                
                if(!putRedVertex)
                    drawLineSegment(sleeperStartX, sleeperStartY, sleeperEndX, sleeperEndY, 10, color="white");
                else
                    drawLineSegment(sleeperStartX, sleeperStartY, sleeperEndX, sleeperEndY, 10, color='rgba(0, 0, 0, 0)');
            }
        });

        vertices.forEach(function(vertex) {
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
            if (vertex.color === "red") {
                // ctx.fillStyle = "white";
                // ctx.fill();
                ctx.drawImage(icon_defender, vertex.x - 20, vertex.y - 25, 40, 40); // Adjust size as needed
            } else {
                // ctx.fillStyle = "white";
                // ctx.fill();
                ctx.drawImage(icon_junction, vertex.x - 30, vertex.y - 35, 60, 60); // Adjust size as needed
            }
        });
    }

    function drawGraphEdgeWise(edges) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw each edge as railway tracks
        edges.forEach(function(edge) {
            var from = vertices[edge.from];
            var to = vertices[edge.to];
            
            // Calculate direction vector
            var dx = to.x - from.x;
            var dy = to.y - from.y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var unitDx = dx / length;
            var unitDy = dy / length;

            // Define track width and sleeper length
            var trackWidth = 5; // Distance between the two parallel lines
            var sleeperLength = 8; // Length of the sleepers
            var sleeperSpacing = 20; // Distance between sleepers

            // Calculate perpendicular vector for track width and sleeper direction
            var perpDx = unitDy;
            var perpDy = -unitDx;

            // Function to draw a line segment
            function drawLineSegment(x1, y1, x2, y2, width = 1, color = "black") {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.stroke();
            }

            // Draw parallel tracks
            for (let side = -1; side <= 1; side += 2) {
                let offsetX = perpDx * trackWidth * side * 2;
                let offsetY = perpDy * trackWidth * side * 2;
                // let offsetX = perpDx * trackWidth * side * 1;
                // let offsetY = perpDy * trackWidth * side * 1;
                drawLineSegment(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY, 1, color='white');
            }

            // Draw sleepers
            for (let dist = 0; dist <= length; dist += sleeperSpacing) {
                let sleeperCenterX = from.x + unitDx * dist;
                let sleeperCenterY = from.y + unitDy * dist;

                let sleeperStartX = sleeperCenterX - perpDx * sleeperLength / 1;
                let sleeperStartY = sleeperCenterY - perpDy * sleeperLength / 1;
                let sleeperEndX = sleeperCenterX + perpDx * sleeperLength / 1;
                let sleeperEndY = sleeperCenterY + perpDy * sleeperLength / 1;

                drawLineSegment(sleeperStartX, sleeperStartY, sleeperEndX, sleeperEndY, 10, color="white");
            }
        });

        vertices.forEach(function(vertex) {
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
            if (vertex.color === "red") {
                // ctx.fillStyle = "white";
                // ctx.fill();
                ctx.drawImage(icon_defender, vertex.x - 20, vertex.y - 25, 40, 40); // Adjust size as needed
            } else {
                // ctx.fillStyle = "white";
                // ctx.fill();
                ctx.drawImage(icon_junction, vertex.x - 30, vertex.y - 35, 60, 60); // Adjust size as needed
            }
        });
    }

    function findEdgesConnectedToVertex(vertex) {
        // Find the index of the vertex in the vertices array
        const vertexIndex = vertices.indexOf(vertex);
    
        // Filter the edges array to find edges connected to the given vertex
        const connectedEdges = edges.filter(edge => edge.from === vertexIndex || edge.to === vertexIndex);
    
        return connectedEdges;
    }


    canvas.addEventListener("click", function(event) {
        var rect = canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;

        if (playerTurn === 1) {            
            if (!putRedVertex) {
                changeRedVertexByEdge(clickX, clickY)
                console.log("Player 1 moved");
                drawGraph();
                if(movedRedVertices.length == currentRedVertices.length) {
                    switchPlayer();
                    currentRedVertices = movedRedVertices;
                    movedRedVertices = [];
                    exRedVertices = [];
                }
            } else if (putRedVertex) {
                colorVertex(clickX, clickY); // color the clicked vertex red by player 1 and push the colored vertex to currentRedVertices
            }
        } else if (playerTurn === 2) {
            colorEdge(clickX, clickY);
        }
    });

    player1pass_btn.addEventListener("click", function() {
        if(playerTurn === 1) {
            for(let vertex of currentRedVertices) {
                if(!exRedVertices.includes(vertex)) {
                    movedRedVertices.push(vertex);
                }
            }
            currentRedVertices = movedRedVertices;
            movedRedVertices = [];
            exRedVertices = [];
            switchPlayer();
        }
    }); 

    function getHoveredVertex(x, y) {
        for (let vertex of vertices) {
            let dx = vertex.x - x;
            let dy = vertex.y - y;
            if (dx * dx + dy * dy <= 100) { // Within radius
                return vertex;
            }
        }
        return null;
    }

    canvas.addEventListener("mousemove", function(event) {
        if(!putRedVertex)
            return;

        var rect = canvas.getBoundingClientRect();
        var hoverX = event.clientX - rect.left;
        var hoverY = event.clientY - rect.top;
        let hoveredVertex = getHoveredVertex(hoverX, hoverY);
        if (hoveredVertex) {
           eg = findEdgesConnectedToVertex(hoveredVertex);
           drawGraphEdgeWise(eg);
        } 
        else {
            drawGraph();
        }
    });

    function colorVertex(x, y) {
        for (let vertex of vertices) {
            let dx = vertex.x - x;
            let dy = vertex.y - y;
            if (dx * dx + dy * dy <= 100) { // Within radius
                if (vertex.color === "black" && countRedVertices() < parseInt(maxRedVerticesSelector.value)) {
                    vertex.color = "red";
                    drawGraph();
                    if (countRedVertices() === parseInt(maxRedVerticesSelector.value)) {
                        putRedVertex = false;
                        switchPlayer();
                        drawGraph();
                    }
                    currentRedVertices.push(vertex);
                    break;
                }
            }
        }
    }

    function colorEdge(x, y) {
        // if the click is near vertex, do nothing
        for (let vertex of vertices) {
            let dx = vertex.x - x;
            let dy = vertex.y - y;
            if (dx * dx + dy * dy <= 100) {
                return;
            }
        }

        console.log("Player 2 moved");

        for (let edge of edges) {
            let from = vertices[edge.from];
            let to = vertices[edge.to];
            if (isPointNearLine(x, y, from.x, from.y, to.x, to.y) && edge.color === "black") {
                if (from.color !== "red" && to.color !== "red") {
                    edge.color = "red";
                    drawGraph();
                    document.getElementById('bodyContainer').style.display = 'none';
                    document.getElementById('gameOverContainerAttackerWin').style.display = 'block';
                    return; // Player 2 wins, game over.
                } else if (from.color === "red" && to.color === "red") {
                    return;
                } else {

                    changeRedVertexByEdge(x, y);

                    switchPlayer();
                    drawGraph();
                    return;
                }
            }
        }

    }

    function changeRedVertexByEdge(x, y) {
        for (let edge of edges) {
            let from = vertices[edge.from];
            let to = vertices[edge.to];
            // if movedRedVertices includes either from or to, do nothing
            if (movedRedVertices.includes(from) || movedRedVertices.includes(to)) {
                console.log("Edge modified @ (c)");
                continue;
            }
            // Check if the click is near the edge
            if (isPointNearLine(x, y, from.x, from.y, to.x, to.y, 10)) {
                // console.log(movedRedVertices);
                // console.log(from);
                // console.log(to);
                // Check if one of the vertices is red
                if (from.color === "red" && to.color !== "red") {
                    // Change the red vertex to black and the other vertex to red
                    from.color = "black";
                    to.color = "red";
                    exRedVertices.push(from);
                    movedRedVertices.push(to);
                    console.log("Edge modified @ (a)");
                    drawGraph();
                    return true; // Edge interaction complete
                } else if (to.color === "red" && from.color !== "red") {
                    // Change the red vertex to black and the other vertex to red
                    to.color = "black";
                    from.color = "red";
                    exRedVertices.push(to);
                    movedRedVertices.push(from);
                    console.log("Edge modified @ (b)");
                    drawGraph();
                    return true; // Edge interaction complete
                }
                // If both or neither of the vertices are red, no action is performed
                return false; // No valid edge interaction
            }
        }
        return false; // No edge found near the click
    }
    
    function countRedVertices() {
        return vertices.filter(v => v.color === "red").length;
    }

    function switchPlayer() {
        playerTurn = playerTurn === 1 ? 2 : 1;
        console.log(`Player ${playerTurn} to move`);

        if(playerTurn === 1) {
            player1pass_btn.style.display = "block";
            status.innerHTML = "Defender's Turn";
            status.style.color = "black";
            status.style.backgroundColor = "#ffff00";

            // if maxRounds is complete, defender wins
            if(parseInt(maxRounds.value) === 1) {
                document.getElementById('bodyContainer').style.display = 'none';
                document.getElementById('gameOverContainerDefenderWin').style.display = 'block';
                return;
            }
            maxRounds.value = parseInt(maxRounds.value) - 1; 

            document.getElementById('moveDesc').innerHTML = 'Click on the &nbsp;<i>tracks</i>&nbsp; to move a builder across it.';
        }
        if(playerTurn === 2) {
            player1pass_btn.style.display = "none";
            status.innerHTML = "Attacker's Turn";
            status.style.color = "white";
            status.style.backgroundColor = "#ea0d0d";

            document.getElementById('moveDesc').innerHTML = 'Click on the &nbsp;<i>tracks</i>&nbsp; to attack.';
        }
    }

    function isPointNearLine(px, py, x1, y1, x2, y2) {
        let L2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        let r = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2;
        if (r < 0 || r > 1) {
            return false;
        }
        let s = ((y1 - py) * (x2 - x1) - (x1 - px) * (y2 - y1)) / L2;
        return (s * s) * L2 <= 100; // 100 is the tolerance, adjust as needed
    }

    // Function to resize the canvas to match the parent's dimensions
    function resizeCanvas() {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    // Resize the canvas 
    resizeCanvas();

    // load the icons, and on success, draw the graph
    function loadIcon(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    }
    Promise.all(iconPaths.map(loadIcon)).then(loadedIcons => {
        icons.push(...loadedIcons);
        icon_defender = icons[0];
        icon_junction = icons[1];
        drawGraph(); 
    }).catch(error => { console.error("An icon failed to load", error);});

    // drawGraph();
});
