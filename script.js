document.getElementById('generateVoronoi').addEventListener('click', generateVoronoi);
document.getElementById('generateDelaunay').addEventListener('click', generateDelaunay);
document.getElementById('export').addEventListener('click', exportSVG);

document.addEventListener("DOMContentLoaded", function() {
    const colorsDiv = document.getElementById("colors");
    const addColorButton = document.getElementById("addColorButton");
    const addGoldsButton = document.getElementById("addGoldsButton");
    const addDarksButton = document.getElementById("addDarksButton");
    const addLightsButton = document.getElementById("addLightsButton");
    const clearAllColorsButton = document.getElementById("clearAllColorsButton");

    // Function to add a remove button to a label
    function addRemoveButton(label) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "x";
        removeButton.className = "remove-button";
        removeButton.addEventListener("click", function() {
            colorsDiv.removeChild(label);
        });
        label.appendChild(removeButton);
    }

    // Initialize the color inputs from the defaultColors array
    defaultColors.forEach(color => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "color";
        input.className = "color-picker";
        input.value = color;
        label.appendChild(input);
        addRemoveButton(label);
        colorsDiv.appendChild(label);
    });

    function addColor(color) {
        const newLabel = document.createElement("label");
        const input = document.createElement("input");
        input.type = "color";
        input.className = "color-picker";
        input.value = color;
        newLabel.appendChild(input);
        addRemoveButton(newLabel);
        colorsDiv.appendChild(newLabel);
    }
    // Add new color input
    addColorButton.addEventListener("click", function() {
        const newLabel = document.createElement("label");
        const input = document.createElement("input");
        input.type = "color";
        input.className = "color-picker";
        newLabel.appendChild(input);
        addRemoveButton(newLabel);
        colorsDiv.appendChild(newLabel);
    });

    addGoldsButton.addEventListener("click", function() {
        defaultColors.slice(0, 5).forEach(color => {
            addColor(color);
        });
    });
    addDarksButton.addEventListener("click", function() {
        defaultColors.slice(5, 10).forEach(color => {
            addColor(color);
        });
    });
    addLightsButton.addEventListener("click", function() {
        defaultColors.slice(10, 15).forEach(color => {
            addColor(color);
        });
    });
    clearAllColorsButton.addEventListener("click", function() {
        colorsDiv.innerHTML = "";
    });
    
});

const defaultColors = [
    // golds
    "#ad9d7d",
    "#c2b59d",
    "#99845c",
    "#7a6a4a",
    "#5c4f37",

    // darks
    "#5d6161",
    "#868889",
    "#35393A",
    "#2a2e2e",
    "#202223",

    // lights
    "#c1c8cd",
    "#d1d6d9",
    "#B2BAC0",
    "#8e959a",
    "#6b7073"    
];

function getColorPalette() {
    const colorPickers = document.querySelectorAll('.color-picker');
    return Array.from(colorPickers).map(picker => picker.value);
}

function getDarkenValue() {
    const darkenValue = document.getElementById('darken').value;
    return Number(darkenValue);
}

function getWidth() {
    const width = document.getElementById('width').value;
    return Number(width);
}

function getHeight() {
    const height = document.getElementById('height').value;
    return Number(height);
}

function getPoints() {
    const points = document.getElementById('points').value;
    return Number(points);
}

function getGradRandomDir() {
    const gradRandomDir = document.getElementById('gradRandomDir').checked;
    return gradRandomDir;
}

function getGradDirection() {
    const gradDirection = document.getElementById('gradDirection').value;
    return gradDirection;
}

function darkenColor(color, amount) {
    const usePound = color[0] === "#";
    let col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;

    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;

    return (usePound ? "#" : "") + (r.toString(16).padStart(2, '0')) + (g.toString(16).padStart(2, '0')) + (b.toString(16).padStart(2, '0'));
}

function radToXyxy(rad) {
    const x1 = Math.cos(rad);
    const y1 = Math.sin(rad);
    const x2 = -x1;
    const y2 = -y1;

    return { x1, y1, x2, y2 };
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
function tryFixDelaunay() {
    const delaunayFix = document.getElementById('delaunayFix').checked;
    return delaunayFix;
}

function generateVoronoi() {
    const width = getWidth();
    const height = getHeight();
    const numPoints = getPoints();
    const colorPalette = getColorPalette();
    const points = d3.range(numPoints).map(() => [Math.random() * width, Math.random() * height]);
    const voronoi = d3.Delaunay.from(points).voronoi([0, 0, width, height]);
    const gradRandomDir = getGradRandomDir();
    const gradDirection = getGradDirection();
    //const isRadial = getGradRadial();

    d3.select('svg').remove();

    const svg = d3.select('#container').append('svg')
        .attr('viewBox', [0, 0, width, height]);

    // Function to calculate gradient direction

    function getGradientDirection() {
        let angle;
        if (gradRandomDir) {
            angle = Math.random() * 360; // Random angle
        } else {
            angle = gradDirection % 360; // Set angle
        }
        return radToXyxy(angle * (Math.PI / 180));
    }
    const test = gradRandomDir ? radToXyxy(Math.random() * 2 * Math.PI) : radToXyxy(gradDirection % 2 * (Math.PI));
    

    // Define gradients
    const defs = svg.append('defs');
    colorPalette.forEach((color, i) => {
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * -255));
        const { x1, y1, x2, y2 } = getGradientDirection();

        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${i}`)
            .attr('x1', `${(x1 + 1) / 2 * 100}%`)
            .attr('y1', `${(y1 + 1) / 2 * 100}%`)
            .attr('x2', `${(x2 + 1) / 2 * 100}%`)
            .attr('y2', `${(y2 + 1) / 2 * 100}%`);
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', darkerColor);
    });

    // Draw Voronoi cells
    svg.append('g')
        .selectAll('path')
        .data(points)
        .enter().append('path')
        .attr('d', (d, i) => voronoi.renderCell(i))
        .attr('fill', (d, i) => `url(#gradient-${i % colorPalette.length})`);
}

function generateDelaunay() {
    const width = getWidth();
    const height = getHeight();
    const numPoints = getPoints();
    const colorPalette = getColorPalette();
    const points = d3.range(numPoints).map(() => [Math.random() * width, Math.random() * height]);
    // if generateEdges is true, add points to each corner and 2 points to each edge
    const generateEdges = tryFixDelaunay();
    if (generateEdges) {
        const edgePoints = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height],

            /*
            [0, height / 2],
            [width, height / 2],
            [width / 2, 0],
            [width / 2, height]
            */
            // 2 points per edge
            [0, height / 3],
            [0, 2 * height / 3],
            [width, height / 3],
            [width, 2 * height / 3],
            [width / 3, 0],
            [2 * width / 3, 0],
            [width / 3, height],
            [2 * width / 3, height]
        ];
        edgePoints.forEach(point => points.push(point));
    }


    const delaunay = d3.Delaunay.from(points);
    const triangles = delaunay.triangles;
    const gradRandomDir = getGradRandomDir();
    const gradDirection = getGradDirection();



    d3.select('svg').remove();

    const svg = d3.select('#container').append('svg')
        .attr('viewBox', [0, 0, width, height]);

    // Define gradients
    const defs = svg.append('defs');
    colorPalette.forEach((color, i) => {
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * -255)); 
        const { x1, y1, x2, y2 } = gradRandomDir ? radToXyxy(Math.random() * 2 * Math.PI) : radToXyxy(gradDirection % 2 * (Math.PI));
        
        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${i}`)
            .attr('x1', `${(x1 + 1) / 2 * 100}%`)
            .attr('y1', `${(y1 + 1) / 2 * 100}%`)
            .attr('x2', `${(x2 + 1) / 2 * 100}%`)
            .attr('y2', `${(y2 + 1) / 2 * 100}%`);
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color',darkerColor);
        });
    
        // Draw Delaunay triangles
        svg.append('g')
            .selectAll('path')
            .data(d3.range(triangles.length / 3))
            .enter().append('path')
            .attr('d', i => {
                const p0 = points[triangles[i * 3]];
                const p1 = points[triangles[i * 3 + 1]];
                const p2 = points[triangles[i * 3 + 2]];
                return `M${p0[0]},${p0[1]}L${p1[0]},${p1[1]}L${p2[0]},${p2[1]}Z`;
            })
            .attr('fill', (d, i) => `url(#gradient-${i % colorPalette.length})`)
            ;
    }

function exportSVG() {
    const svgElement = document.querySelector('svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'voronoi.svg';// TODO: can also be delaunay
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}