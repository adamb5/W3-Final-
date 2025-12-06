let currentView = 'market';
let marketData = [];
let filteredMarketData = [];
let coinList = [];
let expandedRows = new Set();
let marketRefreshInterval = null;

const init = () => {
    setupNavigation();
    setupSearch();
    setupPortfolioForm();
    loadMarketData();
    loadCoinList();
    startMarketAutoRefresh();
};

const startMarketAutoRefresh = () => {
    if (marketRefreshInterval) clearInterval(marketRefreshInterval);
    marketRefreshInterval = setInterval(() => {
        if (currentView === 'market') {
            loadMarketData(true);
        }
    }, 60000);
};

const setupNavigation = () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchView('market');
        });
    }
};

const switchView = (viewName) => {
    currentView = viewName;
    
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    const targetNavBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (targetNavBtn) {
        targetNavBtn.classList.add('active');
    }
    
    if (viewName === 'portfolio') {
        loadPortfolioView();
    } else if (viewName === 'trending') {
        loadTrendingView();
    } else if (viewName === 'market') {
        loadMarketData();
    }
};

const setupSearch = () => {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                searchClear.style.display = 'block';
                debounceSearch(query);
            } else {
                searchClear.style.display = 'none';
                filteredMarketData = marketData;
                renderMarketData();
            }
        });
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            filteredMarketData = marketData;
            renderMarketData();
        });
    }
};

const debounceSearch = debounce((query) => {
    if (currentView === 'market') {
        filteredMarketData = marketData.filter(coin => 
            coin.name.toLowerCase().includes(query.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(query.toLowerCase())
        );
        renderMarketData();
    }
}, 300);

const loadCoinList = async () => {
    try {
        coinList = await fetchCoinList();
    } catch (error) {
        console.error('Failed to load coin list:', error);
    }
};

const loadMarketData = async (forceRefresh = false) => {
    const container = document.getElementById('market-content');
    if (!container) return;
    
    if (!forceRefresh) {
        showLoading(container);
    }
    
    try {
        marketData = await fetchMarketData(1, 100, forceRefresh);
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            filteredMarketData = marketData.filter(coin => 
                coin.name.toLowerCase().includes(query) ||
                coin.symbol.toLowerCase().includes(query)
            );
        } else {
            filteredMarketData = marketData;
        }
        renderMarketData();
    } catch (error) {
        if (!forceRefresh) {
            showError(container, 'Failed to load market data. Please try again later.');
        }
    }
};

const renderMarketData = () => {
    const container = document.getElementById('market-content');
    if (!container) return;
    
    if (filteredMarketData.length === 0) {
        showEmpty(container, 'No cryptocurrencies found.');
        return;
    }
    
    container.innerHTML = `
        <div class="market-table-container">
            <table class="market-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>#</th>
                        <th>Coin</th>
                        <th class="sortable" data-sort="current_price">Price</th>
                        <th class="sortable" data-sort="price_change_percentage_24h">24h</th>
                        <th class="sortable" data-sort="price_change_percentage_7d_in_currency">7d</th>
                        <th class="sortable" data-sort="price_change_percentage_30d_in_currency">30d</th>
                        <th>7d Chart</th>
                        <th class="sortable" data-sort="market_cap">Market Cap</th>
                        <th class="sortable" data-sort="total_volume">Volume</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredMarketData.map((coin, index) => {
                        const isExpanded = expandedRows.has(coin.id);
                        const sparkline = coin.sparkline_in_7d?.price || [];
                        return `
                        <tr class="coin-row ${isExpanded ? 'expanded' : ''}" data-coin-id="${coin.id}">
                            <td class="expand-cell">
                                <button class="expand-btn" data-coin-id="${coin.id}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="${isExpanded ? 'M18 15l-6-6-6 6' : 'M9 18l6-6-6-6'}"></path>
                                    </svg>
                                </button>
                            </td>
                            <td>${index + 1}</td>
                            <td>
                                <div class="coin-info">
                                    <img src="${coin.image}" alt="${coin.name}" class="coin-icon" onerror="this.style.display='none'">
                                    <div>
                                        <div class="coin-name">${coin.name}</div>
                                        <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="coin-price">${formatCurrency(coin.current_price)}</td>
                            <td class="${getChangeClass(coin.price_change_percentage_24h)}">
                                ${formatPercentage(coin.price_change_percentage_24h)}
                            </td>
                            <td class="${getChangeClass(coin.price_change_percentage_7d_in_currency)}">
                                ${formatPercentage(coin.price_change_percentage_7d_in_currency)}
                            </td>
                            <td class="${getChangeClass(coin.price_change_percentage_30d_in_currency)}">
                                ${formatPercentage(coin.price_change_percentage_30d_in_currency)}
                            </td>
                            <td class="sparkline-cell">
                                ${sparkline.length > 0 ? renderSparkline(sparkline, coin.price_change_percentage_7d_in_currency) : '-'}
                            </td>
                            <td>${formatNumber(coin.market_cap)}</td>
                            <td>${formatNumber(coin.total_volume)}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary add-portfolio-btn" data-coin-id="${coin.id}" onclick="event.stopPropagation(); addCoinToPortfolioQuick('${coin.id}')">
                                    Add
                                </button>
                            </td>
                        </tr>
                        ${isExpanded ? `
                        <tr class="coin-detail-row" data-coin-id="${coin.id}">
                            <td colspan="11">
                                <div class="expanded-details">
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <span class="detail-label">Circulating Supply</span>
                                            <span class="detail-value">${formatLargeNumber(coin.circulating_supply || 0)} ${coin.symbol.toUpperCase()}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Total Supply</span>
                                            <span class="detail-value">${coin.total_supply ? formatLargeNumber(coin.total_supply) + ' ' + coin.symbol.toUpperCase() : 'N/A'}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">24h High</span>
                                            <span class="detail-value">${formatCurrency(coin.high_24h)}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">24h Low</span>
                                            <span class="detail-value">${formatCurrency(coin.low_24h)}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">All-Time High</span>
                                            <span class="detail-value">${formatCurrency(coin.ath)}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">All-Time Low</span>
                                            <span class="detail-value">${formatCurrency(coin.atl)}</span>
                                        </div>
                                    </div>
                                    <div class="detail-actions">
                                        <button class="btn btn-primary view-details-btn" data-coin-id="${coin.id}">View Full Details</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ` : ''}
                    `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    setupTableSorting();
    setupCoinRowClicks();
    setupExpandButtons();
    setupViewDetailsButtons();
};

const setupViewDetailsButtons = () => {
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const coinId = btn.dataset.coinId;
            if (coinId) {
                showCoinDetails(coinId);
            }
        });
    });
};

const renderSparkline = (prices, changePercent) => {
    if (!prices || prices.length === 0) return '-';
    if (prices.length === 1) {
        const x = 50;
        const y = 15;
        const isPositive = (changePercent || 0) >= 0;
        const color = isPositive ? '#10b981' : '#ef4444';
        return `<svg width="100" height="30" class="sparkline"><circle cx="${x}" cy="${y}" r="2" fill="${color}"/></svg>`;
    }
    
    const width = 100;
    const height = 30;
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const points = prices.map((price, index) => {
        const x = padding + (index / (prices.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        return `${x},${y}`;
    });
    
    const pathData = `M ${points.join(' L ')}`;
    const isPositive = (changePercent || 0) >= 0;
    const color = isPositive ? '#10b981' : '#ef4444';
    
    return `<svg width="${width}" height="${height}" class="sparkline"><path d="${pathData}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

const setupExpandButtons = () => {
    const expandBtns = document.querySelectorAll('.expand-btn');
    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const coinId = btn.dataset.coinId;
            if (expandedRows.has(coinId)) {
                expandedRows.delete(coinId);
            } else {
                expandedRows.add(coinId);
            }
            renderMarketData();
        });
    });
};

const addCoinToPortfolioQuick = (coinId) => {
    const quantity = prompt('Enter quantity:');
    if (quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0) {
        addToPortfolio(coinId, quantity);
        alert('Coin added to portfolio!');
    }
};

const setupTableSorting = () => {
    const sortableHeaders = document.querySelectorAll('.sortable');
    let currentSort = { column: null, direction: 'asc' };
    
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            sortMarketData(column, currentSort.direction);
            updateSortIndicators(header, currentSort.direction);
        });
    });
};

const sortMarketData = (column, direction) => {
    filteredMarketData.sort((a, b) => {
        const aVal = a[column] || 0;
        const bVal = b[column] || 0;
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    renderMarketData();
};

const updateSortIndicators = (activeHeader, direction) => {
    document.querySelectorAll('.sortable').forEach(header => {
        header.textContent = header.textContent.replace(' ↑', '').replace(' ↓', '');
    });
    activeHeader.textContent += direction === 'asc' ? ' ↑' : ' ↓';
};

const setupCoinRowClicks = () => {
    const coinRows = document.querySelectorAll('.coin-row:not(.expanded)');
    coinRows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.expand-btn') && !e.target.closest('.add-portfolio-btn')) {
                const coinId = row.dataset.coinId;
                showCoinDetails(coinId);
            }
        });
    });
};

const showCoinDetails = (coinId) => {
    switchView('coin-detail');
    loadCoinDetails(coinId);
};

const loadCoinDetails = async (coinId) => {
    const container = document.getElementById('coin-detail-content');
    const title = document.getElementById('coin-detail-title');
    if (!container) return;
    
    if (!coinId) {
        showError(container, 'Invalid coin ID.');
        return;
    }
    
    showLoading(container);
    
    try {
        const coin = await fetchCoinDetails(coinId);
        if (!coin || !coin.market_data) {
            throw new Error('Invalid coin data received');
        }
        if (title) title.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
        renderCoinDetails(coin);
    } catch (error) {
        console.error('Error loading coin details:', error);
        const errorMsg = error.message || 'Failed to load coin details. Please check the console for more information.';
        showError(container, errorMsg);
    }
};

const renderCoinDetails = (coin) => {
    const container = document.getElementById('coin-detail-content');
    if (!container) return;
    
    const marketData = coin.market_data;
    if (!marketData) {
        showError(container, 'Market data not available for this coin.');
        return;
    }
    
    const currentPrice = marketData.current_price?.usd || marketData.current_price || 0;
    const change24h = marketData.price_change_percentage_24h || 0;
    const change7d = marketData.price_change_percentage_7d_in_currency || 0;
    const change30d = marketData.price_change_percentage_30d_in_currency || 0;
    const marketCap = marketData.market_cap?.usd || marketData.market_cap || 0;
    const volume = marketData.total_volume?.usd || marketData.total_volume || 0;
    const circulatingSupply = marketData.circulating_supply || 0;
    const totalSupply = marketData.total_supply || null;
    const ath = marketData.ath?.usd || marketData.ath || 0;
    const atl = marketData.atl?.usd || marketData.atl || 0;
    
    container.innerHTML = `
        <div class="coin-detail-header">
            <div class="coin-detail-logo">
                <img src="${coin.image?.large || coin.image || ''}" alt="${coin.name}" class="coin-large-icon" onerror="this.style.display='none'">
            </div>
            <div class="coin-detail-info">
                <h3>${formatCurrency(currentPrice)}</h3>
                <div class="coin-detail-changes">
                    <span class="${getChangeClass(change24h)}">24h: ${formatPercentage(change24h)}</span>
                    <span class="${getChangeClass(change7d)}">7d: ${formatPercentage(change7d)}</span>
                    <span class="${getChangeClass(change30d)}">30d: ${formatPercentage(change30d)}</span>
                </div>
            </div>
            <button class="btn btn-primary add-portfolio-detail-btn" data-coin-id="${coin.id}">Add to Portfolio</button>
        </div>
        <div class="coin-detail-stats">
            <div class="stat-card">
                <div class="stat-label">Market Cap</div>
                <div class="stat-value">${formatNumber(marketCap)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Volume (24h)</div>
                <div class="stat-value">${formatNumber(volume)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Circulating Supply</div>
                <div class="stat-value">${formatLargeNumber(circulatingSupply)} ${coin.symbol.toUpperCase()}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Supply</div>
                <div class="stat-value">${totalSupply ? formatLargeNumber(totalSupply) : 'N/A'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">All-Time High</div>
                <div class="stat-value">${formatCurrency(ath)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">All-Time Low</div>
                <div class="stat-value">${formatCurrency(atl)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">ATH Change</div>
                <div class="stat-value ${getChangeClass(((currentPrice - ath) / ath) * 100)}">
                    ${formatPercentage(((currentPrice - ath) / ath) * 100)}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">ATL Change</div>
                <div class="stat-value ${getChangeClass(((currentPrice - atl) / atl) * 100)}">
                    ${formatPercentage(((currentPrice - atl) / atl) * 100)}
                </div>
            </div>
        </div>
        <div class="coin-detail-chart">
            <div class="chart-controls">
                <button class="chart-btn active" data-days="1">24h</button>
                <button class="chart-btn" data-days="7">7d</button>
                <button class="chart-btn" data-days="30">30d</button>
                <button class="chart-btn" data-days="90">90d</button>
                <button class="chart-btn" data-days="365">1y</button>
            </div>
            <div id="chart-container" class="chart-container">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading chart...</p>
                </div>
            </div>
        </div>
    `;
    
    setupChartControls(coin.id);
    loadChart(coin.id, 7);
    setupAddPortfolioDetailButton(coin.id);
};

const setupAddPortfolioDetailButton = (coinId) => {
    const btn = document.querySelector('.add-portfolio-detail-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            addCoinToPortfolioFromDetail(coinId);
        });
    }
};

const setupChartControls = (coinId) => {
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const days = parseInt(btn.dataset.days);
            loadChart(coinId, days);
        });
    });
};

const loadChart = async (coinId, days) => {
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const data = await fetchHistoricalData(coinId, days);
        renderChart(data.prices, days);
    } catch (error) {
        showError(container, 'Failed to load chart data.');
    }
};

const renderChart = (prices, days) => {
    const container = document.getElementById('chart-container');
    if (!container || !prices || prices.length === 0) {
        showError(container, 'No chart data available.');
        return;
    }
    
    const width = Math.max(container.offsetWidth || 800, 600);
    const height = 400;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const priceValues = prices.map(p => p[1]);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.1;
    
    const firstPrice = prices[0][1];
    const lastPrice = prices[prices.length - 1][1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const color = change >= 0 ? '#10b981' : '#ef4444';
    
    const points = prices.map((point, index) => {
        const x = padding.left + (index / (prices.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((point[1] - (minPrice - pricePadding)) / (priceRange + pricePadding * 2)) * chartHeight;
        return { x, y, price: point[1], time: point[0] };
    });
    
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = pathData + ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;
    
    const gridLines = 5;
    const gridYValues = [];
    for (let i = 0; i <= gridLines; i++) {
        const value = minPrice - pricePadding + (priceRange + pricePadding * 2) * (1 - i / gridLines);
        gridYValues.push({
            y: padding.top + (i / gridLines) * chartHeight,
            value: value
        });
    }
    
    container.innerHTML = `
        <div class="chart-wrapper">
            <svg width="${width}" height="${height}" class="price-chart" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="chartGradient-${days}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                    </linearGradient>
                </defs>
                <g class="grid-lines">
                    ${gridYValues.map(g => `
                        <line x1="${padding.left}" y1="${g.y}" x2="${width - padding.right}" y2="${g.y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2"/>
                        <text x="${padding.left - 10}" y="${g.y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${formatCurrency(g.value)}</text>
                    `).join('')}
                </g>
                <path d="${areaPath}" fill="url(#chartGradient-${days})" />
                <path d="${pathData}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="5" fill="${color}" class="chart-point-current"/>
            </svg>
            <div class="chart-info">
                <div class="chart-price">${formatCurrency(lastPrice)}</div>
                <div class="chart-change ${changeClass}">${formatPercentage(change)}</div>
            </div>
        </div>
    `;
};

const setupPortfolioForm = () => {
    const coinSelect = document.getElementById('coin-select');
    const coinQuantity = document.getElementById('coin-quantity');
    const addCoinBtn = document.getElementById('add-coin-btn');
    const dropdown = document.getElementById('coin-select-dropdown');
    
    let selectedCoinId = null;
    
    if (coinSelect) {
        coinSelect.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0 && coinList.length > 0) {
                const filtered = coinList.filter(coin => 
                    coin.name.toLowerCase().includes(query.toLowerCase()) ||
                    coin.symbol.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 10);
                
                dropdown.innerHTML = filtered.map(coin => `
                    <div class="dropdown-item" data-coin-id="${coin.id}" data-coin-name="${coin.name}">
                        ${coin.name} (${coin.symbol.toUpperCase()})
                    </div>
                `).join('');
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });
    }
    
    if (dropdown) {
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                selectedCoinId = item.dataset.coinId;
                coinSelect.value = item.dataset.coinName;
                dropdown.style.display = 'none';
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!coinSelect.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    if (addCoinBtn) {
        addCoinBtn.addEventListener('click', () => {
            if (!selectedCoinId) {
                alert('Please select a coin');
                return;
            }
            const quantity = parseFloat(coinQuantity.value);
            if (isNaN(quantity) || quantity <= 0) {
                alert('Please enter a valid quantity');
                return;
            }
            addToPortfolio(selectedCoinId, quantity);
            coinSelect.value = '';
            coinQuantity.value = '';
            selectedCoinId = null;
            loadPortfolioView();
        });
    }
};

const loadPortfolioView = async () => {
    const portfolio = getPortfolio();
    const summaryContainer = document.getElementById('portfolio-summary');
    const holdingsContainer = document.getElementById('portfolio-holdings');
    
    if (portfolio.length === 0) {
        if (summaryContainer) summaryContainer.innerHTML = '';
        if (holdingsContainer) {
            holdingsContainer.innerHTML = '<div class="empty-state"><p>Your portfolio is empty. Add coins to get started!</p></div>';
        }
        return;
    }
    
    showLoading(summaryContainer);
    showLoading(holdingsContainer);
    
    try {
        const portfolioData = await getPortfolioValue(portfolio);
        renderPortfolioSummary(portfolioData);
        renderPortfolioHoldings(portfolioData.holdings);
    } catch (error) {
        showError(holdingsContainer, 'Failed to load portfolio data.');
    }
};

const renderPortfolioSummary = (data) => {
    const container = document.getElementById('portfolio-summary');
    if (!container) return;
    
    container.innerHTML = `
        <div class="portfolio-summary-cards">
            <div class="summary-card">
                <div class="summary-label">Total Value</div>
                <div class="summary-value">${formatCurrency(data.totalValue)}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Change</div>
                <div class="summary-value ${getChangeClass(data.totalChange)}">
                    ${formatCurrency(data.totalChange)} (${formatPercentage(data.totalChangePercent)})
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Holdings</div>
                <div class="summary-value">${data.holdings.length}</div>
            </div>
        </div>
    `;
};

const renderPortfolioHoldings = (holdings) => {
    const container = document.getElementById('portfolio-holdings');
    if (!container) return;
    
    if (holdings.length === 0) {
        showEmpty(container, 'No holdings found.');
        return;
    }
    
    container.innerHTML = `
        <div class="holdings-table-container">
            <table class="holdings-table">
                <thead>
                    <tr>
                        <th>Coin</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Value</th>
                        <th>24h Change</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdings.map(holding => `
                        <tr>
                            <td>
                                <div class="coin-info clickable-coin" data-coin-id="${holding.coinId}">
                                    <img src="${holding.image}" alt="${holding.name}" class="coin-icon" onerror="this.style.display='none'">
                                    <div>
                                        <div class="coin-name">${holding.name}</div>
                                        <div class="coin-symbol">${holding.symbol.toUpperCase()}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <input type="number" class="quantity-input" value="${holding.quantity}" 
                                       data-coin-id="${holding.coinId}">
                            </td>
                            <td>${formatCurrency(holding.current_price)}</td>
                            <td>${formatCurrency(holding.value)}</td>
                            <td class="${getChangeClass(holding.change24h)}">
                                ${formatPercentage(holding.change24h)}
                            </td>
                            <td>
                                <div class="holdings-actions">
                                    <button class="btn btn-sm btn-secondary view-holding-btn" data-coin-id="${holding.coinId}">View</button>
                                    <button class="btn btn-danger btn-sm remove-holding-btn" data-coin-id="${holding.coinId}">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    setupPortfolioHoldingsInteractions();
};

const setupPortfolioHoldingsInteractions = () => {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const coinId = e.target.dataset.coinId;
            const quantity = parseFloat(e.target.value);
            if (!isNaN(quantity) && quantity >= 0) {
                updatePortfolioQuantity(coinId, quantity);
            } else {
                e.target.value = getPortfolio().find(item => item.coinId === coinId)?.quantity || 0;
            }
        });
    });
    
    const viewBtns = document.querySelectorAll('.view-holding-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const coinId = btn.dataset.coinId;
            showCoinDetails(coinId);
        });
    });
    
    const removeBtns = document.querySelectorAll('.remove-holding-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const coinId = btn.dataset.coinId;
            if (confirm('Remove this coin from your portfolio?')) {
                removeFromPortfolioAndReload(coinId);
            }
        });
    });
    
    const clickableCoins = document.querySelectorAll('.clickable-coin');
    clickableCoins.forEach(coin => {
        coin.addEventListener('click', (e) => {
            if (!e.target.closest('input') && !e.target.closest('button')) {
                const coinId = coin.dataset.coinId;
                showCoinDetails(coinId);
            }
        });
        coin.style.cursor = 'pointer';
    });
};

const loadTrendingView = async () => {
    const container = document.getElementById('trending-content');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const trending = await fetchTrendingCoins();
        renderTrendingCoins(trending);
    } catch (error) {
        showError(container, 'Failed to load trending coins.');
    }
};

const renderTrendingCoins = (coins) => {
    const container = document.getElementById('trending-content');
    if (!container) return;
    
    if (coins.length === 0) {
        showEmpty(container, 'No trending coins found.');
        return;
    }
    
    container.innerHTML = `
        <div class="trending-grid">
            ${coins.map((coin, index) => `
                <div class="trending-card card" data-coin-id="${coin.id}">
                    <div class="trending-rank">#${index + 1}</div>
                    <div class="trending-coin-info">
                        <img src="${coin.image}" alt="${coin.name}" class="coin-icon" onerror="this.style.display='none'">
                        <div>
                            <div class="coin-name">${coin.name}</div>
                            <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                        </div>
                    </div>
                    <div class="trending-price">${formatCurrency(coin.current_price)}</div>
                    <div class="trending-change ${getChangeClass(coin.price_change_percentage_24h)}">
                        ${formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    setupTrendingCardClicks();
};

const setupTrendingCardClicks = () => {
    const trendingCards = document.querySelectorAll('.trending-card');
    trendingCards.forEach(card => {
        card.addEventListener('click', () => {
            const coinId = card.dataset.coinId;
            if (coinId) {
                showCoinDetails(coinId);
            }
        });
    });
};

const updatePortfolioQuantity = (coinId, quantity) => {
    updateQuantity(coinId, quantity);
    loadPortfolioView();
};

const removeFromPortfolioAndReload = (coinId) => {
    removeFromPortfolio(coinId);
    loadPortfolioView();
};

const addCoinToPortfolioFromDetail = (coinId) => {
    const quantity = prompt('Enter quantity:');
    if (quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0) {
        addToPortfolio(coinId, quantity);
        alert('Coin added to portfolio!');
    }
};

const refreshBtn = document.getElementById('refresh-market');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        loadMarketData(true);
    });
}

document.addEventListener('DOMContentLoaded', init);

