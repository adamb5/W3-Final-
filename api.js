const API_BASE_URL = 'https://api.coingecko.com/api/v3';

let marketDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000;

const fetchMarketData = async (page = 1, perPage = 100, forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && marketDataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        return marketDataCache;
    }
    
    try {
        const response = await fetch(
            `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h,7d,30d`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        marketDataCache = data;
        cacheTimestamp = now;
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
};

const fetchCoinDetails = async (coinId) => {
    if (!coinId) {
        throw new Error('Coin ID is required');
    }
    
    try {
        const encodedCoinId = encodeURIComponent(coinId);
        const response = await fetch(
            `${API_BASE_URL}/coins/${encodedCoinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        if (!data || !data.id) {
            throw new Error('Invalid coin data received from API');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching coin details:', error);
        throw error;
    }
};

const fetchTrendingCoins = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/search/trending`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const coinIds = data.coins.map(coin => coin.item.id).join(',');
        const marketData = await fetch(
            `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`
        );
        if (!marketData.ok) throw new Error(`HTTP error! status: ${marketData.status}`);
        return await marketData.json();
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        throw error;
    }
};

const fetchHistoricalData = async (coinId, days = 7) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
};

const searchCoins = async (query) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error searching coins:', error);
        throw error;
    }
};

const fetchCoinList = async () => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/coins/list?include_platform=false`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching coin list:', error);
        throw error;
    }
};

