import { formatCurrency } from './utils.js';

// Create a tooltip div
const tooltip = d3.select('body').append('div')
    .attr('class', 'd3-tooltip')
    .style('opacity', 0);

function showTooltip(event, html) {
    tooltip.html(html)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .style('opacity', 1);
}
function hideTooltip() {
    tooltip.style('opacity', 0);
}

// Line Chart
export function drawLineChart(svgElement, data) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    if (!data.dates.length) {
        svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data');
        return;
    }

    const width = svgElement.clientWidth || 900;
    const height = svgElement.clientHeight || 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse('%Y-%m-%d');
    const chartData = data.dates.map((d, i) => ({ date: parseDate(d), total: data.totals[i] }));

    const x = d3.scaleTime()
        .domain(d3.extent(chartData, d => d.date))
        .range([0, innerWidth]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.total) * 1.05])
        .range([innerHeight, 0]);

    // Axes
    g.append('g').attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')))
        .selectAll('text').attr('transform', 'rotate(-30)').style('text-anchor', 'end');
    g.append('g').call(d3.axisLeft(y).tickFormat(d => formatCurrency(d)));

    // Line
    const line = d3.line().x(d => x(d.date)).y(d => y(d.total));
    g.append('path').datum(chartData)
        .attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 2.5)
        .attr('d', line);

    // Dots with tooltip
    g.selectAll('.dot').data(chartData).enter().append('circle')
        .attr('cx', d => x(d.date)).attr('cy', d => y(d.total))
        .attr('r', 5).attr('fill', 'steelblue').attr('stroke', 'white').attr('stroke-width', 1)
        .on('mouseover', (event, d) => {
            showTooltip(event, `<strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong><br>${formatCurrency(d.total)}`);
        })
        .on('mousemove', (event) => {
            tooltip.style('left', (event.pageX+15)+'px').style('top', (event.pageY-28)+'px');
        })
        .on('mouseout', hideTooltip);

    // Labels
    g.append('text').attr('x', innerWidth/2).attr('y', innerHeight+40).attr('text-anchor', 'middle').text('Date');
    g.append('text').attr('transform', 'rotate(-90)').attr('y', -50).attr('x', -innerHeight/2)
        .attr('text-anchor', 'middle').text('Revenue');
}

// Bar Chart
export function drawBarChart(svgElement, data) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    if (!data.length) {
        svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data');
        return;
    }

    const width = svgElement.clientWidth || 500;
    const height = svgElement.clientHeight || 350;
    const margin = { top: 30, right: 20, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map(d => d.category)).range([0, innerWidth]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.total) * 1.05]).range([innerHeight, 0]);

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x))
        .selectAll('text').attr('transform', 'rotate(-30)').style('text-anchor', 'end');
    g.append('g').call(d3.axisLeft(y).tickFormat(d => formatCurrency(d)));

    g.selectAll('.bar').data(data).enter().append('rect')
        .attr('x', d => x(d.category)).attr('y', d => y(d.total))
        .attr('width', x.bandwidth()).attr('height', d => innerHeight - y(d.total))
        .attr('fill', '#f59e0b')
        .on('mouseover', (event, d) => showTooltip(event, `<strong>${d.category}</strong><br>${formatCurrency(d.total)}`))
        .on('mousemove', (event) => tooltip.style('left', (event.pageX+15)+'px').style('top', (event.pageY-28)+'px'))
        .on('mouseout', hideTooltip);
}

// Donut Chart
export function drawDonutChart(svgElement, data) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    if (!data.length) {
        svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data');
        return;
    }

    const width = svgElement.clientWidth || 500;
    const height = svgElement.clientHeight || 350;
    const radius = Math.min(width, height) / 2.2;
    const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
    const labelArc = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

    const arcs = g.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');

    arcs.append('path').attr('d', arc).attr('fill', d => color(d.data.label))
        .on('mouseover', (event, d) => showTooltip(event, `<strong>${d.data.label}</strong><br>${formatCurrency(d.data.value)}`))
        .on('mousemove', (event) => tooltip.style('left', (event.pageX+15)+'px').style('top', (event.pageY-28)+'px'))
        .on('mouseout', hideTooltip);

    // Labels
    arcs.append('text').attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .text(d => d.data.label.length > 8 ? d.data.label.substring(0,8)+'…' : d.data.label);
}

// Scatter Plot
export function drawScatterChart(svgElement, data) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    if (!data.length) {
        svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data');
        return;
    }

    const width = svgElement.clientWidth || 700;
    const height = svgElement.clientHeight || 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.amount) * 1.05]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.quantity) * 1.05]).range([innerHeight, 0]);

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    g.selectAll('circle').data(data).enter().append('circle')
        .attr('cx', d => x(d.amount)).attr('cy', d => y(d.quantity))
        .attr('r', 5).attr('fill', '#10b981').attr('opacity', 0.6)
        .on('mouseover', (event, d) => showTooltip(event, `Amount: ${formatCurrency(d.amount)}<br>Qty: ${d.quantity}`))
        .on('mousemove', (event) => tooltip.style('left', (event.pageX+15)+'px').style('top', (event.pageY-28)+'px'))
        .on('mouseout', hideTooltip);

    g.append('text').attr('x', innerWidth/2).attr('y', innerHeight+40).attr('text-anchor', 'middle').text('Amount ($)');
    g.append('text').attr('transform', 'rotate(-90)').attr('y', -40).attr('x', -innerHeight/2)
        .attr('text-anchor', 'middle').text('Quantity');
}