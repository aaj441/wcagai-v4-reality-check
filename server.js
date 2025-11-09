const express = require('express');
const cors = require('cors');
const VerticalDiscovery = require('./discovery');
const WCAGAIV4Scanner = require('./scanner-v4-integration');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        version: '4.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Information endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'WCAGAI v4.0 API',
        description: 'AI-powered web accessibility scanner with vertical intelligence',
        version: '4.0.0',
        endpoints: {
            'GET /health': 'Health check',
            'GET /api/verticals': 'Get available verticals',
            'POST /api/discover': 'Discover sites by keywords and vertical',
            'POST /api/scan': 'Scan sites with discovery',
            'GET /api/benchmarks/:vertical': 'Get vertical benchmarks'
        }
    });
});

// Get available verticals
app.get('/api/verticals', (req, res) => {
    const discovery = new VerticalDiscovery();
    const verticals = ['healthcare', 'fintech', 'ecommerce'];
    
    const verticalInfo = verticals.map(vertical => {
        const stats = discovery.getVerticalStats(vertical);
        return {
            vertical,
            complianceBenchmark: stats.complianceBenchmark,
            topSites: stats.topSites,
            keywords: stats.keywords
        };
    });
    
    res.json({ verticals: verticalInfo });
});

// Discover sites endpoint
app.post('/api/discover', async (req, res) => {
    const { keywords, vertical, limit = 20 } = req.body;
    
    if (!keywords || !vertical) {
        return res.status(400).json({ 
            error: 'Missing required parameters: keywords and vertical' 
        });
    }
    
    const discovery = new VerticalDiscovery();
    
    try {
        const sites = await discovery.discover(keywords, vertical, limit);
        res.json({ 
            vertical,
            keywords,
            sitesFound: sites.length,
            sites 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Discovery failed', 
            message: error.message 
        });
    } finally {
        await discovery.disconnect();
    }
});

// Scan with discovery endpoint
app.post('/api/scan', async (req, res) => {
    const { keywords, vertical, url, limit = 20 } = req.body;
    
    if (!keywords && !url) {
        return res.status(400).json({ 
            error: 'Either keywords+vertical or url must be provided' 
        });
    }
    
    const scanner = new WCAGAIV4Scanner();
    
    try {
        const options = url ? { url } : { keywords, vertical, limit };
        const results = await scanner.scan(options);
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ 
            error: 'Scan failed', 
            message: error.message 
        });
    } finally {
        await scanner.disconnect();
    }
});

// Get vertical benchmarks
app.get('/api/benchmarks/:vertical', (req, res) => {
    const { vertical } = req.params;
    const discovery = new VerticalDiscovery();
    
    const stats = discovery.getVerticalStats(vertical);
    
    if (!stats.complianceBenchmark) {
        return res.status(404).json({ 
            error: 'Vertical not found',
            available: ['healthcare', 'fintech', 'ecommerce']
        });
    }
    
    res.json({
        vertical,
        benchmark: stats,
        complianceDeadline: vertical === 'fintech' ? '2025-06-28' : '2026-05-01'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WCAGAI v4.0 API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/`);
});

module.exports = app;
