# Adam's Crypto Dashboard

A real-time cryptocurrency portfolio dashboard and market analytics platform built with vanilla JavaScript, HTML, and CSS.

## Features

### Market Overview
- Real-time cryptocurrency prices and market data
- Sortable table with multiple sorting options
- Expandable coin details with additional statistics
- 7-day sparkline charts for each coin
- Advanced filtering (market cap, price change, volume)
- Auto-refresh every 60 seconds
- Price change animations

### Portfolio Tracker
- Add and manage cryptocurrency holdings
- Real-time portfolio value calculation
- Track gains/losses with percentage changes
- Local storage persistence
- Inline quantity editing
- View individual coin details from portfolio

### Coin Details
- Comprehensive coin information
- Historical price charts with multiple timeframes (24h, 7d, 30d, 90d, 1y)
- Market statistics (market cap, volume, supply, ATH/ATL)
- Interactive chart with grid lines and price indicators

### Trending Coins
- Top trending cryptocurrencies
- Sparkline charts for each coin
- Market cap information
- Quick access to coin details

### Search & Filter
- Real-time search across coin names and symbols
- Filter by market cap (large/mid/small)
- Filter by price change (gainers/losers)
- Filter by trading volume
- Combined search and filter functionality

## Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, animations, and responsive design
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript
- **CoinGecko API** - Free cryptocurrency market data API
- **LocalStorage** - Client-side portfolio persistence

## API

This project uses the [CoinGecko API](https://www.coingecko.com/en/api) (free tier):
- `/coins/markets` - Market data
- `/coins/{id}` - Coin details
- `/coins/{id}/market_chart` - Historical prices
- `/search/trending` - Trending coins
- `/coins/list` - Coin list for search

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # All styles and design system
├── script.js           # Main application logic
├── api.js             # API service functions
├── portfolio.js       # Portfolio management
├── utils.js           # Utility functions
├── api-test.html      # API testing file
└── README.md          # This file
```

## Usage

1. Open `index.html` in a web browser
2. The dashboard will automatically load market data
3. Navigate between Market, Portfolio, and Trending views
4. Use search and filters to find specific coins
5. Add coins to your portfolio with quantities
6. View detailed information by clicking on any coin

## Portfolio Management

- Click "Add Coin to Portfolio" in the Portfolio view
- Search and select a coin
- Enter the quantity you own
- Edit quantities directly in the holdings table
- Remove coins using the Remove button
- Portfolio data is saved automatically to localStorage

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Features Highlights

- ✅ Real-time price updates
- ✅ Interactive charts
- ✅ Responsive design
- ✅ Local storage persistence
- ✅ Advanced filtering
- ✅ Smooth animations
- ✅ Error handling
- ✅ Loading states
- ✅ No external dependencies

## License

This project is for educational purposes.
