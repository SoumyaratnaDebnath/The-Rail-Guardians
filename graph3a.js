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
    document.getElementById('mainMenu1').href = "main_menu.html?mode=" + mode;

    document.getElementById('popup').style.display = 'block'; // to be changed to block

    var canvas = document.getElementById("graphCanvas"); // the canvas
    var parent = canvas.parentElement;
    var player1pass_btn = document.getElementById("player1pass"); // button that layer 1 can use when he do not want to change any config
    var ctx = canvas.getContext("2d"); // getting the canvas
    var maxRedVerticesSelector = document.getElementById("maxRedVertices");
    var maxEnergySelector = document.getElementById("maxEnergy");
    var playerTurn = 1; // 1 for Player 1, 2 for Player 2
    var putRedVertex = true;
    var status = document.getElementById("status");
    var MovementCount = 0;

    var vertices = [
        {x: 400, y: 400, color: "black", neighbors: [1], energy : 0}, //0
        {x: 400, y: 250, color: "black", neighbors: [2], energy : 0}, //1
        {x: 550, y: 100, color: "black", neighbors: [3], energy : 0}, //1
        {x: 700, y: 250, color: "black", neighbors: [4], energy : 0}, //1
        {x: 700, y: 400, color: "black", neighbors: [], energy : 0}, //1
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

        vertices.forEach(function(vertex, index) {
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
            if (vertex.color === "red") {
                ctx.drawImage(icon_defender, vertex.x - 20, vertex.y - 25, 40, 40); // Adjust size as needed
            } else {
                ctx.drawImage(icon_junction, vertex.x - 30, vertex.y - 35, 60, 60); // Adjust size as needed
            }
        
            // Label settings
            const fontSize = 14; // Font size in pixels
            ctx.font = `${fontSize}px Arial`; // Adjust font size and family as needed
            const text = `${vertex.energy}`; // The text to draw
            const textWidth = ctx.measureText(text).width; // Measure the text width for background sizing
            const padding = 10; // Padding around the text for background
            const backgroundRadii = textWidth / 2 + padding; // Calculate half of the background width (ellipse's horizontal radius)
            const centerX = vertex.x; // Center the background on the vertex horizontally
            const centerY = vertex.y - fontSize - 35; // Position the center of the ellipse above the vertex

            if(vertex.color === "red") {
                // Draw text background ellipse
                if (vertex.energy !== 0) ctx.fillStyle = "#eb4034"; 
                else ctx.fillStyle = "black";

                ctx.beginPath();
                ctx.ellipse(centerX, centerY, backgroundRadii, backgroundRadii, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Draw label text above each vertex
                ctx.fillStyle = "white"; // Text color
                ctx.textAlign = "center"; // Center the text on the x coordinate
                ctx.fillText(text, centerX, centerY + fontSize / 3); // Adjust text position as needed
            }

            // // Label settings
            // const fontSize = 12; // Font size in pixels
            // ctx.font = `${fontSize}px Arial`; // Adjust font size and family as needed
            // const text = `${vertex.energy}`; // The text to draw
            // const textWidth = ctx.measureText(text).width; // Measure the text width for background sizing
            // const padding = 4; // Padding around the text for background
            // const backgroundHeight = fontSize + padding * 2; // Calculate background height
            // const backgroundWidth = textWidth + padding * 2; // Calculate background width
            // const backgroundX = vertex.x - backgroundWidth / 2; // Center the background on the vertex
            // const backgroundY = vertex.y - fontSize - 42; // Position the background above the vertex
            
            // if(vertex.color === "red") {
            //     // Draw text background
            //     if (vertex.energy !== 0) ctx.fillStyle = "#2f632f"; 
            //     else ctx.fillStyle = "#eb4034";
            //     ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
            
            //     // Draw label text above each vertex
            //     ctx.fillStyle = "white"; // Text color
            //     ctx.textAlign = "center"; // Center the text on the x coordinate
            //     ctx.fillText(text, vertex.x, vertex.y - 40); // Adjust text position as needed
            // }

        });
        
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
                if(movedRedVertices.length == currentRedVertices.length && currentRedVertices.length > 1) {
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
            // if passed without moving any builder, then decrease the energy of the node with the maximum energy by 1
            if(movedRedVertices.length === 1) {
                // find the node with the maximum energy
                var maxEnergy = 0;
                var maxEnergyVertex = null;
                vertices.forEach(vertex => {
                    if(vertex.energy > maxEnergy) {
                        maxEnergy = vertex.energy;
                        maxEnergyVertex = vertex;
                    }
                });
                // decrease the energy of the node with the maximum energy by 1
                if(maxEnergyVertex !== null) {
                    maxEnergyVertex.energy--;
                }
                drawGraph();
            }

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

    function colorVertex(x, y) {
        for (let vertex of vertices) {
            let dx = vertex.x - x;
            let dy = vertex.y - y;
            if (dx * dx + dy * dy <= 100) { // Within radius
                if (vertex.color === "black" && countRedVertices() < parseInt(maxRedVerticesSelector.value)) {
                    vertex.color = "red";
                    vertex.energy = parseInt(maxEnergySelector.value);
                    drawGraph();
                    if (countRedVertices() === parseInt(maxRedVerticesSelector.value)) {
                        putRedVertex = false;
                        switchPlayer();
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

                    document.getElementById('game_over_text').innerHTML = "The attacker has found a gap.<br> The Defender has Defended for <b>" + MovementCount + "</b> rounds.";
                    document.getElementById('bodyContainer').style.display = 'none';
                    document.getElementById('gameOverContainer').style.display = 'block';

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
                    if(from.energy > 0) {
                        // Change the red vertex to black and the other vertex to red
                        from.color = "black";
                        to.color = "red";
                        exRedVertices.push(from);
                        movedRedVertices.push(to);
                        console.log("Edge modified @ (a)");
                        drawGraph();
                        if(playerTurn === 1) {
                            to.energy = from.energy - 1;
                        }
                        else {
                            to.energy = from.energy;
                        }
                        from.energy = 0;
                        return true; // Edge interaction complete
                    }
                } else if (to.color === "red" && from.color !== "red") {
                    if(to.energy > 0) {
                        // Change the red vertex to black and the other vertex to red
                        to.color = "black";
                        from.color = "red";
                        exRedVertices.push(to);
                        movedRedVertices.push(from);
                        console.log("Edge modified @ (b)");
                        drawGraph();
                        if(playerTurn === 1) {
                            from.energy = to.energy - 1;
                        }
                        else {
                            from.energy = to.energy;
                        }
                        to.energy = 0;
                        return true; // Edge interaction complete
                    }
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
        // check if energy of all the vertices is 0, then game over
        var aliveCount = 0;
        var maxRedVertices = parseInt(maxRedVerticesSelector.value);
        vertices.forEach(vertex => {
            if (vertex.energy > 0) {
                aliveCount++;
            }
        });

        if (aliveCount < maxRedVertices && putRedVertex === false) {
            document.getElementById('game_over_text').innerHTML = "The enegy of a Defender is Zero. <br> The Defender has Defended for <b>" + MovementCount + "</b> rounds.";
            document.getElementById('bodyContainer').style.display = 'none';
            document.getElementById('gameOverContainer').style.display = 'block';
        }

        playerTurn = playerTurn === 1 ? 2 : 1;
        console.log(`Player ${playerTurn} to move`);

        if(playerTurn === 1) {
            player1pass_btn.style.display = "block";
            status.innerHTML = "Defender's Turn";
            status.style.color = "black";
            status.style.backgroundColor = "#ffff00";

            MovementCount++;

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
