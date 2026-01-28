# Plan: Add Strategic Decisions to The Curve Room 2.0

## User Request
Transform the game from "adjust a payroll slider" into a game with **actual meaningful decisions**:
1. **Multiple decision types** beyond payroll (trades, free agents, extensions, draft strategy)
2. **Branching consequences** where early decisions limit/enable future options
3. **Strategic dilemmas** with real trade-offs (no "right" answer)
4. **Multiple viable paths** to winning (win-now vs. patient rebuild, both valid)

---

## Current State Analysis

### Game Structure
- 5-year payroll curve gameplay
- Simple slider interface (0-100% payroll per year)
- Team-specific ideal curves and phase hints
- Health score based on curve closeness to ideal
- Claim code rewards (Gold/Silver/Bronze)
- 6 teams with real 2025-2026 salary cap data

### Critical Files
- `js/game-engine.js` (308 lines) - Core state & scoring
- `data/teams.json` (176 lines) - Team data with ideal curves
- `js/ui-controller.js` (527 lines) - UI & interactions
- `index.html` (244 lines) - 4-page game flow
- `css/styles.css` (15043 lines) - Styling

---

## Implementation Plan

### Phase 1: Define Core Decision Pool
**File: `data/teams.json`**

Create a shared decision pool (not team-specific) with 3-4 decisions per year. Each decision has:
- Consequence flags that enable/disable future decisions
- Payroll impact that sets year spending
- Path scoring weights (win-now vs. rebuild vs. hybrid)

```json
{
  "decisions": {
    "1": [
      {
        "id": "sign_star_fa",
        "title": "Sign Star Free Agent",
        "description": "Spend big on a $15M/year impact player now",
        "payrollPercentage": 90,
        "flags": {
          "unlock": ["extend_star_y2"],
          "lock": ["draft_heavy", "rebuild_mode"]
        },
        "pathWeights": {
          "winNow": 25,
          "rebuild": -15,
          "hybrid": 5
        }
      },
      {
        "id": "draft_and_develop",
        "title": "Focus on Draft & Youth",
        "description": "Skip expensive FA, develop young core",
        "payrollPercentage": 50,
        "flags": {
          "unlock": ["young_core_locked", "cap_flexibility"],
          "lock": ["sign_star_fa"]
        },
        "pathWeights": {
          "winNow": -10,
          "rebuild": 25,
          "hybrid": 8
        }
      },
      {
        "id": "trade_for_assets",
        "title": "Trade for Assets",
        "description": "Move aging player for draft picks/young talent",
        "payrollPercentage": 65,
        "flags": {
          "unlock": ["rebuild_advantage", "draft_capital"],
          "lock": ["win_now_contention"]
        },
        "pathWeights": {
          "winNow": -5,
          "rebuild": 20,
          "hybrid": 10
        }
      },
      {
        "id": "balanced_approach",
        "title": "Balanced Spending",
        "description": "Compete now while maintaining some flexibility",
        "payrollPercentage": 75,
        "flags": {
          "unlock": ["flexible_year2"],
          "lock": []
        },
        "pathWeights": {
          "winNow": 10,
          "rebuild": 10,
          "hybrid": 20
        }
      }
    ],
    "2": [ /* year 2 decisions, affected by year 1 choices */ ],
    // ... years 3-5
  }
}
```

**What to add:**
- 3-4 decisions per year (same pool for all teams)
- Each decision sets explicit payroll %
- Decisions unlock/lock future options via flags
- Path weights guide scoring without hard constraints
- All decisions equally viable at score level

---

### Phase 2: Create Decision Engine
**Modify: `js/game-engine.js`** (add new DecisionEngine class)

Replace payroll slider state with decision tracking:
```javascript
class DecisionEngine {
  constructor(team) {
    this.team = team;
    this.decisions = [null, null, null, null, null]; // Decision per year
    this.activeFlags = new Set();  // Unlocked flags
    this.pathScores = { winNow: 0, rebuild: 0, hybrid: 0 };
  }

  getAvailableDecisions(year) {
    // Filter decisions by:
    // 1. Not locked by activeFlags
    // 2. All returned decisions are equally viable
    const allDecisions = this.team.decisions[year];
    return allDecisions.filter(d => !d.flags.lock.some(f => this.activeFlags.has(f)));
  }

  applyDecision(year, decisionId) {
    const decision = this.findDecision(decisionId);
    this.decisions[year] = decisionId;

    // Update active flags
    decision.flags.lock.forEach(f => this.activeFlags.add(f));
    decision.flags.unlock.forEach(f => this.activeFlags.add(f));

    // Track path preference
    Object.keys(decision.pathWeights).forEach(path => {
      this.pathScores[path] += decision.pathWeights[path];
    });

    return { payroll: decision.payrollPercentage };
  }

  getPayrollCurve() {
    // Generate payroll from decisions
    return this.decisions.map((d, year) => {
      const decision = this.findDecision(d);
      return decision.payrollPercentage;
    });
  }

  determinePath() {
    // Classify based on path scores
    if (this.pathScores.hybrid > this.pathScores.winNow && this.pathScores.hybrid > this.pathScores.rebuild) {
      return "hybrid";
    }
    return this.pathScores.winNow > this.pathScores.rebuild ? "winNow" : "rebuild";
  }
}
```

---

### Phase 3: Implement Path-Based Scoring
**Modify: `js/game-engine.js`** (replace old scoring logic)

```javascript
calculateScore(decisionEngine) {
  const path = decisionEngine.determinePath();
  const decisions = decisionEngine.decisions;

  let score = 0;

  if (path === "winNow") {
    // Reward: High early spending, decline later
    score += this.scoreWinNow(decisions);
  } else if (path === "rebuild") {
    // Reward: Low early spending, flexibility maintained
    score += this.scoreRebuild(decisions);
  } else {
    // Reward: Balanced approach throughout
    score += this.scoreHybrid(decisions);
  }

  // Diversity bonus: Different decisions each year?
  if (new Set(decisions).size === 5) score += 10;

  return Math.min(100, Math.max(0, score));
}

scoreWinNow(decisions) {
  // Win-Now: Spend 85%+ in years 1-3, taper in 4-5
  const early = decisions.slice(0, 3).map(d => this.team.decisions[d].payrollPercentage);
  const late = decisions.slice(3, 5).map(d => this.team.decisions[d].payrollPercentage);

  let score = 0;
  early.forEach(p => { if (p >= 85) score += 15; });
  late.forEach(p => { if (p <= 70) score += 10; });
  return score;
}

scoreRebuild(decisions) {
  // Rebuild: Spend <65% in years 1-3, build in years 4-5
  const early = decisions.slice(0, 3).map(d => this.team.decisions[d].payrollPercentage);
  const late = decisions.slice(3, 5).map(d => this.team.decisions[d].payrollPercentage);

  let score = 0;
  early.forEach(p => { if (p <= 65) score += 15; });
  late.forEach(p => { if (p >= 80) score += 10; });
  return score;
}

scoreHybrid(decisions) {
  // Hybrid: Steady 70-80% throughout, never extreme
  let score = 0;
  decisions.forEach(d => {
    const p = this.team.decisions[d].payrollPercentage;
    if (p >= 70 && p <= 80) score += 15;
  });
  return score;
}
```

---

### Phase 4: Update UI for Decision Selection
**Modify: `index.html` & `js/ui-controller.js`**

Replace payroll slider with decision card interface:
- Remove `<input type="range">` for payroll
- Add decision card buttons for each year
- Show branching tree visualization (year 1 decision → year 2 available options)
- Highlight locked decisions and the decision that locked them
- Display payroll % implicitly in decision card

Example structure:
```html
<div class="year-decisions">
  <h3>Year 1: Build Phase</h3>
  <div class="decision-cards">
    <button class="decision-card" data-decision="sign_star_fa">
      <h4>Sign Star Free Agent</h4>
      <p>Spend big on impact ($90% cap)</p>
      <p class="path-hint">← Win-Now Strategy</p>
    </button>
    <button class="decision-card" data-decision="draft_and_develop">
      <h4>Focus on Draft & Youth</h4>
      <p>Develop young core ($50% cap)</p>
      <p class="path-hint">← Rebuild Strategy</p>
    </button>
    <!-- More cards -->
  </div>

  <!-- Show branching on year 2 -->
  <p class="branching-note">
    Your Year 1 choice enables X options and locks Y options for Year 2
  </p>
</div>
```

---

### Phase 5: Create Multiple Viable Endings
**Modify: `js/game-engine.js`** (claim codes based on path + score)

```javascript
generateClaimCode(path, score) {
  if (score >= 85) {
    const codes = {
      winNow: "CURVE-301-CHAMPION",
      rebuild: "CURVE-301-ARCHITECT",
      hybrid: "CURVE-301-STRATEGIST"
    };
    return { code: codes[path], tier: "Gold", xp: 250 };
  }

  if (score >= 70) {
    const codes = {
      winNow: "CURVE-301-CONTENDER",
      rebuild: "CURVE-301-BUILDER",
      hybrid: "CURVE-301-NEGOTIATOR"
    };
    return { code: codes[path], tier: "Silver", xp: 175 };
  }

  // etc...
}
```

---

### Phase 6: Expand Decision Pool Across 5 Years
**File: `data/teams.json`**

Create decision trees for years 1-5. Each year has 3-4 decisions that:
- Build on previous year's flags
- Are equally viable for scoring
- Lead to genuinely different final curves

Example progression:
- Year 1: "Big Spend" vs. "Develop Youth" vs. "Trade Assets" vs. "Balanced"
- Year 2: Options change based on Year 1 (if "Big Spend" chosen, "Develop Youth" might lock, but "Extend Star" unlocks)
- Years 3-5: Continue branching until all paths reconverge for endgame

---

## Summary of Changes

| Component | Change | Impact |
|-----------|--------|--------|
| Data Model | Add full 5-year decision tree to teams.json (3 teams) | Enables branching |
| Game Engine | Replace payroll slider with DecisionEngine class | Tracks decisions & flags |
| Game Engine | Add path detection & path-specific scoring | Multiple viable endpoints |
| UI | Replace slider with decision card buttons | Clear visual choices |
| Results | Path-specific claim codes | Rewards all strategies equally |

---

## Scope: 3 Teams (1 per League)
- **New York Knicks** (NBA, Hard) - "Win-Now" path emphasis
- **New York Mets** (MLB, Medium) - "Hybrid" path emphasis
- **New York Jets** (NFL, Medium) - "Rebuild" path emphasis

Each team gets full 5-year decision tree (3-4 decisions per year = 15-20 decisions per team = ~50 total)

Other 3 teams: Keep payroll slider for now (backwards compatible)

---

## Implementation Order (Sequential)
1. **Expand teams.json** with full 5-year decision tree for 3 teams
2. **Create DecisionEngine class** in game-engine.js
3. **Add path-based scoring** (replace old slider scoring)
4. **Update index.html** with decision card UI (remove slider)
5. **Update ui-controller.js** to handle decision selection
6. **Add branching visualization** (show locked decisions + reason)
7. **Test all 3 teams** across 3 path types (verify all reach Gold tier)
8. **Ensure claim codes vary** based on path + score

---

## Example Gameplay: Knicks Year 1 → Year 2

### Year 1 Decisions
- Option A: "Sign Star Free Agent" (90% payroll) → Unlocks "Extend Star Y2", Locks "Rebuild Mode"
- Option B: "Focus on Draft & Youth" (50% payroll) → Unlocks "Young Core", Locks "Sign FA"
- Option C: "Trade for Assets" (65% payroll) → Unlocks "Draft Capital", Mixed locks
- Option D: "Balanced Spending" (75% payroll) → All Year 2 options available

### Year 2 Consequences (if chose A)
- Unlocked: "Extend Star Y2", "Go All-In", "Maintain Payroll"
- Locked: "Rebuild", "Tank for Picks"
- Available: Still have some flexibility, but locked into win-now trajectory

### Year 2 Consequences (if chose B)
- Unlocked: "Develop Young Core", "Add Draft Picks", "Strategic FA"
- Locked: "Sign Star FA", "Quick Spending Boost"
- Available: Multiple rebuild options, one medium hybrid choice

Result: Both paths feel different, both can reach Gold tier

---

## Verification Section

### Functional Tests
- [ ] Knicks: Win-Now path reaches Gold tier (85+ score)
- [ ] Mets: Hybrid path reaches Gold tier
- [ ] Jets: Rebuild path reaches Gold tier
- [ ] All other scorable paths reach at least Silver (70+)
- [ ] No decision appears "obviously best" across all paths
- [ ] Locked decisions show what decision locked them

### UX Tests
- [ ] Decision cards show payroll % clearly
- [ ] Branching visualization helps players understand consequences
- [ ] Can navigate back to previous years and change decisions
- [ ] Chart updates when decision changes
- [ ] Results page shows which path was taken + final score

### Data Tests
- [ ] All 5 years populated for 3 teams
- [ ] No impossible flag combinations
- [ ] Every decision unlocks at least one Year N+1 option
