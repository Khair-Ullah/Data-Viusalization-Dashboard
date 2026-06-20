import { drawLineChart, drawBarChart, drawDonutChart, drawScatterChart } from './charts.js';
import { setLoading, debounce, exportToCSV, exportAsPNG } from './utils.js';

// State
let currentData = null;
let filters = { startDate: null, endDate: null, categories: [], regions: [] };

// DOM elements
const lineSvg = document.getElementById('line-chart');
const barSvg = document.getElementById('bar-chart');
const donutSvg = document.getElementById('donut-chart');
const scatterSvg = document.getElementById('scatter-chart');
const dateRangeInput = document.getElementById('date-range');
const categorySelect = document.getElementById('category-filter');
const regionSelect = document.getElementById('region-filter');
const applyBtn = document.getElementById('apply-filters');
const resetBtn = document.getElementById('reset-filters');
const lastUpdatedSpan = document.getElementById('last-updated');

// Flatpickr init
let flatpickrInstance = flatpickr(dateRangeInput, {
    mode: 'range',
    dateFormat: 'Y-m-d',
    onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
            filters.startDate = flatpickrInstance.formatDate(selectedDates[0], 'Y-m-d');
            filters.endDate = flatpickrInstance.formatDate(selectedDates[1], 'Y-m-d');
        } else {
            filters.startDate = filters.endDate = null;
        }
    }
});

// Initialize dashboard
async function init() {
    await fetchFiltersAndData();
    setupEventListeners();
    startAutoRefresh();
}

async function fetchFiltersAndData() {
    try {
        setLoading(lineSvg, true);
        const response = await fetch('/api/data');
        const data = await response.json();
        currentData = data;

        // Populate filter dropdowns
        populateMultiSelect(categorySelect, data.filters.categories);
        populateMultiSelect(regionSelect, data.filters.regions);

        // Set flatpickr min/max
        flatpickrInstance.set('minDate', data.filters.dateRange.min);
        flatpickrInstance.set('maxDate', data.filters.dateRange.max);

        // Draw charts
        drawAllCharts(data);
        
        // to render KPIs based on the initial data load
        updateKPIs(data); 
        
        lastUpdatedSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Check console.');
    } finally {
        setLoading(lineSvg, false);
    }
}

// to update KPIs based on the current data, especially after filters are applied
function updateKPIs(data) {
    if (!data || !data.line || !data.line.totals) return;
    
    const totalRevenue = data.line.totals.reduce((a, b) => a + b, 0);
    const totalOrders = data.scatter ? data.scatter.length : 0; 
    const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    // Local currency formatting fallback
    const formatCurrencyLocal = (value) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    document.getElementById('kpi-revenue').textContent = formatCurrencyLocal(totalRevenue);
    document.getElementById('kpi-orders').textContent = totalOrders.toLocaleString();
    document.getElementById('kpi-aov').textContent = formatCurrencyLocal(avgOrder);
    document.getElementById('kpi-time').textContent = new Date().toLocaleTimeString();
}

function populateMultiSelect(selectEl, options) {
    selectEl.innerHTML = '';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        selectEl.appendChild(option);
    });
}

function drawAllCharts(data) {
    drawLineChart(lineSvg, data.line);
    drawBarChart(barSvg, data.bar);
    drawDonutChart(donutSvg, data.donut);
    drawScatterChart(scatterSvg, data.scatter);
}

async function applyFilters() {
    filters.categories = Array.from(categorySelect.selectedOptions).map(o => o.value);
    filters.regions = Array.from(regionSelect.selectedOptions).map(o => o.value);

    const params = new URLSearchParams();
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    filters.categories.forEach(c => params.append('category', c));
    filters.regions.forEach(r => params.append('region', r));

    try {
        setLoading(lineSvg, true);
        const response = await fetch('/api/data?' + params.toString());
        const data = await response.json();
        currentData = data;
        drawAllCharts(data);
        updateKPIs(data); // Filter hone par KPIs phir se update honge
        lastUpdatedSpan.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error applying filters:', error);
    } finally {
        setLoading(lineSvg, false);
    }
}

function resetFilters() {
    flatpickrInstance.clear();
    categorySelect.selectedIndex = -1;
    regionSelect.selectedIndex = -1;
    filters = { startDate: null, endDate: null, categories: [], regions: [] };
    applyFilters();
}

// Event listeners
function setupEventListeners() {
    applyBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('#theme-toggle');
        icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        if (currentData) drawAllCharts(currentData);
    });

    document.getElementById('export-csv').addEventListener('click', () => {
        alert('CSV export would fetch raw data. Implement an /api/raw endpoint.');
    });

    document.getElementById('export-png').addEventListener('click', async () => {
        await exportAsPNG(document.querySelector('.dashboard-grid'));
    });

    document.querySelectorAll('.chart-refresh').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chart = e.currentTarget.dataset.chart;
            if (currentData) {
                if (chart === 'line') drawLineChart(lineSvg, currentData.line);
                else if (chart === 'bar') drawBarChart(barSvg, currentData.bar);
                else if (chart === 'donut') drawDonutChart(donutSvg, currentData.donut);
                else if (chart === 'scatter') drawScatterChart(scatterSvg, currentData.scatter);
            }
        });
    });

    window.addEventListener('resize', debounce(() => {
        if (currentData) drawAllCharts(currentData);
    }, 250));
}

function startAutoRefresh() {
    setInterval(() => {
        applyFilters(); 
    }, 60000); 
}

init();