const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    if (numValue < 0.01) return `$${numValue.toFixed(8)}`;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numValue);
};

const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return '0';
    if (numValue >= 1e12) return `$${(numValue / 1e12).toFixed(2)}T`;
    if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
    if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
    if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
    return numValue.toLocaleString('en-US');
};

const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.00%';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return '0.00%';
    const sign = numValue >= 0 ? '+' : '';
    return `${sign}${numValue.toFixed(2)}%`;
};

const formatLargeNumber = (value) => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return '0';
    if (numValue >= 1e12) return `${(numValue / 1e12).toFixed(2)}T`;
    if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(2)}B`;
    if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(2)}M`;
    if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(2)}K`;
    return numValue.toLocaleString('en-US');
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const getChangeClass = (value) => {
    if (value === null || value === undefined) return '';
    return value >= 0 ? 'positive' : 'negative';
};

const animateValue = (element, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        element.textContent = formatCurrency(current);
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};

const createElement = (tag, className, textContent) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
};

const showLoading = (container) => {
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
};

const showError = (container, message) => {
    container.innerHTML = `
        <div class="error-state">
            <p><strong>Error:</strong> ${message}</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="location.reload()">Retry</button>
        </div>
    `;
};

const showEmpty = (container, message) => {
    container.innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;
};

