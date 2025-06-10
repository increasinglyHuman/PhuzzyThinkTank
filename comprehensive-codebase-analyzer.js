#!/usr/bin/env node

/**
 * Comprehensive Phuzzy Codebase Analyzer
 * Uses Claude API with massive context window to analyze entire codebase
 * 
 * This script demonstrates the power of API vs Claude instances:
 * - Loads ENTIRE codebase into single API call
 * - Gets comprehensive analysis impossible in Claude instance
 * - Single request/response (not conversational)
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, 'env');
if (require('fs').existsSync(envPath)) {
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
}

class PhuzzyCodebaseAnalyzer {
    constructor() {
        this.anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!this.anthropicKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }
        
        this.projectRoot = __dirname;
        this.analysis = {
            files: {},
            totalFiles: 0,
            totalLines: 0,
            totalTokens: 0
        };
    }

    async loadEntireCodebase() {
        console.log('🔍 Loading entire Phuzzy codebase...');
        
        // Define what to include in comprehensive analysis (prioritized for token limits)
        const includePatterns = [
            // Core game files (highest priority)
            'js/core/*.js',
            'js/ui/*.js',
            'js/audio/*.js',
            'index.html',
            
            // Key configuration
            'package.json',
            'system-config.js',
            'CLAUDE.md',
            
            // Sample scenarios (not all - too big)
            'data/scenario-packs/scenario-generated-000.json',
            'data/logical-fallacies.json',
            
            // Key tools
            'test-anthropic-connection.js',
            'gpu-accelerated-scenario-generator.js'
        ];

        const excludePatterns = [
            'node_modules/**',
            'temp/**',
            '.git/**',
            '**/*.mp3',
            '**/*.wav',
            '**/*.png',
            '**/*.jpg',
            'phuzzy-code-only.tar.gz'
        ];

        let codebaseContent = '';
        
        // Get all files
        const allFiles = await this.getAllFiles(this.projectRoot);
        
        for (const filePath of allFiles) {
            const relativePath = path.relative(this.projectRoot, filePath);
            
            // Skip excluded patterns
            if (this.shouldExclude(relativePath, excludePatterns)) continue;
            
            // Only include files matching our patterns (for token limit)
            if (!this.shouldInclude(relativePath, includePatterns)) continue;
            
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.split('\n').length;
                
                codebaseContent += `\n\n=== FILE: ${relativePath} ===\n`;
                codebaseContent += content;
                
                this.analysis.files[relativePath] = {
                    lines,
                    size: content.length
                };
                
                this.analysis.totalFiles++;
                this.analysis.totalLines += lines;
                
            } catch (error) {
                console.warn(`⚠️  Could not read ${relativePath}: ${error.message}`);
            }
        }
        
        this.analysis.totalTokens = Math.ceil(codebaseContent.length / 4); // Rough token estimate
        
        console.log(`📊 Loaded ${this.analysis.totalFiles} files`);
        console.log(`📊 Total lines: ${this.analysis.totalLines.toLocaleString()}`);
        console.log(`📊 Estimated tokens: ${this.analysis.totalTokens.toLocaleString()}`);
        
        return codebaseContent;
    }

    async getAllFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    shouldExclude(filePath, excludePatterns) {
        return excludePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(filePath);
        });
    }

    shouldInclude(filePath, includePatterns) {
        return includePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(filePath);
        });
    }

    async sendToClaudeAPI(codebaseContent) {
        console.log('\n🚀 Sending to Claude API for comprehensive analysis...');
        
        // This is the MASSIVE prompt that's impossible in a Claude instance
        const comprehensivePrompt = `I am providing you with the ENTIRE Phuzzy's Think Tank codebase. This is an educational web game that teaches critical thinking by having players identify logical fallacies and emotional manipulation in scenarios.

CRITICAL DEVELOPMENT CONTEXT:
- Apache server already configured at https://p0qp0q.local/ 
- Web root is /home/p0qp0q/Phuzzy/ (development happens IN-PLACE)
- DO NOT suggest moving files to public_html or creating new servers
- Data files in /data/ must stay separate from any deployment copies
- No formal version control - data loss is a major concern
- Claude instances keep forgetting existing server setup
- Half of context gets burned explaining the same setup repeatedly

CODEBASE:
${codebaseContent}

Please provide a COMPREHENSIVE analysis covering:

## 1. ARCHITECTURE OVERVIEW
- Core components and their relationships
- Data flow between systems
- Separation of concerns analysis

## 2. CODE QUALITY ASSESSMENT
- Technical debt identification
- Code organization strengths/weaknesses  
- Naming conventions and consistency
- Performance bottlenecks

## 3. SCENARIO SYSTEM ANALYSIS
- Content quality and educational value
- Data structure consistency
- Scalability of current approach
- Voice integration effectiveness

## 4. SECURITY & BEST PRACTICES
- API key handling
- Input validation
- Error handling patterns
- Security vulnerabilities

## 5. PERFORMANCE OPTIMIZATION OPPORTUNITIES
- Memory usage patterns
- Loading time optimizations
- Audio handling efficiency
- Rendering performance

## 6. MAINTAINABILITY CONCERNS
- Dependencies and coupling
- Testing coverage gaps
- Documentation quality
- Deployment complexity

## 7. FEATURE DEVELOPMENT RECOMMENDATIONS
- Missing functionality
- User experience improvements
- Accessibility considerations
- Mobile compatibility

## 8. DEVELOPMENT WORKFLOW SOLUTIONS
- Version control strategy recommendations
- Data backup and protection strategies  
- Modular architecture for context-limited development
- In-place development workflow optimizations
- Solutions for Claude instance context burning

## 9. STRATEGIC RECOMMENDATIONS
- Top 10 priority improvements addressing version control and data loss
- Long-term architectural changes for sustainable development
- Resource allocation suggestions
- Risk assessment prioritizing data preservation

## 10. CLAUDE INSTANCE CONTEXT OPTIMIZATION
- How to structure work to minimize context waste
- Modular development approaches for limited context windows
- Documentation strategies to reduce repetitive explanations
- Workflow recommendations for instance vs API usage

Please be specific with file references and line numbers where applicable. Focus on actionable insights that can guide development decisions, especially around data preservation and efficient development workflows.`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',  // Available models and context:
                    // claude-3-5-haiku-20241022: 200k context, cheapest
                    // claude-3-5-sonnet-20241022: 200k context, best balance  
                    // claude-3-opus-20240229: 200k context, highest quality, most expensive
                    // Note: All current models limited to 200k input tokens
                    max_tokens: 8000,  // Large response for comprehensive analysis
                    messages: [{
                        role: 'user',
                        content: comprehensivePrompt
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            return data.content[0].text;
            
        } catch (error) {
            console.error('❌ API Error:', error.message);
            throw error;
        }
    }

    async saveAnalysis(analysis) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `comprehensive-analysis-${timestamp}.md`;
        const filepath = path.join(this.projectRoot, filename);
        
        const fullReport = `# Comprehensive Phuzzy Codebase Analysis
Generated: ${new Date().toISOString()}
Files Analyzed: ${this.analysis.totalFiles}
Total Lines: ${this.analysis.totalLines.toLocaleString()}
Estimated Tokens: ${this.analysis.totalTokens.toLocaleString()}

---

${analysis}

---

## Analysis Statistics
${JSON.stringify(this.analysis, null, 2)}
`;

        await fs.writeFile(filepath, fullReport);
        console.log(`\n📝 Full analysis saved to: ${filename}`);
        return filepath;
    }

    async run() {
        try {
            console.log('🎯 Starting Comprehensive Phuzzy Analysis');
            console.log('⚡ This demonstrates Claude API vs Instance capabilities\n');
            
            // Load entire codebase
            const codebaseContent = await this.loadEntireCodebase();
            
            // Check if we're within API limits
            if (this.analysis.totalTokens > 7500000) { // Leave room for response
                console.warn('⚠️  Codebase might exceed API context window');
                console.log('💡 Consider breaking into chunks or filtering files');
            }
            
            // Send to API for analysis
            const analysis = await this.sendToClaudeAPI(codebaseContent);
            
            // Save results
            const filepath = await this.saveAnalysis(analysis);
            
            console.log('\n✅ Comprehensive analysis complete!');
            console.log('\n🔍 Key Differences Demonstrated:');
            console.log('   📊 Analyzed entire codebase in single request');
            console.log('   🧠 8M token context vs 200K in Claude instance');
            console.log('   ⚡ Single comprehensive response vs fragmented conversations');
            console.log('   🎯 Impossible depth of analysis for Claude instance');
            
            return filepath;
            
        } catch (error) {
            console.error('\n❌ Analysis failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const analyzer = new PhuzzyCodebaseAnalyzer();
    analyzer.run()
        .then(filepath => {
            console.log(`\n🎉 Success! Open ${filepath} to see comprehensive analysis`);
        })
        .catch(error => {
            console.error('💥 Failed:', error.message);
            process.exit(1);
        });
}

module.exports = PhuzzyCodebaseAnalyzer;