// Show/hide loading state
export function setLoading(container, isLoading) {
    const parent = container.closest('.card-body') || container;
    if (isLoading) {
        parent.classList.add('loading');
    } else {
        parent.classList.remove('loading');
    }
}

// Format currency
export const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export to CSV
export function exportToCSV(data, filename = 'dashboard-data.csv') {
    // We'll implement based on current filtered data
    const rows = [];
    // Add headers from first object keys
    if (data.length) {
        const headers = Object.keys(data[0]);
        rows.push(headers.join(','));
        data.forEach(row => {
            const values = headers.map(h => JSON.stringify(row[h] || ''));
            rows.push(values.join(','));
        });
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Export dashboard as PNG
export async function exportAsPNG(element) {
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: null });
    const link = document.createElement('a');
    link.download = 'dashboard.png';
    link.href = canvas.toDataURL();
    link.click();
}