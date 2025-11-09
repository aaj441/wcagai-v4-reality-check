require('dotenv').config();
const express = require('express');
const cors = require('cors');
const VerticalDiscovery = require('./discovery');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize discovery system
const discovery = new VerticalDiscovery();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '4.0.0'
    });
});

// Discover sites endpoint
app.post('/api/discover', async (req, res) => {
    try {
        const { keywords, vertical, limit = 20 } = req.body;

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({
                error: 'Keywords array is required'
            });
        }

        if (!vertical) {
            return res.status(400).json({
                error: 'Vertical parameter is required (healthcare, fintech, or ecommerce)'
            });
        }

        const sites = await discovery.discover(keywords, vertical, limit);

        res.json({
            success: true,
            vertical,
            keywords,
            count: sites.length,
            sites
        });
    } catch (error) {
        console.error('Discovery API error:', error);
        res.status(500).json({
            error: 'Discovery failed',
            message: error.message
        });
    }
});

// Get vertical statistics endpoint
app.get('/api/vertical/:name/stats', (req, res) => {
    try {
        const { name } = req.params;
        const stats = discovery.getVerticalStats(name);

        if (!stats || stats.keywords.length === 0) {
            return res.status(404).json({
                error: 'Vertical not found',
                available: ['healthcare', 'fintech', 'ecommerce']
            });
        }

        res.json({
            vertical: name,
            ...stats
        });
    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({
            error: 'Failed to retrieve stats',
            message: error.message
        });
    }
});

// List available verticals endpoint
app.get('/api/verticals', (req, res) => {
    res.json({
        verticals: [
            {
                name: 'healthcare',
                description: 'Healthcare and medical services',
                complianceBenchmark: 0.74
            },
            {
                name: 'fintech',
                description: 'Financial technology and banking',
                complianceBenchmark: 0.31
            },
            {
                name: 'ecommerce',
                description: 'E-commerce and retail platforms',
                complianceBenchmark: 0.45
            }
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await discovery.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await discovery.disconnect();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WCAGAI v4.0 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔍 Discovery system initialized`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /api/health`);
    console.log(`  POST /api/discover`);
    console.log(`  GET  /api/verticals`);
    console.log(`  GET  /api/vertical/:name/stats`);
});

module.exports = app;
