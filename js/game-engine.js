/**
 * Game Engine - Core game logic for The Curve Room 2.0
 * Handles payroll calculations, curve scoring, and claim codes
 */

/**
 * DecisionEngine - Manages strategic decisions with branching consequences
 * Replaces payroll slider with meaningful choices
 */
class DecisionEngine {
    constructor(teamData) {
        this.team = teamData;
        this.decisions = [null, null, null, null, null]; // Decision ID per year
        this.activeFlags = new Set(); // Unlocked flags
        this.pathScores = { winNow: 0, rebuild: 0, hybrid: 0 };
    }

    /**
     * Get available decisions for a year (not locked by flags)
     * @param {number} year - Year (1-5)
     * @returns {Array} Available decisions
     */
    getAvailableDecisions(year) {
        if (!this.team.decisions || !this.team.decisions[year.toString()]) {
            return [];
        }

        const allDecisions = this.team.decisions[year.toString()];
        return allDecisions.filter(d => {
            // Check if any lock flag is active
            return !d.flags.lock.some(f => this.activeFlags.has(f));
        });
    }

    /**
     * Get all decisions for a year (including locked ones)
     * @param {number} year - Year (1-5)
     * @returns {Array} All decisions
     */
    getAllDecisions(year) {
        if (!this.team.decisions || !this.team.decisions[year.toString()]) {
            return [];
        }
        return this.team.decisions[year.toString()];
    }

    /**
     * Apply a decision for a year
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     */
    applyDecision(year, decisionId) {
        const decision = this.findDecision(year, decisionId);
        if (!decision) return null;

        this.decisions[year - 1] = decisionId;

        // Update active flags
        decision.flags.lock.forEach(f => this.activeFlags.add(f));
        decision.flags.unlock.forEach(f => this.activeFlags.add(f));

        // Track path preference
        Object.keys(decision.pathWeights).forEach(path => {
            this.pathScores[path] += decision.pathWeights[path];
        });

        return decision;
    }

    /**
     * Find a decision by ID and year
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     * @returns {Object} Decision object
     */
    findDecision(year, decisionId) {
        const allDecisions = this.getAllDecisions(year);
        return allDecisions.find(d => d.id === decisionId);
    }

    /**
     * Get the current decision for a year
     * @param {number} year - Year (1-5)
     * @returns {Object} Current decision or null
     */
    getCurrentDecision(year) {
        const decisionId = this.decisions[year - 1];
        if (!decisionId) return null;
        return this.findDecision(year, decisionId);
    }

    /**
     * Get payroll curve based on decisions
     * @returns {Array} Payroll percentages for each year
     */
    getPayrollCurve() {
        return this.decisions.map((decisionId, index) => {
            const year = index + 1;
            const decision = this.getCurrentDecision(year);
            return decision ? decision.payrollPercentage : 50;
        });
    }

    /**
     * Determine the path (strategy) based on accumulated path scores
     * @returns {string} 'winNow', 'rebuild', or 'hybrid'
     */
    determinePath() {
        const scores = this.pathScores;
        const maxScore = Math.max(scores.winNow, scores.rebuild, scores.hybrid);

        // Handle ties by preferring hybrid
        if (scores.hybrid === maxScore && scores.hybrid > Math.min(scores.winNow, scores.rebuild)) {
            return 'hybrid';
        }
        if (scores.winNow === maxScore && scores.winNow > scores.rebuild) {
            return 'winNow';
        }
        if (scores.rebuild === maxScore) {
            return 'rebuild';
        }

        // Default
        return 'hybrid';
    }

    /**
     * Check if a decision was locked by a flag
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     * @returns {Array} Array of flags that lock this decision
     */
    getLockedByFlags(year, decisionId) {
        const decision = this.findDecision(year, decisionId);
        if (!decision) return [];
        return decision.flags.lock.filter(f => this.activeFlags.has(f));
    }

    /**
     * Reset the engine
     */
    reset() {
        this.decisions = [null, null, null, null, null];
        this.activeFlags.clear();
        this.pathScores = { winNow: 0, rebuild: 0, hybrid: 0 };
    }

    /**
     * Get all active flags
     * @returns {Array} Active flag names
     */
    getActiveFlags() {
        return Array.from(this.activeFlags);
    }

    /**
     * Get decision strategy object for a year and decision
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     * @returns {Object} Strategy object with tag, baseline, flavor
     */
    getDecisionStrategy(year, decisionId) {
        const decision = this.findDecision(year, decisionId);
        return decision?.strategy || null;
    }

    /**
     * Get payroll curve with strategy metadata
     * Includes both values and strategy tags
     * @returns {Array} Array of objects with payroll and strategy info
     */
    getPayrollCurveWithStrategy() {
        return this.decisions.map((decisionId, index) => {
            const year = index + 1;
            const decision = this.getCurrentDecision(year);
            if (decision && decision.strategy) {
                return {
                    year: year,
                    payroll: decision.payrollPercentage,
                    strategy: decision.strategy.tag,
                    flavor: decision.strategy.flavor,
                    baseline: decision.strategy.baseline
                };
            }
            return {
                year: year,
                payroll: 50,
                strategy: null,
                flavor: null,
                baseline: null
            };
        });
    }
}

const GameEngine = {
    // Game state
    state: {
        currentTeam: null,
        currentYear: 1,
        payrollDecisions: [50, 50, 50, 50, 50], // Default 50% for each year (slider mode)
        decisionEngine: null, // For teams with decision mechanics
        healthScore: 50,
        isGameComplete: false,
        gameMode: 'slider' // 'slider' or 'decisions'
    },

    // Claim Code Constants - Path-specific codes
    CLAIM_CODES: {
        GOLD: {
            winNow: { code: 'CURVE-301-CHAMPION', xp: 250 },
            rebuild: { code: 'CURVE-301-ARCHITECT', xp: 250 },
            hybrid: { code: 'CURVE-301-STRATEGIST', xp: 250 }
        },
        SILVER: {
            winNow: { code: 'CURVE-301-CONTENDER', xp: 175 },
            rebuild: { code: 'CURVE-301-BUILDER', xp: 175 },
            hybrid: { code: 'CURVE-301-NEGOTIATOR', xp: 175 }
        },
        BRONZE: {
            winNow: { code: 'CURVE-301-SPENDER', xp: 125 },
            rebuild: { code: 'CURVE-301-DEVELOPER', xp: 125 },
            hybrid: { code: 'CURVE-301-BALANCED', xp: 125 }
        }
    },

    // Phase information for each year
    PHASES: {
        1: { name: 'Build Phase', description: 'Start conservative. Build cap flexibility for the future.' },
        2: { name: 'Build Phase', description: 'Continue developing. Add strategic pieces.' },
        3: { name: 'Peak Phase', description: 'Your window is open! Spend aggressively to compete.' },
        4: { name: 'Transition Phase', description: 'Begin planning ahead. Balance competing and rebuilding.' },
        5: { name: 'Reset Phase', description: 'Prepare for the next cycle. Reduce payroll for flexibility.' }
    },

    /**
     * Initialize a new game with the selected team
     * @param {Object} teamData - Team data from DataLoader
     */
    initGame(teamData) {
        const hasDecisions = teamData.decisions && Object.keys(teamData.decisions).length > 0;
        const gameMode = hasDecisions ? 'decisions' : 'slider';

        this.state = {
            currentTeam: teamData,
            currentYear: 1,
            payrollDecisions: [
                teamData.startingPayroll,
                teamData.startingPayroll,
                teamData.startingPayroll,
                teamData.startingPayroll,
                teamData.startingPayroll
            ],
            decisionEngine: hasDecisions ? new DecisionEngine(teamData) : null,
            healthScore: 50,
            isGameComplete: false,
            gameMode: gameMode
        };
        this.calculateHealthScore();
        return this.state;
    },

    /**
     * Set payroll for a specific year (slider mode)
     * @param {number} year - Year (1-5)
     * @param {number} payrollPercent - Payroll as percentage of cap (0-100)
     */
    setPayroll(year, payrollPercent) {
        if (year >= 1 && year <= 5) {
            this.state.payrollDecisions[year - 1] = payrollPercent;
            this.calculateHealthScore();
        }
        return this.state;
    },

    /**
     * Apply a decision for a year (decision mode)
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     */
    applyDecision(year, decisionId) {
        if (!this.state.decisionEngine) return null;

        const decision = this.state.decisionEngine.applyDecision(year, decisionId);
        if (decision) {
            // Update payroll decisions from DecisionEngine
            const curve = this.state.decisionEngine.getPayrollCurve();
            this.state.payrollDecisions = curve;
            this.calculateHealthScore();
        }
        return decision;
    },

    /**
     * Get available decisions for a year
     * @param {number} year - Year (1-5)
     * @returns {Array} Available decisions
     */
    getAvailableDecisions(year) {
        if (!this.state.decisionEngine) return [];
        return this.state.decisionEngine.getAvailableDecisions(year);
    },

    /**
     * Get all decisions for a year (including locked ones)
     * @param {number} year - Year (1-5)
     * @returns {Array} All decisions
     */
    getAllDecisions(year) {
        if (!this.state.decisionEngine) return [];
        return this.state.decisionEngine.getAllDecisions(year);
    },

    /**
     * Get the current decision for a year
     * @param {number} year - Year (1-5)
     * @returns {Object} Current decision
     */
    getCurrentDecision(year) {
        if (!this.state.decisionEngine) return null;
        return this.state.decisionEngine.getCurrentDecision(year);
    },

    /**
     * Get the determined path
     * @returns {string} 'winNow', 'rebuild', or 'hybrid'
     */
    getDeterminedPath() {
        if (!this.state.decisionEngine) return null;
        return this.state.decisionEngine.determinePath();
    },

    /**
     * Get payroll for a specific year
     * @param {number} year - Year (1-5)
     * @returns {number} Payroll percentage
     */
    getPayroll(year) {
        return this.state.payrollDecisions[year - 1];
    },

    /**
     * Get the hint/tip for the current year and team
     * @param {number} year - Year (1-5)
     * @returns {string} Hint text
     */
    getYearHint(year) {
        if (this.state.currentTeam && this.state.currentTeam.phaseHints) {
            return this.state.currentTeam.phaseHints[year.toString()];
        }
        return this.PHASES[year].description;
    },

    /**
     * Get phase info for a year
     * @param {number} year - Year (1-5)
     * @returns {Object} Phase name and description
     */
    getPhaseInfo(year) {
        return this.PHASES[year];
    },

    /**
     * Calculate the League Health score based on curve shape
     * For slider mode: compares to ideal curve
     * For decision mode: uses path-specific scoring
     */
    calculateHealthScore() {
        const userCurve = this.state.payrollDecisions;
        const idealCurve = this.state.currentTeam ? this.state.currentTeam.idealCurve : [60, 75, 100, 80, 60];

        let totalScore = 0;

        if (this.state.gameMode === 'decisions' && this.state.decisionEngine) {
            // Path-based scoring
            const path = this.state.decisionEngine.determinePath();
            totalScore = this.scoreByPath(path, userCurve);
        } else {
            // Traditional slider-based scoring
            // Score each year based on closeness to ideal
            for (let i = 0; i < 5; i++) {
                const diff = Math.abs(userCurve[i] - idealCurve[i]);
                // Max 20 points per year (100 total)
                let yearScore;
                if (diff <= 5) {
                    yearScore = 20;
                } else if (diff <= 10) {
                    yearScore = 17;
                } else if (diff <= 15) {
                    yearScore = 14;
                } else if (diff <= 20) {
                    yearScore = 10;
                } else if (diff <= 30) {
                    yearScore = 6;
                } else {
                    yearScore = Math.max(0, 4 - Math.floor((diff - 30) / 10));
                }
                totalScore += yearScore;
            }

            // Bonus/Penalty for curve shape (not flat)
            const curveVariance = this.calculateVariance(userCurve);

            // Penalty for flatline spending
            if (curveVariance < 50) {
                totalScore = Math.max(0, totalScore - 15);
            }

            // Bonus for having a clear peak
            const peakIndex = userCurve.indexOf(Math.max(...userCurve));
            const idealPeakIndex = idealCurve.indexOf(Math.max(...idealCurve));
            if (peakIndex === idealPeakIndex) {
                totalScore += 5;
            }
        }

        // Ensure score is in range
        this.state.healthScore = Math.min(100, Math.max(0, totalScore));
        return this.state.healthScore;
    },

    /**
     * Calculate score based on strategic path
     * @param {string} path - 'winNow', 'rebuild', or 'hybrid'
     * @param {Array} curve - Payroll curve
     * @returns {number} Score
     */
    scoreByPath(path, curve) {
        let score = 0;

        if (path === 'winNow') {
            // Win-Now: Spend 85%+ in years 1-3, taper in 4-5
            const early = curve.slice(0, 3);
            const late = curve.slice(3, 5);

            early.forEach(p => {
                if (p >= 85) score += 15;
                else if (p >= 80) score += 12;
                else if (p >= 75) score += 8;
            });

            late.forEach(p => {
                if (p <= 70) score += 10;
                else if (p <= 75) score += 7;
                else if (p <= 80) score += 4;
            });

            // Diversity bonus
            if (new Set(curve).size >= 4) score += 8;
        } else if (path === 'rebuild') {
            // Rebuild: Spend <65% in years 1-3, build in years 4-5
            const early = curve.slice(0, 3);
            const late = curve.slice(3, 5);

            early.forEach(p => {
                if (p <= 65) score += 15;
                else if (p <= 70) score += 12;
                else if (p <= 75) score += 8;
            });

            late.forEach(p => {
                if (p >= 80) score += 10;
                else if (p >= 75) score += 7;
                else if (p >= 70) score += 4;
            });

            // Diversity bonus
            if (new Set(curve).size >= 4) score += 8;
        } else {
            // Hybrid: Steady 70-80% throughout, balanced
            let steadyCount = 0;
            curve.forEach(p => {
                if (p >= 70 && p <= 80) {
                    score += 15;
                    steadyCount++;
                } else if (p >= 65 && p <= 85) {
                    score += 10;
                }
            });

            // Bonus for consistency
            if (steadyCount >= 3) score += 10;
        }

        return Math.min(100, Math.max(0, score));
    },

    /**
     * Calculate variance of an array
     * @param {Array<number>} arr - Array of numbers
     * @returns {number} Variance
     */
    calculateVariance(arr) {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
    },

    /**
     * Get the user's payroll curve
     * @returns {Array<number>} Payroll decisions
     */
    getUserCurve() {
        return [...this.state.payrollDecisions];
    },

    /**
     * Get the ideal curve for comparison
     * @returns {Array<number>} Ideal payroll curve
     */
    getIdealCurve() {
        return this.state.currentTeam ? [...this.state.currentTeam.idealCurve] : [60, 75, 100, 80, 60];
    },

    /**
     * Move to next year
     * @returns {number} New current year
     */
    nextYear() {
        if (this.state.currentYear < 5) {
            this.state.currentYear++;
        }
        return this.state.currentYear;
    },

    /**
     * Move to previous year
     * @returns {number} New current year
     */
    previousYear() {
        if (this.state.currentYear > 1) {
            this.state.currentYear--;
        }
        return this.state.currentYear;
    },

    /**
     * Go to a specific year
     * @param {number} year - Year to go to (1-5)
     * @returns {number} Current year
     */
    goToYear(year) {
        if (year >= 1 && year <= 5) {
            this.state.currentYear = year;
        }
        return this.state.currentYear;
    },

    /**
     * Complete the game and get results
     * @returns {Object} Game results
     */
    finishGame() {
        this.state.isGameComplete = true;
        this.calculateHealthScore();

        const score = this.state.healthScore;
        let claimCode = null;
        let tier = null;
        let xp = 0;
        let feedback = '';
        let path = null;

        // Determine path and tier
        if (this.state.gameMode === 'decisions' && this.state.decisionEngine) {
            path = this.state.decisionEngine.determinePath();
        }

        // Determine claim code tier based on score
        if (score >= 85) {
            tier = 'GOLD';
            xp = 250;

            if (path) {
                // Path-specific gold tier codes
                claimCode = this.CLAIM_CODES.GOLD[path].code;
                const pathFeedback = {
                    winNow: 'Champion-caliber execution! You maximized your window perfectly.',
                    rebuild: 'Architect-level planning! You built for sustainable success.',
                    hybrid: 'Strategist excellence! You balanced competing and building brilliantly.'
                };
                feedback = `Outstanding! ${pathFeedback[path]}`;
            } else {
                // Slider mode (legacy)
                claimCode = 'CURVE-301-GOLD';
                feedback = 'Outstanding! You mastered the payroll curve rhythm perfectly.';
            }
        } else if (score >= 70) {
            tier = 'SILVER';
            xp = 175;

            if (path) {
                // Path-specific silver tier codes
                claimCode = this.CLAIM_CODES.SILVER[path].code;
                const pathFeedback = {
                    winNow: 'Good win-now execution. Fine-tune your timing for gold!',
                    rebuild: 'Solid rebuild strategy. A bit more patience could be elite!',
                    hybrid: 'Nice balance! Small adjustments for perfection.'
                };
                feedback = `Great job! ${pathFeedback[path]}`;
            } else {
                claimCode = 'CURVE-301-SILVER';
                feedback = 'Great job! You understood the Build-Peak-Reset cycle well.';
            }
        } else if (score >= 55) {
            tier = 'BRONZE';
            xp = 125;

            if (path) {
                // Path-specific bronze tier codes
                claimCode = this.CLAIM_CODES.BRONZE[path].code;
                const pathFeedback = {
                    winNow: 'Good start on win-now strategy. Refine your peak timing!',
                    rebuild: 'Decent rebuild foundation. Build more consistently!',
                    hybrid: 'Fair attempt at balance. Try again for better results!'
                };
                feedback = `Good effort! ${pathFeedback[path]}`;
            } else {
                claimCode = 'CURVE-301-BRONZE';
                feedback = 'Good effort! You grasped the basics of payroll management.';
            }
        } else {
            claimCode = null;
            tier = null;
            xp = 0;
            if (path) {
                feedback = `Your ${path} strategy needs refinement. Try again to improve!`;
            } else {
                feedback = 'Your payroll curve was too flat or poorly timed. Try again!';
            }
        }

        return {
            score: score,
            claimCode: claimCode,
            tier: tier,
            xp: xp,
            feedback: feedback,
            path: path,
            userCurve: this.getUserCurve(),
            idealCurve: this.getIdealCurve(),
            teamName: this.state.currentTeam ? this.state.currentTeam.name : 'Unknown Team'
        };
    },

    /**
     * Reset the game state
     */
    resetGame() {
        this.state = {
            currentTeam: null,
            currentYear: 1,
            payrollDecisions: [50, 50, 50, 50, 50],
            decisionEngine: null,
            healthScore: 50,
            isGameComplete: false,
            gameMode: 'slider'
        };
    },

    /**
     * Get current game state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    },

    /**
     * Convert payroll percentage to dollar amount
     * @param {number} percent - Payroll percentage (0-100)
     * @returns {number} Dollar amount in millions
     */
    percentToMillions(percent) {
        if (!this.state.currentTeam) return 0;
        const cap = this.state.currentTeam.salaryCap;
        // Scale: 0% = 40% of cap, 100% = 140% of cap (for luxury tax teams)
        const minPayroll = cap * 0.4;
        const maxPayroll = cap * 1.4;
        const range = maxPayroll - minPayroll;
        return Math.round(minPayroll + (percent / 100) * range);
    },

    /**
     * Format dollar amount as string
     * @param {number} millions - Amount in millions
     * @returns {string} Formatted string
     */
    formatMoney(millions) {
        return `$${millions}M`;
    },

    /**
     * Get strategy info for a decision
     * @param {number} year - Year (1-5)
     * @param {string} decisionId - Decision ID
     * @returns {Object} Strategy object or null
     */
    getDecisionStrategy(year, decisionId) {
        if (!this.state.decisionEngine) return null;
        return this.state.decisionEngine.getDecisionStrategy(year, decisionId);
    },

    /**
     * Get payroll curve with strategy metadata
     * @returns {Array} Array of objects with year, payroll, strategy info
     */
    getPayrollCurveWithStrategy() {
        if (!this.state.decisionEngine) return null;
        return this.state.decisionEngine.getPayrollCurveWithStrategy();
    },

    /**
     * Get payroll curve statistics
     * @returns {Object} Stats including avg, max, min payroll percentages
     */
    getPayrollCurveStats() {
        const curve = this.state.payrollDecisions;
        const filledCurve = curve.filter(v => v !== null && v !== undefined);

        if (filledCurve.length === 0) {
            return { avg: 0, max: 0, min: 0 };
        }

        const avg = Math.round(filledCurve.reduce((a, b) => a + b, 0) / filledCurve.length);
        const max = Math.max(...filledCurve);
        const min = Math.min(...filledCurve);

        return { avg, max, min };
    },

    /**
     * Get recommended path curves for comparison
     * @returns {Object} Recommended curves for winNow, hybrid, rebuild
     */
    getRecommendedPaths() {
        if (!this.state.currentTeam || !this.state.currentTeam.idealCurve) {
            return {
                winNow: [85, 95, 100, 70, 60],
                hybrid: [75, 75, 75, 75, 75],
                rebuild: [50, 60, 80, 95, 85]
            };
        }

        // Use team's ideal curve as one of the recommendations
        return {
            winNow: [85, 95, 100, 70, 60],
            hybrid: this.state.currentTeam.idealCurve,
            rebuild: [50, 60, 80, 95, 85]
        };
    },

    /**
     * Validate decision consistency
     * Checks if payrollPercentage matches strategy baseline
     * @returns {Array} Array of validation errors
     */
    validateDecisionConsistency() {
        const errors = [];
        if (!this.state.decisionEngine) return errors;

        const curveWithStrategy = this.getPayrollCurveWithStrategy();

        curveWithStrategy.forEach(item => {
            if (item.strategy && item.payroll !== item.baseline) {
                errors.push({
                    year: item.year,
                    message: `Year ${item.year}: Payroll ${item.payroll}% doesn't match baseline ${item.baseline}%`,
                    severity: 'warning'
                });
            }
        });

        return errors;
    },

    /**
     * Validate path coherence
     * Ensures the chosen path has appropriate decisions
     * @returns {Object} Validation result with isCoherent flag and messages
     */
    validatePathCoherence() {
        if (!this.state.decisionEngine) {
            return { isCoherent: true, messages: [] };
        }

        const path = this.getDeterminedPath();
        const curveWithStrategy = this.getPayrollCurveWithStrategy();
        const messages = [];
        let isCoherent = true;

        // Count strategy types
        const strategyCounts = {
            SPEND_HEAVY: 0,
            COMPETITIVE: 0,
            MODERATE: 0,
            REBUILD: 0
        };

        curveWithStrategy.forEach(item => {
            if (item.strategy) {
                strategyCounts[item.strategy]++;
            }
        });

        // Path-specific validation
        if (path === 'winNow') {
            // Win-Now should have 2+ SPEND_HEAVY in years 1-3
            const earlySpendHeavy = curveWithStrategy.slice(0, 3)
                .filter(item => item.strategy === 'SPEND_HEAVY').length;

            if (earlySpendHeavy < 2) {
                isCoherent = false;
                messages.push('Win-Now path should have at least 2 SPEND_HEAVY decisions in Years 1-3');
            }
        } else if (path === 'rebuild') {
            // Rebuild should have 2+ REBUILD/MODERATE in years 1-3
            const earlyRebuild = curveWithStrategy.slice(0, 3)
                .filter(item => item.strategy === 'REBUILD' || item.strategy === 'MODERATE').length;

            if (earlyRebuild < 2) {
                isCoherent = false;
                messages.push('Rebuild path should have at least 2 REBUILD/MODERATE decisions in Years 1-3');
            }
        } else if (path === 'hybrid') {
            // Hybrid should have 3+ COMPETITIVE/MODERATE
            if (strategyCounts.COMPETITIVE + strategyCounts.MODERATE < 3) {
                isCoherent = false;
                messages.push('Hybrid path should have at least 3 COMPETITIVE/MODERATE decisions');
            }
        }

        // Check payroll stays within valid range (40-140%)
        curveWithStrategy.forEach(item => {
            if (item.payroll < 40 || item.payroll > 140) {
                isCoherent = false;
                messages.push(`Year ${item.year}: Payroll ${item.payroll}% is outside valid range (40-140%)`);
            }
        });

        return { isCoherent, messages, strategyCounts };
    }
};

// Make available globally
window.GameEngine = GameEngine;
window.DecisionEngine = DecisionEngine;
