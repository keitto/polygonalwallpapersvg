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

function getCells() {
    const cells = document.getElementById('cells').value;
    return Number(cells);
}

function darkenColor(color, amount) {
    const usePound = color[0] === "#";
    let col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    return (usePound ? "#" : "") + (r.toString(16).padStart(2, '0')) + (g.toString(16).padStart(2, '0')) + (b.toString(16).padStart(2, '0'));
}

function generateVoronoi() {
    const width = getWidth();
    const height = getHeight();
    const numPoints = getCells();
    const colorPalette = getColorPalette();
    const points = d3.range(numPoints).map(() => [Math.random() * width, Math.random() * height]);
    const voronoi = d3.Delaunay.from(points).voronoi([0, 0, width, height]);

    d3.select('svg').remove();

    const svg = d3.select('#container').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define gradients
    const defs = svg.append('defs');
    colorPalette.forEach((color, i) => {
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * 255)); 
        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${i}`)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');
        
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
        .attr('fill', (d, i) => `url(#gradient-${i % colorPalette.length})`)
        //.attr('stroke', 'black')
        ;
}

function generateDelaunay() {
    const width = getWidth();
    const height = getHeight();
    const numPoints = getCells();
    const colorPalette = getColorPalette();
    const points = d3.range(numPoints).map(() => [Math.random() * width, Math.random() * height]);
    const delaunay = d3.Delaunay.from(points);
    const triangles = delaunay.triangles;

    d3.select('svg').remove();

    const svg = d3.select('#container').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define gradients
    const defs = svg.append('defs');
    colorPalette.forEach((color, i) => {
        const darkerColor = darkenColor(color, Math.round(getDarkenValue() * 255)); 
        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${i}`)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');
        
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
            //.attr('stroke', 'black')
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
