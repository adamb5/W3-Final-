const PORTFOLIO_STORAGE_KEY = 'crypto_portfolio';

const getPortfolio = () => {
    try {
        const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading portfolio:', error);
        return [];
    }
};

const savePortfolio = (portfolio) => {
    try {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
    } catch (error) {
        console.error('Error saving portfolio:', error);
    }
};

const addToPortfolio = (coinId, quantity) => {
    const portfolio = getPortfolio();
    const existingIndex = portfolio.findIndex(item => item.coinId === coinId);
    
    if (existingIndex >= 0) {
        portfolio[existingIndex].quantity = parseFloat(quantity);
    } else {
        portfolio.push({
            coinId: coinId,
            quantity: parseFloat(quantity)
        });
    }
    
    savePortfolio(portfolio);
    return portfolio;
};

const removeFromPortfolio = (coinId) => {
    const portfolio = getPortfolio();
    const filtered = portfolio.filter(item => item.coinId !== coinId);
    savePortfolio(filtered);
    return filtered;
};

const updateQuantity = (coinId, quantity) => {
    const portfolio = getPortfolio();
    const item = portfolio.find(item => item.coinId === coinId);
    if (item) {
        item.quantity = parseFloat(quantity);
        savePortfolio(portfolio);
    }
    return portfolio;
};

const getPortfolioValue = async (portfolio) => {
    if (!portfolio || portfolio.length === 0) return { totalValue: 0, totalChange: 0, totalChangePercent: 0 };
    
    try {
        const coinIds = portfolio.map(item => item.coinId).join(',');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
        );
        
        if (!response.ok) throw new Error('Failed to fetch portfolio data');
        const marketData = await response.json();
        
        let totalValue = 0;
        let totalChange = 0;
        const holdings = [];
        
        portfolio.forEach(portfolioItem => {
            const coinData = marketData.find(coin => coin.id === portfolioItem.coinId);
            if (coinData) {
                const value = portfolioItem.quantity * coinData.current_price;
                const change24h = coinData.price_change_percentage_24h || 0;
                const changeValue = value * (change24h / 100);
                
                totalValue += value;
                totalChange += changeValue;
                
                holdings.push({
                    ...portfolioItem,
                    ...coinData,
                    value: value,
                    change24h: change24h,
                    changeValue: changeValue
                });
            }
        });
        
        const totalChangePercent = totalValue > 0 && totalChange !== 0 ? (totalChange / totalValue) * 100 : 0;
        
        return {
            totalValue,
            totalChange: totalChange,
            totalChangePercent,
            holdings: holdings.sort((a, b) => b.value - a.value)
        };
    } catch (error) {
        console.error('Error calculating portfolio value:', error);
        return { totalValue: 0, totalChange: 0, totalChangePercent: 0, holdings: [] };
    }
};

