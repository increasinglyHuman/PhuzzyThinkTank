#!/usr/bin/env node

/**
 * Phuzzy Review API Server
 * Simple Node.js server to handle review dashboard data storage
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3001;
const REVIEW_DATA_FILE = 'review-data.json';

// CORS headers for web requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// Initialize review data file if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(REVIEW_DATA_FILE);
    } catch (error) {
        // File doesn't exist, create it
        const initialData = {
            lastUpdated: new Date().toISOString(),
            reviews: {},
            stats: {
                total: 0,
                approved: 0,
                revision: 0,
                rejected: 0
            }
        };
        await fs.writeFile(REVIEW_DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('📝 Initialized review data file');
    }
}

// Load review data from file
async function loadReviewData() {
    try {
        const data = await fs.readFile(REVIEW_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading review data:', error);
        return null;
    }
}

// Save review data to file
async function saveReviewData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        await fs.writeFile(REVIEW_DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving review data:', error);
        return false;
    }
}

// Update statistics
function updateStats(reviewData) {
    const reviews = reviewData.reviews;
    const stats = {
        total: Object.keys(reviews).length,
        approved: 0,
        revision: 0,
        rejected: 0,
        pending: 0
    };
    
    Object.values(reviews).forEach(review => {
        stats[review.status] = (stats[review.status] || 0) + 1;
    });
    
    reviewData.stats = stats;
    return reviewData;
}

// Handle API requests
async function handleRequest(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }
    
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const method = req.method;
    const path = url.pathname;
    
    console.log(`${method} ${path}`);
    
    try {
        if (path === '/api/reviews' && method === 'GET') {
            // Get all reviews
            const reviewData = await loadReviewData();
            if (reviewData) {
                res.writeHead(200, corsHeaders);
                res.end(JSON.stringify(reviewData));
            } else {
                res.writeHead(500, corsHeaders);
                res.end(JSON.stringify({ error: 'Failed to load review data' }));
            }
            
        } else if (path === '/api/reviews' && method === 'POST') {
            // Save new review
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const newReview = JSON.parse(body);
                    const reviewData = await loadReviewData();
                    
                    if (!reviewData) {
                        res.writeHead(500, corsHeaders);
                        res.end(JSON.stringify({ error: 'Failed to load existing data' }));
                        return;
                    }
                    
                    // Add/update the review
                    reviewData.reviews[newReview.scenarioId] = {
                        status: newReview.status,
                        feedback: newReview.feedback || '',
                        timestamp: new Date().toISOString(),
                        reviewer: newReview.reviewer || 'anonymous'
                    };
                    
                    // Update stats
                    updateStats(reviewData);
                    
                    // Save to file
                    const saved = await saveReviewData(reviewData);
                    
                    if (saved) {
                        res.writeHead(200, corsHeaders);
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Review saved successfully',
                            stats: reviewData.stats
                        }));
                        console.log(`✅ Review saved for scenario: ${newReview.scenarioId} (${newReview.status})`);
                    } else {
                        res.writeHead(500, corsHeaders);
                        res.end(JSON.stringify({ error: 'Failed to save review data' }));
                    }
                    
                } catch (error) {
                    console.error('Error processing review:', error);
                    res.writeHead(400, corsHeaders);
                    res.end(JSON.stringify({ error: 'Invalid request data' }));
                }
            });
            
        } else if (path.startsWith('/api/reviews/') && method === 'GET') {
            // Get specific review
            const scenarioId = path.split('/')[3];
            const reviewData = await loadReviewData();
            
            if (reviewData && reviewData.reviews[scenarioId]) {
                res.writeHead(200, corsHeaders);
                res.end(JSON.stringify(reviewData.reviews[scenarioId]));
            } else {
                res.writeHead(404, corsHeaders);
                res.end(JSON.stringify({ error: 'Review not found' }));
            }
            
        } else if (path === '/api/export' && method === 'GET') {
            // Export all data for backup
            const reviewData = await loadReviewData();
            if (reviewData) {
                const exportData = {
                    exportDate: new Date().toISOString(),
                    approvals: {}
                };
                
                // Convert to the format the dashboard expects
                Object.entries(reviewData.reviews).forEach(([scenarioId, review]) => {
                    exportData.approvals[scenarioId] = review;
                });
                
                res.writeHead(200, {
                    ...corsHeaders,
                    'Content-Disposition': `attachment; filename="phuzzy-reviews-${new Date().toISOString().split('T')[0]}.json"`
                });
                res.end(JSON.stringify(exportData, null, 2));
                console.log('📤 Data exported');
            } else {
                res.writeHead(500, corsHeaders);
                res.end(JSON.stringify({ error: 'Failed to export data' }));
            }
            
        } else if (path === '/api/scenarios/text' && method === 'PUT') {
            // Update scenario text content
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const updateRequest = JSON.parse(body);
                    const { scenarioId, text, reviewer } = updateRequest;
                    
                    if (!scenarioId || !text) {
                        res.writeHead(400, corsHeaders);
                        res.end(JSON.stringify({ error: 'scenarioId and text are required' }));
                        return;
                    }
                    
                    // Find which pack file contains this scenario
                    const packFile = await findScenarioPackFile(scenarioId);
                    
                    if (!packFile) {
                        res.writeHead(404, corsHeaders);
                        res.end(JSON.stringify({ error: 'Scenario not found in any pack file' }));
                        return;
                    }
                    
                    // Update the scenario text in the pack file
                    const success = await updateScenarioText(packFile, scenarioId, text);
                    
                    if (success) {
                        res.writeHead(200, corsHeaders);
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Scenario text updated successfully',
                            filePath: packFile,
                            scenarioId: scenarioId,
                            updatedBy: reviewer || 'anonymous'
                        }));
                        console.log(`✅ Updated scenario text: ${scenarioId} in ${packFile}`);
                    } else {
                        res.writeHead(500, corsHeaders);
                        res.end(JSON.stringify({ error: 'Failed to update scenario text' }));
                    }
                    
                } catch (error) {
                    console.error('Error updating scenario text:', error);
                    res.writeHead(400, corsHeaders);
                    res.end(JSON.stringify({ error: 'Invalid request data' }));
                }
            });
            
        } else if (path === '/health' && method === 'GET') {
            // Health check
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify({ 
                status: 'ok', 
                service: 'Phuzzy Review API',
                timestamp: new Date().toISOString()
            }));
            
        } else {
            // 404 for unknown routes
            res.writeHead(404, corsHeaders);
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
        
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

// Start server
async function startServer() {
    await initializeDataFile();
    
    const server = http.createServer(handleRequest);
    
    server.listen(PORT, () => {
        console.log(`🚀 Phuzzy Review API Server running on http://localhost:${PORT}`);
        console.log(`📋 Dashboard API endpoints:`);
        console.log(`   GET  /api/reviews - Get all reviews`);
        console.log(`   POST /api/reviews - Save new review`);
        console.log(`   GET  /api/reviews/{id} - Get specific review`);
        console.log(`   GET  /api/export - Export all data`);
        console.log(`   GET  /health - Health check`);
        console.log(`📁 Data stored in: ${path.resolve(REVIEW_DATA_FILE)}`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}

// Helper function to find which pack file contains a scenario
async function findScenarioPackFile(scenarioId) {
    const scenarioPacksDir = './data/scenario-packs';
    
    try {
        const files = await fs.readdir(scenarioPacksDir);
        const packFiles = files.filter(file => file.startsWith('scenario-generated-') && file.endsWith('.json'));
        
        for (const packFile of packFiles) {
            try {
                const packPath = path.join(scenarioPacksDir, packFile);
                const packData = JSON.parse(await fs.readFile(packPath, 'utf8'));
                
                if (packData.scenarios && Array.isArray(packData.scenarios)) {
                    const scenarioExists = packData.scenarios.some(scenario => scenario.id === scenarioId);
                    if (scenarioExists) {
                        return packPath;
                    }
                }
            } catch (fileError) {
                console.error(`Error reading pack file ${packFile}:`, fileError);
                continue;
            }
        }
        
        return null; // Scenario not found in any pack
    } catch (error) {
        console.error('Error searching for scenario:', error);
        return null;
    }
}

// Helper function to update scenario text in a pack file
async function updateScenarioText(packFile, scenarioId, newText) {
    try {
        const packData = JSON.parse(await fs.readFile(packFile, 'utf8'));
        
        if (!packData.scenarios || !Array.isArray(packData.scenarios)) {
            return false;
        }
        
        const scenarioIndex = packData.scenarios.findIndex(scenario => scenario.id === scenarioId);
        
        if (scenarioIndex === -1) {
            return false; // Scenario not found
        }
        
        // Update the content field
        packData.scenarios[scenarioIndex].content = newText;
        
        // Save the updated pack file
        await fs.writeFile(packFile, JSON.stringify(packData, null, 2));
        
        return true;
    } catch (error) {
        console.error('Error updating scenario text:', error);
        return false;
    }
}

// Start the server
startServer().catch(console.error);