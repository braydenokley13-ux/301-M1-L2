/**
 * Game Engine - Core game logic for The Curve Room 2.0
 * Handles payroll calculations, curve scoring, and claim codes
 */

const GameEngine = {
    // Game state
    state: {
        currentTeam: null,
        currentYear: 1,
        payrollDecisions: [50, 50, 50, 50, 50], // Default 50% for each year
        healthScore: 50,
        isGameComplete: false
    },

    // Claim Code Constants - 3 fixed codes
    CLAIM_CODES: {
        GOLD: { code: 'CURVE-301-GOLD', minScore: 85, xp: 250 },
        SILVER: { code: 'CURVE-301-SILVER', minScore: 70, xp: 175 },
        BRONZE: { code: 'CURVE-301-BRONZE', minScore: 55, xp: 125 }
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
            healthScore: 50,
            isGameComplete: false
        };
        this.calculateHealthScore();
        return this.state;
    },

    /**
     * Set payroll for a specific year
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
     * Compares user's curve to team's ideal curve
     */
    calculateHealthScore() {
        const userCurve = this.state.payrollDecisions;
        const idealCurve = this.state.currentTeam ? this.state.currentTeam.idealCurve : [60, 75, 100, 80, 60];

        let totalScore = 0;

        // Score each year based on closeness to ideal
        for (let i = 0; i < 5; i++) {
            const diff = Math.abs(userCurve[i] - idealCurve[i]);
            // Max 20 points per year (100 total)
            // Full points if within 5%, scaling down
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
        const idealVariance = this.calculateVariance(idealCurve);

        // Penalty for flatline spending (same payroll all years)
        if (curveVariance < 50) {
            // Significant penalty for flat spending
            totalScore = Math.max(0, totalScore - 15);
        }

        // Bonus for having a clear peak
        const peakIndex = userCurve.indexOf(Math.max(...userCurve));
        const idealPeakIndex = idealCurve.indexOf(Math.max(...idealCurve));
        if (peakIndex === idealPeakIndex) {
            totalScore += 5; // Bonus for peaking at right time
        }

        // Ensure score is in range
        this.state.healthScore = Math.min(100, Math.max(0, totalScore));
        return this.state.healthScore;
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

        // Determine claim code tier based on score
        if (score >= this.CLAIM_CODES.GOLD.minScore) {
            claimCode = this.CLAIM_CODES.GOLD.code;
            tier = 'GOLD';
            xp = this.CLAIM_CODES.GOLD.xp;
            feedback = 'Outstanding! You mastered the payroll curve rhythm perfectly. Your team is set up for sustained success!';
        } else if (score >= this.CLAIM_CODES.SILVER.minScore) {
            claimCode = this.CLAIM_CODES.SILVER.code;
            tier = 'SILVER';
            xp = this.CLAIM_CODES.SILVER.xp;
            feedback = 'Great job! You understood the Build-Peak-Reset cycle well. Small tweaks could make you elite!';
        } else if (score >= this.CLAIM_CODES.BRONZE.minScore) {
            claimCode = this.CLAIM_CODES.BRONZE.code;
            tier = 'BRONZE';
            xp = this.CLAIM_CODES.BRONZE.xp;
            feedback = 'Good effort! You grasped the basics of payroll management. Try again to improve your curve timing!';
        } else {
            claimCode = null;
            tier = null;
            xp = 0;
            feedback = 'Your payroll curve was too flat or poorly timed. Remember: Build low, Peak high, then Reset. Try again!';
        }

        return {
            score: score,
            claimCode: claimCode,
            tier: tier,
            xp: xp,
            feedback: feedback,
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
            healthScore: 50,
            isGameComplete: false
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
    }
};

// Make available globally
window.GameEngine = GameEngine;
