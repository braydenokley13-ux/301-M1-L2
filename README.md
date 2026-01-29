# The Curve Room 2.0

**Master the Payroll Curve: Build, Peak, Reset**

A salary cap simulation game where you manage real NYC sports teams through 5-year payroll strategies. Learn how professional sports organizations balance winning now versus building for the future.

---

## How It Works

Choose one of 6 NYC teams across 3 leagues, then set payroll decisions for each of 5 years. Your goal: craft a spending curve that matches your team's ideal strategy.

### Teams

| League | Team | Situation | Mode |
|--------|------|-----------|------|
| NBA | New York Knicks | Win-Now Window | Decisions |
| NBA | Brooklyn Nets | Rebuild Phase | Slider |
| MLB | New York Yankees | Competitive Window | Slider |
| MLB | New York Mets | Emerging Contender | Decisions |
| NFL | New York Jets | Rookie QB Window | Decisions |
| NFL | New York Giants | Post-Star Reset | Slider |

### Game Modes

**Decision Mode** (Knicks, Mets, Jets) - Choose from 4 strategy-tagged decisions per year. Each decision sets your payroll, unlocks/locks future options, and pushes you toward a Win-Now, Rebuild, or Hybrid path.

**Slider Mode** (Nets, Yankees, Giants) - Manually set payroll percentage each year using a slider. Match the ideal curve as closely as possible.

---

## Strategy Tags

Decisions are categorized into 4 spending profiles:

| Tag | Payroll Range | Color | Philosophy |
|-----|--------------|-------|------------|
| `SPEND_HEAVY` | 85-100% | Red | Aggressive win-now spending |
| `COMPETITIVE` | 70-84% | Orange | Maintain competitiveness |
| `MODERATE` | 55-69% | Green | Balanced, cautious approach |
| `REBUILD` | 40-54% | Blue | Future-focused investment |

---

## Real-Time Visualization

The payroll curve chart updates live as you make decisions:

- **Strategy-colored data points** - Each year's dot reflects its strategy tag color
- **Luxury tax threshold line** - Dashed red line showing the tax boundary
- **Payroll floor line** - Dashed gray line showing the league minimum
- **Animated feedback flash** - Color-coded banner appears on each decision with payroll impact in dollars
- **Strategy comparison widget** - Side-by-side mini bar charts comparing your curve against Win-Now, Hybrid, and Rebuild recommended paths with similarity percentages
- **Spending trend indicator** - Shows whether your path is front-loaded, back-loaded, or balanced

---

## Scoring

Your League Health Score (0-100) depends on your detected path:

| Path | Scoring Focus |
|------|--------------|
| Win-Now | High spending in Years 1-3, taper in Years 4-5 |
| Rebuild | Low spending in Years 1-3, ramp up in Years 4-5 |
| Hybrid | Steady 70-80% spending throughout |

### Claim Codes

| Tier | Score | XP |
|------|-------|----|
| Gold | 85+ | 250 XP |
| Silver | 70-84 | 175 XP |
| Bronze | 55-69 | 125 XP |

Each tier has 3 path-specific codes (9 total unique codes).

---

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no frameworks)
- Chart.js for payroll curve visualization
- Fully client-side (no backend required)
- Responsive design for mobile and desktop

---

## Project Structure

```
301-M1-L2/
  index.html              # Single-page app with 4 game screens
  css/styles.css           # All styling including strategy tags and visualization
  js/
    data-loader.js         # Loads team data with embedded fallback
    game-engine.js         # Core game logic, scoring, and DecisionEngine class
    ui-controller.js       # UI rendering, chart management, and feedback system
  data/
    teams.json             # 6 teams, 60 decisions across 3 decision-mode teams
```

---

## Running Locally

Open `index.html` in any modern browser. No build step or server required.
