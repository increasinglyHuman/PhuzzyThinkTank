#!/usr/bin/env node

/**
 * Audio Mismatch Database & Auto-Fix Orchestrator
 * 
 * This module acts as a centralized database for tracking audio mismatches
 * and automatically triggering fix scripts when issues are detected.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class AudioMismatchDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'audio-mismatch-db.json');
        this.logPath = path.join(__dirname, 'audio-mismatch-fixes.log');
        this.data = this.loadDatabase();
        this.watchers = new Map();
    }
    
    // Load existing database or create new one
    loadDatabase() {
        if (fs.existsSync(this.dbPath)) {
            return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        }
        
        const initialData = {
            mismatches: {},
            fixes: [],
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };
        
        this.saveDatabase(initialData);
        return initialData;
    }
    
    // Save database to disk
    saveDatabase(data = this.data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
        this.data = data;
    }
    
    // Add a mismatch record
    addMismatch(scenarioId, issue) {
        this.data.mismatches[scenarioId] = {
            ...issue,
            detectedAt: new Date().toISOString(),
            status: 'pending',
            attempts: 0
        };
        
        this.data.lastUpdated = new Date().toISOString();
        this.saveDatabase();
        
        // Trigger auto-fix
        this.triggerAutoFix(scenarioId);
    }
    
    // Batch add mismatches from review data
    importFromReviewData(reviewData) {
        const mismatches = [];
        
        for (const [id, approval] of Object.entries(reviewData.approvals)) {
            if (approval.status === 'revision' && approval.feedback) {
                // Detect audio mismatch patterns
                const feedback = approval.feedback.toLowerCase();
                
                if (feedback.includes('audio') && 
                    (feedback.includes('different') || 
                     feedback.includes('wrong') || 
                     feedback.includes('mismatch') ||
                     feedback.includes('for the'))) {
                    
                    // Extract the correct scenario name if mentioned
                    let correctScenario = null;
                    const patterns = [
                        /audio (?:is )?for ['"]?([^'"]+)['"]?/i,
                        /this is ([^,]+) audio/i,
                        /supposed to be ([^,\n]+)/i
                    ];
                    
                    for (const pattern of patterns) {
                        const match = approval.feedback.match(pattern);
                        if (match) {
                            correctScenario = match[1].trim();
                            break;
                        }
                    }
                    
                    mismatches.push({
                        scenarioId: id,
                        issue: {
                            type: 'audio-mismatch',
                            feedback: approval.feedback,
                            correctScenario,
                            needsMultiVoice: feedback.includes('multi-character') || 
                                            feedback.includes('multi-voice')
                        }
                    });
                }
            }
        }
        
        // Add all mismatches
        console.log(`📥 Importing ${mismatches.length} audio mismatches from review data`);
        mismatches.forEach(m => this.addMismatch(m.scenarioId, m.issue));
        
        return mismatches;
    }
    
    // Trigger automatic fix for a scenario
    async triggerAutoFix(scenarioId) {
        const mismatch = this.data.mismatches[scenarioId];
        if (!mismatch || mismatch.status === 'fixed') return;
        
        console.log(`🔧 Auto-fixing audio mismatch for ${scenarioId}`);
        this.log(`Starting auto-fix for ${scenarioId}`);
        
        mismatch.attempts++;
        mismatch.lastAttempt = new Date().toISOString();
        
        try {
            // Determine fix strategy based on issue type
            let fixApplied = false;
            
            if (mismatch.type === 'audio-mismatch' && mismatch.correctScenario) {
                // Try to swap audio files
                fixApplied = await this.swapAudioFiles(scenarioId, mismatch.correctScenario);
            } else if (mismatch.needsMultiVoice) {
                // Mark for multi-voice regeneration
                fixApplied = await this.markForMultiVoice(scenarioId);
            } else {
                // General audio alignment fix
                fixApplied = await this.runAudioAlignmentFix(scenarioId);
            }
            
            if (fixApplied) {
                mismatch.status = 'fixed';
                mismatch.fixedAt = new Date().toISOString();
                this.log(`✅ Successfully fixed ${scenarioId}`);
                
                // Record fix
                this.data.fixes.push({
                    scenarioId,
                    type: mismatch.type,
                    timestamp: new Date().toISOString(),
                    method: 'auto-fix'
                });
            } else {
                mismatch.status = 'failed';
                this.log(`❌ Failed to fix ${scenarioId} - manual intervention needed`);
            }
            
        } catch (error) {
            mismatch.status = 'error';
            mismatch.error = error.message;
            this.log(`❌ Error fixing ${scenarioId}: ${error.message}`);
        }
        
        this.saveDatabase();
    }
    
    // Swap audio files between two scenarios
    async swapAudioFiles(scenario1, scenario2) {
        // This would implement the actual file swapping logic
        // For now, we'll create a fix command
        const fixCommand = `node fix-audio-folder-alignment.js --swap "${scenario1}" "${scenario2}"`;
        this.log(`Executing: ${fixCommand}`);
        
        try {
            const { stdout, stderr } = await execAsync(fixCommand);
            if (stderr) {
                console.error(`Fix stderr: ${stderr}`);
                return false;
            }
            console.log(`Fix output: ${stdout}`);
            return true;
        } catch (error) {
            console.error(`Fix failed: ${error.message}`);
            return false;
        }
    }
    
    // Mark scenario for multi-voice regeneration
    async markForMultiVoice(scenarioId) {
        const multiVoiceFile = path.join(__dirname, 'scenarios-for-multivoice.json');
        let scenarios = [];
        
        if (fs.existsSync(multiVoiceFile)) {
            scenarios = JSON.parse(fs.readFileSync(multiVoiceFile, 'utf8'));
        }
        
        if (!scenarios.includes(scenarioId)) {
            scenarios.push(scenarioId);
            fs.writeFileSync(multiVoiceFile, JSON.stringify(scenarios, null, 2));
            this.log(`Added ${scenarioId} to multi-voice generation queue`);
            return true;
        }
        
        return false;
    }
    
    // Run general audio alignment fix
    async runAudioAlignmentFix(scenarioId) {
        const fixCommand = `node fix-audio-folder-alignment.js --scenario "${scenarioId}"`;
        this.log(`Executing: ${fixCommand}`);
        
        try {
            const { stdout, stderr } = await execAsync(fixCommand);
            if (stderr) {
                console.error(`Fix stderr: ${stderr}`);
                return false;
            }
            console.log(`Fix output: ${stdout}`);
            return true;
        } catch (error) {
            console.error(`Fix failed: ${error.message}`);
            return false;
        }
    }
    
    // Get status report
    getStatus() {
        const pending = Object.values(this.data.mismatches).filter(m => m.status === 'pending').length;
        const fixed = Object.values(this.data.mismatches).filter(m => m.status === 'fixed').length;
        const failed = Object.values(this.data.mismatches).filter(m => m.status === 'failed').length;
        
        return {
            total: Object.keys(this.data.mismatches).length,
            pending,
            fixed,
            failed,
            fixes: this.data.fixes.length,
            lastUpdated: this.data.lastUpdated
        };
    }
    
    // Watch for changes to approval data
    watchApprovalData(filePath) {
        if (this.watchers.has(filePath)) return;
        
        console.log(`👁️  Watching ${filePath} for changes`);
        
        const watcher = fs.watch(filePath, async (eventType) => {
            if (eventType === 'change') {
                console.log(`📝 Approval data changed, checking for new mismatches...`);
                
                try {
                    const reviewData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.importFromReviewData(reviewData);
                } catch (error) {
                    console.error(`Error processing approval data: ${error.message}`);
                }
            }
        });
        
        this.watchers.set(filePath, watcher);
    }
    
    // Log to file
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(this.logPath, logEntry);
    }
    
    // Manual fix interface
    async manualFix(scenarioId, fixData) {
        if (!this.data.mismatches[scenarioId]) {
            throw new Error(`No mismatch record found for ${scenarioId}`);
        }
        
        const mismatch = this.data.mismatches[scenarioId];
        
        // Apply manual fix data
        Object.assign(mismatch, fixData);
        mismatch.status = 'fixed';
        mismatch.fixedAt = new Date().toISOString();
        mismatch.method = 'manual';
        
        // Record fix
        this.data.fixes.push({
            scenarioId,
            type: mismatch.type,
            timestamp: new Date().toISOString(),
            method: 'manual',
            fixData
        });
        
        this.saveDatabase();
        this.log(`✅ Manual fix applied to ${scenarioId}`);
    }
}

// CLI interface
if (require.main === module) {
    const db = new AudioMismatchDatabase();
    const args = process.argv.slice(2);
    
    if (args[0] === 'import') {
        // Import from approval data
        const approvalFile = args[1] || path.join(__dirname, 'scenario-approvals-2025-06-08.json');
        if (fs.existsSync(approvalFile)) {
            const reviewData = JSON.parse(fs.readFileSync(approvalFile, 'utf8'));
            const mismatches = db.importFromReviewData(reviewData);
            console.log(`\n✅ Imported ${mismatches.length} mismatches`);
            console.log(db.getStatus());
        } else {
            console.error(`❌ Approval file not found: ${approvalFile}`);
        }
        
    } else if (args[0] === 'status') {
        // Show status
        const status = db.getStatus();
        console.log('\n📊 Audio Mismatch Database Status:');
        console.log(`Total mismatches: ${status.total}`);
        console.log(`Pending: ${status.pending}`);
        console.log(`Fixed: ${status.fixed}`);
        console.log(`Failed: ${status.failed}`);
        console.log(`Total fixes applied: ${status.fixes}`);
        console.log(`Last updated: ${status.lastUpdated}`);
        
    } else if (args[0] === 'watch') {
        // Watch approval data for changes
        const approvalFile = args[1] || path.join(__dirname, 'scenario-approvals-2025-06-08.json');
        db.watchApprovalData(approvalFile);
        console.log('👁️  Watching for changes... Press Ctrl+C to stop');
        
        // Keep process running
        process.stdin.resume();
        
    } else {
        console.log(`
🎯 Audio Mismatch Database & Auto-Fix Orchestrator

Usage:
  node audio-mismatch-database.js import [approval-file]  # Import mismatches from review data
  node audio-mismatch-database.js status                  # Show database status
  node audio-mismatch-database.js watch [approval-file]   # Watch for changes and auto-fix

Example:
  node audio-mismatch-database.js import scenario-approvals-2025-06-08.json
  node audio-mismatch-database.js watch
        `);
    }
}

module.exports = AudioMismatchDatabase;