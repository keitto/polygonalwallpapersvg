document.getElementById('generateVoronoi').addEventListener('click', generateVoronoi);
document.getElementById('generateDelaunay').addEventListener('click', generateDelaunay);
document.getElementById('export').addEventListener('click', exportSVG);

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

function generateVoronoi() {
    const width = getWidth();
    const height = getHeight();
    const numPoints = getPoints();
    const colorPalette = getColorPalette();
    const points = d3.range(numPoints).map(() => [Math.random() * width, Math.random() * height]);
    const voronoi = d3.Delaunay.from(points).voronoi([0, 0, width, height]);
    const gradRandomDir = getGradRandomDir();
    const gradDirection = getGradDirection();

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
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * 255));
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
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * 255)); 
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
    a.download = 'voronoi.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
