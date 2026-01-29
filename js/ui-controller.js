/**
 * UI Controller - Handles all DOM updates and user interactions
 * for The Curve Room 2.0
 */

// Chart instances
let payrollChart = null;
let finalChart = null;

// DOM ready initialization
document.addEventListener('DOMContentLoaded', async function() {
    await initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
    // Load teams data
    await DataLoader.loadTeams();

    // Set up team card click handlers
    setupTeamCards();

    // Set up year tabs
    setupYearTabs();

    // Set up payroll slider
    setupPayrollSlider();

    console.log('Curve Room 2.0 initialized');
}

/**
 * Set up click handlers for team selection cards
 */
function setupTeamCards() {
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('click', async function() {
            const teamId = this.dataset.team;
            await selectTeam(teamId);
        });
    });
}

/**
 * Set up year tab click handlers
 */
function setupYearTabs() {
    const yearTabs = document.querySelectorAll('.year-tab');
    yearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const year = parseInt(this.dataset.year);
            goToYear(year);
        });
    });
}

/**
 * Set up payroll slider input handler
 */
function setupPayrollSlider() {
    const slider = document.getElementById('payroll-slider');
    if (slider) {
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            updatePayroll(value);
        });
    }
}

/**
 * Select a team and show briefing page
 * @param {string} teamId - Team identifier
 */
async function selectTeam(teamId) {
    const teamData = await DataLoader.getTeam(teamId);
    if (!teamData) {
        console.error('Team not found:', teamId);
        return;
    }

    // Update briefing page
    document.getElementById('briefing-team-name').textContent = teamData.name;
    document.getElementById('briefing-situation').textContent = teamData.situation;
    document.getElementById('current-payroll').textContent = `$${teamData.currentPayroll}M`;
    document.getElementById('salary-cap').textContent = `$${teamData.salaryCap}M`;
    document.getElementById('cap-space').textContent = `$${teamData.capSpace}M`;
    document.getElementById('challenge-text').textContent = teamData.challenge;

    // Populate key contracts
    const contractsList = document.getElementById('contracts-list');
    contractsList.innerHTML = '';
    teamData.keyContracts.forEach(contract => {
        const contractCard = document.createElement('div');
        contractCard.className = 'contract-card';
        contractCard.innerHTML = `
            <div class="player-name">${contract.player}</div>
            <div class="contract-details">
                ${contract.position} | $${contract.salary}M | ${contract.years} yr${contract.years > 1 ? 's' : ''}
            </div>
        `;
        contractsList.appendChild(contractCard);
    });

    // Store selected team for game start
    window.selectedTeamId = teamId;

    // Show briefing page
    showPage('briefing-page');
}

/**
 * Start the game with the selected team
 */
async function startGame() {
    const teamId = window.selectedTeamId;
    if (!teamId) {
        console.error('No team selected');
        return;
    }

    const teamData = await DataLoader.getTeam(teamId);
    GameEngine.initGame(teamData);

    // Update game page header
    document.getElementById('game-team-name').textContent = teamData.name;

    // Reset to year 1
    goToYear(1);

    // Initialize chart
    initPayrollChart();

    // Update UI
    updateHealthMeter();
    updateYearDisplay();

    // Show game page
    showPage('game-page');
}

/**
 * Initialize the payroll curve chart
 */
function initPayrollChart() {
    const ctx = document.getElementById('payroll-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (payrollChart) {
        payrollChart.destroy();
    }

    const userCurve = GameEngine.getUserCurve();
    const idealCurve = GameEngine.getIdealCurve();

    payrollChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Your Curve',
                    data: userCurve,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: '#1a73e8'
                },
                {
                    label: 'Ideal Curve',
                    data: idealCurve,
                    borderColor: '#cccccc',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#cccccc'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Payroll (% of Cap)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            animation: {
                duration: 300
            }
        }
    });
}

/**
 * Update the payroll chart with current data
 */
function updatePayrollChart() {
    if (!payrollChart) return;

    const userCurve = GameEngine.getUserCurve();
    payrollChart.data.datasets[0].data = userCurve;
    payrollChart.update('none');
}

/**
 * Go to a specific year
 * @param {number} year - Year number (1-5)
 */
function goToYear(year) {
    GameEngine.goToYear(year);
    updateYearDisplay();
}

/**
 * Update the year display and controls
 */
function updateYearDisplay() {
    const state = GameEngine.getState();
    const year = state.currentYear;
    const phaseInfo = GameEngine.getPhaseInfo(year);
    const hint = GameEngine.getYearHint(year);
    const currentPayroll = GameEngine.getPayroll(year);

    // Update year tabs
    document.querySelectorAll('.year-tab').forEach(tab => {
        const tabYear = parseInt(tab.dataset.year);
        tab.classList.remove('active', 'completed');
        if (tabYear === year) {
            tab.classList.add('active');
        } else if (tabYear < year) {
            tab.classList.add('completed');
        }
    });

    // Update year title and description
    document.getElementById('year-title').textContent = `Year ${year} - ${phaseInfo.name}`;
    document.getElementById('year-description').textContent = phaseInfo.description;
    document.getElementById('action-hint').textContent = `Tip: ${hint}`;

    // Check game mode: decisions or slider
    if (state.gameMode === 'decisions') {
        // Hide slider, show decision cards
        renderDecisionCards(year);
        displayPayrollCurveInfo();
    } else {
        // Show slider for slider mode
        const slider = document.getElementById('payroll-slider');
        slider.value = currentPayroll;
        updatePayrollDisplay(currentPayroll);
    }

    // Update navigation buttons
    document.getElementById('prev-year-btn').disabled = (year === 1);

    if (year === 5) {
        document.getElementById('next-year-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-year-btn').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
    }
}

/**
 * Render decision cards with strategy tags for decision mode
 * @param {number} year - Current year
 */
function renderDecisionCards(year) {
    const payrollAdjuster = document.querySelector('.payroll-adjuster');
    const actionsDiv = document.querySelector('.decision-actions');

    if (!payrollAdjuster) return;

    // Hide slider
    payrollAdjuster.style.display = 'none';

    // Get available decisions
    const decisions = GameEngine.getAllDecisions(year);
    const currentDecision = GameEngine.getCurrentDecision(year);
    const availableDecisions = GameEngine.getAvailableDecisions(year);

    // Create decision cards container
    let cardsContainer = document.getElementById('decision-cards-container');
    if (!cardsContainer) {
        cardsContainer = document.createElement('div');
        cardsContainer.id = 'decision-cards-container';
        cardsContainer.className = 'decision-cards-grid';
        payrollAdjuster.parentNode.insertBefore(cardsContainer, actionsDiv);
    }

    // Clear existing cards
    cardsContainer.innerHTML = '';

    // Render each decision as a card
    decisions.forEach(decision => {
        const isLocked = !availableDecisions.find(d => d.id === decision.id);
        const isSelected = currentDecision && currentDecision.id === decision.id;

        const card = document.createElement('div');
        card.className = `decision-card ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`;

        const strategy = decision.strategy;
        const strategyTag = strategy ? strategy.tag : 'UNKNOWN';
        const strategyClass = strategyTag.toLowerCase().replace('_', '-');

        card.innerHTML = `
            <div class="decision-card-header">
                <h4 class="decision-title">${decision.title}</h4>
                ${strategy ? `<span class="strategy-tag ${strategyClass}">${strategyTag}</span>` : ''}
            </div>
            <div class="decision-description">${decision.description}</div>
            ${strategy ? `<div class="strategy-flavor">${strategy.flavor}</div>` : ''}
            <div class="decision-impact">
                <div class="payroll-impact">
                    <span class="impact-label">Payroll:</span>
                    <span class="impact-value">${decision.payrollPercentage}% of cap</span>
                </div>
                ${decision.flags.unlock.length > 0 ? `
                    <div class="flag-impact">
                        <span class="impact-label">Unlocks:</span>
                        <span class="impact-value">${decision.flags.unlock.join(', ')}</span>
                    </div>
                ` : ''}
                ${decision.flags.lock.length > 0 ? `
                    <div class="flag-impact">
                        <span class="impact-label">Locks:</span>
                        <span class="impact-value">${decision.flags.lock.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
            <button class="select-decision-btn" ${isLocked || isSelected ? 'disabled' : ''}
                onclick="selectDecision(${year}, '${decision.id}')">
                ${isSelected ? 'Selected' : isLocked ? 'Locked' : 'Select'}
            </button>
        `;

        cardsContainer.appendChild(card);
    });
}

/**
 * Select a decision for the current year
 * @param {number} year - Year number
 * @param {string} decisionId - Decision ID
 */
function selectDecision(year, decisionId) {
    const decision = GameEngine.applyDecision(year, decisionId);
    if (decision) {
        updateYearDisplay();
        updatePayrollChart();
        updateHealthMeter();
    }
}

/**
 * Display payroll curve information with strategy breakdown
 */
function displayPayrollCurveInfo() {
    const state = GameEngine.getState();
    if (state.gameMode !== 'decisions') return;

    // Get curve with strategy
    const curveWithStrategy = GameEngine.getPayrollCurveWithStrategy();
    const stats = GameEngine.getPayrollCurveStats();
    const path = GameEngine.getDeterminedPath();

    // Find or create info panel
    let infoPanel = document.getElementById('payroll-curve-info');
    if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.id = 'payroll-curve-info';
        infoPanel.className = 'payroll-curve-info';

        const chartSection = document.querySelector('.chart-section');
        if (chartSection) {
            chartSection.appendChild(infoPanel);
        }
    }

    // Build the info panel HTML
    let html = '<div class="curve-stats">';
    html += '<h3>Your Spending Path</h3>';
    html += `<div class="stats-grid">`;
    html += `<div class="stat-item"><span class="stat-label">Avg:</span><span class="stat-value">${stats.avg}%</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Max:</span><span class="stat-value">${stats.max}%</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Min:</span><span class="stat-value">${stats.min}%</span></div>`;
    html += `</div>`;

    if (path) {
        html += `<div class="path-indicator">Strategy Path: <strong>${path.toUpperCase()}</strong></div>`;
    }

    html += '</div>';

    // Year-by-year breakdown
    html += '<div class="year-breakdown">';
    html += '<h4>Year-by-Year Breakdown</h4>';
    curveWithStrategy.forEach(item => {
        const strategyClass = item.strategy ? item.strategy.toLowerCase().replace('_', '-') : 'none';
        html += `
            <div class="year-breakdown-item">
                <span class="year-label">Year ${item.year}:</span>
                ${item.strategy ? `<span class="strategy-tag-small ${strategyClass}">${item.strategy}</span>` : ''}
                <span class="payroll-value">${item.payroll}%</span>
            </div>
        `;
    });
    html += '</div>';

    infoPanel.innerHTML = html;
}

/**
 * Update the payroll display values
 * @param {number} percent - Payroll percentage
 */
function updatePayrollDisplay(percent) {
    const millions = GameEngine.percentToMillions(percent);
    document.getElementById('payroll-amount').textContent = GameEngine.formatMoney(millions);
    document.getElementById('payroll-percent').textContent = `(${percent}% of cap)`;
}

/**
 * Update payroll for current year
 * @param {number} value - Payroll percentage (0-100)
 */
function updatePayroll(value) {
    const state = GameEngine.getState();
    GameEngine.setPayroll(state.currentYear, value);

    updatePayrollDisplay(value);
    updatePayrollChart();
    updateHealthMeter();
}

/**
 * Update the health meter display
 */
function updateHealthMeter() {
    const state = GameEngine.getState();
    const score = state.healthScore;

    document.getElementById('health-fill').style.width = `${score}%`;
    document.getElementById('health-score').textContent = Math.round(score);

    // Color the score based on tier
    const scoreEl = document.getElementById('health-score');
    if (score >= 85) {
        scoreEl.style.color = '#ffd700'; // Gold
    } else if (score >= 70) {
        scoreEl.style.color = '#c0c0c0'; // Silver
    } else if (score >= 55) {
        scoreEl.style.color = '#cd7f32'; // Bronze
    } else {
        scoreEl.style.color = '#dc3545'; // Red (fail)
    }
}

/**
 * Navigate to next year
 */
function nextYear() {
    GameEngine.nextYear();
    updateYearDisplay();
}

/**
 * Navigate to previous year
 */
function previousYear() {
    GameEngine.previousYear();
    updateYearDisplay();
}

/**
 * Confirm exit from game
 */
function confirmExit() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        GameEngine.resetGame();
        showPage('landing-page');
    }
}

/**
 * Finish the game and show results
 */
function finishGame() {
    const results = GameEngine.finishGame();
    displayResults(results);
    showPage('results-page');
}

/**
 * Display game results
 * @param {Object} results - Game results from GameEngine
 */
function displayResults(results) {
    // Final score
    document.getElementById('final-score').textContent = Math.round(results.score);
    document.getElementById('score-feedback').textContent = results.feedback;

    // Claim code section
    const claimSection = document.getElementById('claim-code-section');
    const noCodeSection = document.getElementById('no-code-section');

    if (results.claimCode) {
        claimSection.classList.remove('hidden');
        noCodeSection.classList.add('hidden');

        const tierBadge = document.getElementById('claim-code-tier');
        tierBadge.textContent = results.tier;
        tierBadge.className = 'tier-badge ' + results.tier.toLowerCase();

        document.getElementById('claim-code-text').textContent = results.claimCode;
        document.getElementById('xp-value').textContent = `${results.xp} XP`;
    } else {
        claimSection.classList.add('hidden');
        noCodeSection.classList.remove('hidden');
    }

    // Final chart
    initFinalChart(results.userCurve, results.idealCurve);
}

/**
 * Initialize the final results chart
 * @param {Array<number>} userCurve - User's payroll decisions
 * @param {Array<number>} idealCurve - Ideal payroll curve
 */
function initFinalChart(userCurve, idealCurve) {
    const ctx = document.getElementById('final-chart');
    if (!ctx) return;

    if (finalChart) {
        finalChart.destroy();
    }

    finalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Your Curve',
                    data: userCurve,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: '#1a73e8'
                },
                {
                    label: 'Ideal Curve',
                    data: idealCurve,
                    borderColor: '#28a745',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#28a745'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Payroll (% of Cap)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Copy claim code to clipboard
 */
function copyClaimCode() {
    const codeText = document.getElementById('claim-code-text').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Code: ' + codeText);
    });
}

/**
 * Play again with the same team
 */
function playAgain() {
    const teamId = window.selectedTeamId;
    if (teamId) {
        startGame();
    } else {
        goHome();
    }
}

/**
 * Go back to home page
 */
function goHome() {
    GameEngine.resetGame();
    window.selectedTeamId = null;
    showPage('landing-page');
}

/**
 * Show a specific page
 * @param {string} pageId - ID of the page to show
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Make functions available globally
window.selectTeam = selectTeam;
window.startGame = startGame;
window.nextYear = nextYear;
window.previousYear = previousYear;
window.confirmExit = confirmExit;
window.finishGame = finishGame;
window.copyClaimCode = copyClaimCode;
window.playAgain = playAgain;
window.goHome = goHome;
window.showPage = showPage;
window.selectDecision = selectDecision;
