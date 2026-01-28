# The Curve Room 2.0: Implementation Plan
**Transform "Abstract Teams" → Real NYC Teams on GitHub Pages**

---

## PROJECT OVERVIEW

### Goal
Convert the Curve Room educational simulation from a Google Forms/Sheets backend to a **real-time interactive GitHub Pages web app** using actual 2025-2026 salary data and NYC team rosters.

### Target Audience
9th/10th graders learning sports management through **salary cap timing/sequencing** education.

### Success Metrics
- Real-time visual feedback as users make payroll decisions
- 3-tier claim code system (Gold/Silver/Bronze XP rewards)
- Accessible interface for non-financial students
- Emphasis on "payroll curve" rhythm: Build → Peak → Reset

---

## ARCHITECTURE DESIGN

### Technology Stack
- **Hosting**: GitHub Pages (static site)
- **Frontend**: HTML5/CSS3/JavaScript (vanilla - no frameworks needed for MVP)
- **Data**: Embedded JSON with real 2025-2026 salary cap data
- **Visualization**: Chart.js or similar for payroll curve rendering
- **Claim Code Generation**: Client-side hash/token based on performance

### Why GitHub Pages?
- Free hosting, automatic deployment from repo
- Perfect for static educational content
- No backend/database needed (all logic runs client-side)
- Easy to share links with students

---

## CONTENT & DATA STRUCTURE

### Six Real Teams (NYC Metro + Regional)
Each team has **two situation variants** for different difficulty/learning angles:

#### **NBA** (Knicks vs Nets)
1. **Knicks**: "Win-Now Window" - High payroll, aging stars, reset coming
   - Current contracts: Jalen Brunson ($113M+), Julius Randle, Isaiah Hartenstein
   - Challenge: Manage decline of expensive vets while maintaining competitiveness

2. **Nets**: "Rebuild Phase" - Low payroll, youth-focused, cap space available
   - Challenge: Determine when/how much to spend on young core (Cameron Thomas, etc.)

#### **MLB** (Yankees vs Mets)
1. **Yankees**: "Competitive Window" - High payroll, star-heavy roster, arbitration coming
   - Real data: Aaron Judge, Giancarlo Stanton, Gerrit Cole extensions/arbitration cycles
   - Challenge: Manage arbitration inflation through curve shape

2. **Mets**: "Emerging Contender" - Moderate payroll, young pitching, strategic spending window
   - Challenge: Time investments in core (deGrom recovery, young arms)

#### **NFL** (Jets vs Giants)
1. **Jets**: "Rookie QB Window" - Maximize rookie deal cap advantage (Aaron Rodgers complicates this, but frame as "veteran bridge")
   - Challenge: Aggressive spending while QB is cheap, manage spike/reset

2. **Giants**: "Post-Star Reset" - Saquon Barkley era, rebuilding cap, young QB learning
   - Challenge: Build carefully to avoid flat spending

### Real Salary Data Sources
- **2025-2026 Spotrac data** (web scrape or manual compilation)
- **Official league salary databases** (MLB Trade Tracker, Overthecap, Basketball-Reference)
- **Embed as JSON** in the game (refresh yearly or note as "2025-26 season snapshot")

---

## GAME MECHANICS

### User Flow
1. **Landing Page**: Select a team (6 options)
2. **Team Briefing**: Show current cap situation, payroll chart, key player contracts
3. **Game Interface**:
   - 5-year timeline (Years 1-5)
   - Decision interface for each year
   - Real-time payroll curve visualization
   - "League Health Meter" (0-100 scale)
4. **Decision Points**: Each year user allocates/adjusts payroll within constraints
5. **Evaluation**: System scores curve shape against ideal "Build→Peak→Reset" pattern
6. **Claim Code**: Generate based on performance tier

### League Health Meter
Tracks adherence to payroll curve principles:
- **Build Phase** (Years 1-2): Reward restraint, cap flexibility maintenance
- **Peak Phase** (Year 3): Reward aggressive spending, star acquisitions
- **Reset Phase** (Years 4-5): Reward payroll reduction, long-term flexibility restoration
- Penalty for "flatline" spending (same payroll all 5 years)

### Claim Code System
Three tiers based on final League Health score (constant codes validated by XP system):

| Tier | Health Score | Code | XP Value |
|------|-------------|------|----------|
| 🥇 Gold | 85-100 | `CURVE-301-GOLD` | 250 XP |
| 🥈 Silver | 70-84 | `CURVE-301-SILVER` | 175 XP |
| 🥉 Bronze | 55-69 | `CURVE-301-BRONZE` | 125 XP |
| ❌ Fail | <55 | *No code* | 0 XP |

---

## IMPLEMENTATION ROADMAP

### Phase 1: Project Setup
- Create GitHub Pages repository structure
- Set up folder organization:
  ```
  /css/ → styles.css
  /js/ → game-engine.js, ui-controller.js, data-loader.js
  /data/ → teams.json (salary data), rosters.json
  /assets/ → team logos, charts, fonts
  index.html (main entry)
  ```
- Initialize git branch: `claude/real-teams-github-pages-Jml8P`

### Phase 2: Data Collection & Preparation
- **Research & verify** actual 2025-2026 salary cap data from official sources:
  - **NBA**: Spotrac, Basketball-Reference (Knicks & Nets)
  - **MLB**: MLB Trade Tracker, Spotrac (Yankees & Mets)
  - **NFL**: Over the Cap, Spotrac (Jets & Giants)
- Compile verified payroll figures, cap space, key contract details
- Create JSON structure with real data:
  ```json
  {
    "knicks": {
      "league": "NBA",
      "situation": "Win-Now Window",
      "currentPayroll": [VERIFIED 2025-26 ACTUAL],
      "capSpace": [VERIFIED],
      "keyContracts": [...],
      "roster": [...]
    }
  }
  ```
- Build roster data with real player names, positions, actual 2025-26 salaries

### Phase 3: HTML/CSS Base
- Build clean, accessible UI for 9th-10th graders
- Responsive design (mobile-friendly)
- Color-coded teams (Knicks blue, Nets black, etc.)
- Charts/graph area for payroll visualization

### Phase 4: Game Engine (JavaScript)
- **GameState object**: Track team selection, 5 years of decisions, calculations
- **PayrollCalculator**:
  - Validate payroll constraints (league caps, team-specific limits)
  - Calculate "curve health" score based on year-to-year spending pattern
  - Detect flatline penalty
- **UIController**: Update visuals in real-time as user adjusts payroll
- **ClaimCodeDisplay**: Show appropriate constant claim code (GOLD/SILVER/BRONZE) based on final score

### Phase 5: Visual Feedback
- **Chart.js integration** to render payroll curve graph in real-time
- Animate curve as user makes changes
- Show "Ideal Curve" overlay for comparison
- League Health Meter (progress bar or gauge)

### Phase 6: Results Display
- Display final League Health score and payroll curve vs. ideal
- Show appropriate claim code (CURVE-301-GOLD/SILVER/BRONZE) or failure message
- Copy-to-clipboard functionality for claim code
- Brief educational recap of what they learned

---

## CRITICAL FILES TO CREATE

| File | Purpose |
|------|---------|
| `index.html` | Landing page, team selector, main game wrapper |
| `css/styles.css` | All styling (clean, accessible, sport-branded) |
| `js/game-engine.js` | Core game logic, curve scoring, calculations |
| `js/ui-controller.js` | DOM updates, interactivity, real-time feedback |
| `js/data-loader.js` | Load and manage team/salary data |
| `data/teams.json` | All 6 teams with 2025-26 salary data |
| `data/rosters.json` | Player rosters for each team |

---

## VERIFICATION / TESTING CHECKLIST

- [ ] All 6 teams load correctly with accurate salary data
- [ ] Payroll curve renders correctly using Chart.js
- [ ] Year-to-year payroll adjustments update graph in real-time
- [ ] League Health Meter responds accurately to spending patterns
- [ ] Claim code generation produces unique codes for each performance level
- [ ] Failure state (no code) triggers below 55 health score
- [ ] Mobile responsive (viewable on phones/tablets)
- [ ] Educational messaging clear for 9th/10th grade audience
- [ ] GitHub Pages deployment works and loads properly
- [ ] XP system can parse and validate claim codes (test with sample codes)

---

## DEPLOYMENT

1. **Local Testing**: Run on local server, test all 6 teams
2. **Commit to Branch**: Push all changes to `claude/real-teams-github-pages-Jml8P`
3. **Enable GitHub Pages**: Configure repo settings to publish from `/docs` or root
4. **Share URL**: Provide students with GitHub Pages link
5. **Monitor**: Track claim code submissions in XP system

---

## NOTES FOR 9TH/10TH GRADE AUDIENCE

- Use simple language in UI ("spend," "hold back," "manage payroll")
- Include brief tooltips explaining cap concepts
- Avoid finance jargon; focus on sports narrative
- Make the curve visual intuitive (they'll understand "build low → spend big → cool off")
- Success feels achievable (3 tiers mean most students earn *some* code)

---

## FUTURE ENHANCEMENTS (Post-MVP)

- Leaderboard (track high scores)
- Multiplayer mode (compete against classmates)
- Real-time trade/FA market during simulation
- Integration with Efficiency Frontier (Module 1, Lesson 3)
- Yearly data updates with new real rosters
