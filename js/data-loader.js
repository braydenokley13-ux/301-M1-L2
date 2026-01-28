/**
 * Data Loader - Manages team and salary data for The Curve Room 2.0
 */

const DataLoader = {
    teamsData: null,

    /**
     * Load teams data from JSON file
     * @returns {Promise<Object>} Teams data object
     */
    async loadTeams() {
        if (this.teamsData) {
            return this.teamsData;
        }

        try {
            const response = await fetch('data/teams.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.teamsData = await response.json();
            return this.teamsData;
        } catch (error) {
            console.error('Error loading teams data:', error);
            // Return embedded fallback data
            return this.getFallbackData();
        }
    },

    /**
     * Get a specific team by ID
     * @param {string} teamId - The team identifier
     * @returns {Object|null} Team data or null if not found
     */
    async getTeam(teamId) {
        const teams = await this.loadTeams();
        return teams[teamId] || null;
    },

    /**
     * Get all teams
     * @returns {Promise<Object>} All teams data
     */
    async getAllTeams() {
        return await this.loadTeams();
    },

    /**
     * Get teams filtered by league
     * @param {string} league - NBA, MLB, or NFL
     * @returns {Promise<Array>} Array of team objects
     */
    async getTeamsByLeague(league) {
        const teams = await this.loadTeams();
        return Object.values(teams).filter(team => team.league === league);
    },

    /**
     * Fallback data in case JSON file fails to load
     * This is embedded directly for GitHub Pages reliability
     */
    getFallbackData() {
        return {
            "knicks": {
                "id": "knicks",
                "name": "New York Knicks",
                "league": "NBA",
                "logo": "NYK",
                "situation": "Win-Now Window",
                "difficulty": "Hard",
                "currentPayroll": 192,
                "salaryCap": 141,
                "luxuryTax": 171,
                "capSpace": -51,
                "challenge": "You have a championship-caliber roster with expensive veterans. Your window to win is NOW, but the salary cap is tight. Can you manage the payroll curve to maximize your title chances while preparing for the inevitable reset?",
                "keyContracts": [
                    { "player": "Jalen Brunson", "salary": 36.9, "years": 4, "position": "PG" },
                    { "player": "Julius Randle", "salary": 28.9, "years": 2, "position": "PF" },
                    { "player": "OG Anunoby", "salary": 38.3, "years": 5, "position": "SF" },
                    { "player": "Karl-Anthony Towns", "salary": 49.2, "years": 3, "position": "C" },
                    { "player": "Mikal Bridges", "salary": 23.3, "years": 2, "position": "SG" }
                ],
                "idealCurve": [90, 95, 100, 85, 70],
                "startingPayroll": 95,
                "phaseHints": {
                    "1": "You're already spending big. Maintain or slightly increase to maximize your window.",
                    "2": "Push spending to the max - this is your peak year to compete!",
                    "3": "Championship or bust! Go all in on your stars.",
                    "4": "Start thinking about the future. Begin reducing payroll gradually.",
                    "5": "Reset time. Cut payroll significantly to rebuild cap flexibility."
                }
            },
            "nets": {
                "id": "nets",
                "name": "Brooklyn Nets",
                "league": "NBA",
                "logo": "BKN",
                "situation": "Rebuild Phase",
                "difficulty": "Medium",
                "currentPayroll": 124,
                "salaryCap": 141,
                "luxuryTax": 171,
                "capSpace": 17,
                "challenge": "After trading away your stars, you're in full rebuild mode. You have young talent and cap flexibility. Build slowly, peak when your young core matures, then prepare for extensions.",
                "keyContracts": [
                    { "player": "Cameron Johnson", "salary": 22.5, "years": 3, "position": "SF" },
                    { "player": "Nic Claxton", "salary": 21.0, "years": 3, "position": "C" },
                    { "player": "Cameron Thomas", "salary": 4.5, "years": 2, "position": "SG" },
                    { "player": "Mikal Bridges", "salary": 23.3, "years": 2, "position": "SF" },
                    { "player": "Day'Ron Sharpe", "salary": 2.1, "years": 1, "position": "C" }
                ],
                "idealCurve": [50, 60, 80, 95, 85],
                "startingPayroll": 55,
                "phaseHints": {
                    "1": "Stay patient. Keep payroll low while developing young talent.",
                    "2": "Slight increase as young players improve. Add role players.",
                    "3": "Your young core is maturing. Start spending on key additions.",
                    "4": "Peak year! Your young stars are ready - spend aggressively.",
                    "5": "Maintain success or begin planning the next reset cycle."
                }
            },
            "yankees": {
                "id": "yankees",
                "name": "New York Yankees",
                "league": "MLB",
                "logo": "NYY",
                "situation": "Competitive Window",
                "difficulty": "Hard",
                "currentPayroll": 305,
                "salaryCap": 237,
                "luxuryTax": 237,
                "capSpace": -68,
                "challenge": "The Yankees are committed to winning now with a massive payroll. Navigate arbitration years and decide when to push for a championship vs. when to reset for the future.",
                "keyContracts": [
                    { "player": "Aaron Judge", "salary": 40.0, "years": 7, "position": "RF" },
                    { "player": "Gerrit Cole", "salary": 36.0, "years": 4, "position": "SP" },
                    { "player": "Juan Soto", "salary": 51.0, "years": 14, "position": "LF" },
                    { "player": "Giancarlo Stanton", "salary": 32.0, "years": 3, "position": "DH" },
                    { "player": "Jazz Chisholm Jr.", "salary": 9.5, "years": 2, "position": "3B" }
                ],
                "idealCurve": [95, 100, 90, 75, 65],
                "startingPayroll": 95,
                "phaseHints": {
                    "1": "You're already spending heavily. Maintain competitiveness.",
                    "2": "This is your best chance with current core. Go all in!",
                    "3": "Begin transition. Keep competitive but start reducing.",
                    "4": "Major contracts aging. Reduce payroll strategically.",
                    "5": "Reset phase. Shed salary, prepare for next competitive window."
                }
            },
            "mets": {
                "id": "mets",
                "name": "New York Mets",
                "league": "MLB",
                "logo": "NYM",
                "situation": "Emerging Contender",
                "difficulty": "Medium",
                "currentPayroll": 245,
                "salaryCap": 237,
                "luxuryTax": 237,
                "capSpace": -8,
                "challenge": "Steve Cohen's deep pockets allow aggressive spending, but even the Mets need a strategy. Time your investments to peak when your young arms mature.",
                "keyContracts": [
                    { "player": "Francisco Lindor", "salary": 34.1, "years": 8, "position": "SS" },
                    { "player": "Brandon Nimmo", "salary": 23.5, "years": 5, "position": "CF" },
                    { "player": "Pete Alonso", "salary": 20.5, "years": 1, "position": "1B" },
                    { "player": "Kodai Senga", "salary": 15.0, "years": 3, "position": "SP" },
                    { "player": "Edwin Diaz", "salary": 19.4, "years": 3, "position": "RP" }
                ],
                "idealCurve": [70, 80, 95, 100, 80],
                "startingPayroll": 75,
                "phaseHints": {
                    "1": "Build carefully. Invest in player development.",
                    "2": "Add complementary pieces as young pitching develops.",
                    "3": "Young arms maturing. Increase spending strategically.",
                    "4": "Championship window open! Maximize payroll.",
                    "5": "Evaluate and adjust. Begin next cycle preparation."
                }
            },
            "jets": {
                "id": "jets",
                "name": "New York Jets",
                "league": "NFL",
                "logo": "NYJ",
                "situation": "Rookie QB Window",
                "difficulty": "Medium",
                "currentPayroll": 215,
                "salaryCap": 255,
                "luxuryTax": 255,
                "capSpace": 40,
                "challenge": "With a potential franchise QB on a rookie deal, you have a 4-5 year window to build a contender before his contract explodes. Spend aggressively now while the QB cap hit is low.",
                "keyContracts": [
                    { "player": "Aaron Rodgers", "salary": 37.5, "years": 1, "position": "QB" },
                    { "player": "Sauce Gardner", "salary": 8.6, "years": 2, "position": "CB" },
                    { "player": "Garrett Wilson", "salary": 6.5, "years": 2, "position": "WR" },
                    { "player": "Quinnen Williams", "salary": 26.2, "years": 3, "position": "DT" },
                    { "player": "D.J. Reed", "salary": 11.0, "years": 2, "position": "CB" }
                ],
                "idealCurve": [75, 90, 100, 85, 65],
                "startingPayroll": 70,
                "phaseHints": {
                    "1": "Rookie QB on cheap deal. Start building around him.",
                    "2": "Aggressively add talent. Your QB window is open.",
                    "3": "Peak spending year! Go all-in for a championship.",
                    "4": "QB extension coming. Start reducing other salaries.",
                    "5": "Big QB deal kicks in. Reset other positions accordingly."
                }
            },
            "giants": {
                "id": "giants",
                "name": "New York Giants",
                "league": "NFL",
                "logo": "NYG",
                "situation": "Post-Star Reset",
                "difficulty": "Easy",
                "currentPayroll": 198,
                "salaryCap": 255,
                "luxuryTax": 255,
                "capSpace": 57,
                "challenge": "After the Saquon Barkley era, you're rebuilding with a young QB and plenty of cap space. This is a classic rebuild scenario - be patient, develop your young core, and time your spending to peak when they're ready.",
                "keyContracts": [
                    { "player": "Daniel Jones", "salary": 40.0, "years": 3, "position": "QB" },
                    { "player": "Andrew Thomas", "salary": 21.0, "years": 4, "position": "LT" },
                    { "player": "Dexter Lawrence", "salary": 21.0, "years": 4, "position": "DT" },
                    { "player": "Brian Burns", "salary": 28.5, "years": 4, "position": "EDGE" },
                    { "player": "Bobby Okereke", "salary": 10.0, "years": 2, "position": "LB" }
                ],
                "idealCurve": [55, 65, 80, 95, 90],
                "startingPayroll": 55,
                "phaseHints": {
                    "1": "Keep payroll low. Focus on the draft and development.",
                    "2": "Slight increase. Add smart veteran mentors.",
                    "3": "Young core developing. Start strategic spending.",
                    "4": "Your rebuild is paying off. Spend aggressively to compete.",
                    "5": "Maintain success. Prepare for extension decisions."
                }
            }
        };
    }
};

// Make available globally
window.DataLoader = DataLoader;
