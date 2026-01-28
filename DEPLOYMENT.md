# Deployment Guide - The Curve Room 2.0

**Quick Start**: Enable GitHub Pages and go live in 5 minutes!

---

## 📋 Pre-Deployment Checklist

- [x] All files committed and pushed to `claude/continue-plan-iu565`
- [x] Code validated (JavaScript syntax check passed)
- [x] Team data verified (6 teams with real 2025-26 salaries)
- [x] Verification report created
- [ ] Merge to main branch
- [ ] Enable GitHub Pages
- [ ] Test deployed site
- [ ] Share URL with students

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

#### Step 1: Merge to Main
```bash
# Create pull request (or merge directly if you have permissions)
git checkout main
git pull origin main
git merge claude/continue-plan-iu565
git push origin main
```

#### Step 2: Enable GitHub Pages
1. Go to: https://github.com/braydenokley13-ux/301-M1-L2/settings/pages
2. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Click "Save"
4. Wait 2-3 minutes for deployment

#### Step 3: Verify Deployment
- URL: `https://braydenokley13-ux.github.io/301-M1-L2/`
- Status: Check the Pages section for deployment status
- Test: Open URL and try all 6 teams

#### Step 4: Share with Students
```
🎮 The Curve Room 2.0
Learn salary cap management with real NYC teams!

https://braydenokley13-ux.github.io/301-M1-L2/

Teams available:
- 🏀 New York Knicks & Brooklyn Nets
- ⚾ New York Yankees & New York Mets
- 🏈 New York Jets & New York Giants

Complete the simulation to earn XP claim codes!
```

---

### Option 2: Local Testing (Development)

#### Start Local Server
```bash
# Python 3
cd /path/to/301-M1-L2
python3 -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000

# OR Node.js
npx http-server -p 8000
```

#### Access Application
- URL: `http://localhost:8000`
- Test all 6 teams
- Verify claim codes generate correctly

---

## 🧪 Post-Deployment Testing

Once deployed, verify these items work:

### Critical Tests
- [ ] **Landing page loads** with all 6 team cards visible
- [ ] **Team selection** opens briefing page with correct data
- [ ] **Game starts** and displays Year 1 interface
- [ ] **Payroll slider** updates chart in real-time
- [ ] **Year navigation** (Next/Previous buttons work)
- [ ] **Health meter** updates as payroll changes
- [ ] **Finish simulation** shows results page
- [ ] **Claim code displays** for all tiers (test multiple runs)
- [ ] **Copy code button** works

### Team-Specific Tests

| Team | Test | Expected Behavior |
|------|------|-------------------|
| Knicks | High payroll | Over cap, negative space, $192M |
| Nets | Rebuild | Under cap, positive space, $124M |
| Yankees | Luxury tax | Over $305M, key stars visible |
| Mets | Emerging | $245M, young pitching narrative |
| Jets | QB window | $215M, rookie QB strategy |
| Giants | Reset | $198M, post-Saquon rebuild |

### Score Tiers Test

| Curve Pattern | Expected Score | Expected Tier |
|---------------|----------------|---------------|
| Match ideal exactly | 90-100 | 🥇 GOLD |
| Close to ideal | 70-84 | 🥈 SILVER |
| Decent attempt | 55-69 | 🥉 BRONZE |
| Flat (all 75%) | <55 | ❌ No code |

### Mobile Testing
- [ ] Test on phone (iOS/Android)
- [ ] Test on tablet
- [ ] Verify touch interactions work
- [ ] Check chart rendering on small screens
- [ ] Ensure buttons are tappable

---

## 🔧 Troubleshooting

### Issue: Page shows 404
**Cause**: GitHub Pages not enabled or still deploying
**Solution**:
1. Check Settings → Pages is configured correctly
2. Wait 5 minutes for initial deployment
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Teams don't load
**Cause**: JSON fetch failed
**Solution**:
1. Check browser console for errors (F12)
2. Verify `data/teams.json` exists in repo
3. Confirm file is valid JSON (no syntax errors)
4. Fallback data in `data-loader.js` should activate

### Issue: Chart doesn't display
**Cause**: Chart.js CDN not loading
**Solution**:
1. Check internet connection
2. Verify CDN URL in `index.html` line 8
3. Try alternative CDN: https://cdn.jsdelivr.net/npm/chart.js

### Issue: Claim code won't copy
**Cause**: Clipboard API requires HTTPS
**Solution**:
1. GitHub Pages uses HTTPS automatically ✓
2. For local testing, use localhost (secure context)
3. Fallback: Alert box shows code if copy fails

### Issue: Mobile layout broken
**Cause**: CSS not loading properly
**Solution**:
1. Check `css/styles.css` file path
2. Verify viewport meta tag in HTML
3. Clear browser cache
4. Test in incognito/private mode

---

## 📊 Monitoring & Analytics

### Track Student Engagement

#### Via XP System
Monitor claim code submissions:
- `CURVE-301-GOLD` (250 XP) - Advanced students
- `CURVE-301-SILVER` (175 XP) - On-track students
- `CURVE-301-BRONZE` (125 XP) - Developing students

#### Expected Distribution
Based on learning objectives:
- 20-30% Gold (mastery)
- 40-50% Silver (proficiency)
- 20-30% Bronze (developing)
- 5-10% No code (needs support/retry)

#### Key Metrics to Track
1. **Completion rate**: % students who finish simulation
2. **Tier distribution**: Are students succeeding?
3. **Team popularity**: Which teams are most selected?
4. **Retry behavior**: Are students learning and improving?

### Browser Console Logs
Enable for debugging (F12 → Console):
- "Curve Room 2.0 initialized" - App loaded
- Team selection events
- Score calculations
- Error messages

---

## 🔄 Updates & Maintenance

### Yearly Roster Updates
Update `data/teams.json` with new season data:
1. Get latest salaries from Spotrac/official sources
2. Update `currentPayroll`, `capSpace` fields
3. Update `keyContracts` with new players/salaries
4. Test all 6 teams still work
5. Commit and redeploy

### Content Updates
To modify educational messaging:
- **Hints**: Edit `phaseHints` in `teams.json`
- **Challenge text**: Edit `challenge` field per team
- **Phases**: Edit `PHASES` in `game-engine.js`
- **Results feedback**: Edit `feedback` in `finishGame()` function

### Feature Additions
For future enhancements (leaderboard, multiplayer, etc.):
1. Create feature branch
2. Implement and test locally
3. Merge to main
4. GitHub Pages auto-deploys

---

## 🎓 Student Instructions Template

Use this template when introducing the simulation:

```
📚 ASSIGNMENT: The Curve Room 2.0

Objective: Learn how professional sports teams manage their salary cap
through the Build → Peak → Reset cycle.

Instructions:
1. Go to: https://braydenokley13-ux.github.io/301-M1-L2/
2. Choose ONE of the 6 NYC teams (any league)
3. Read your team's situation and challenge
4. Make payroll decisions for Years 1-5
5. Try to match the ideal curve pattern
6. Earn a claim code (Bronze, Silver, or Gold)
7. Submit your code in the XP system

Tips:
- Don't spend the same amount every year (flatline penalty!)
- Build low, peak high, then reset for next cycle
- Read the hints for each year
- Watch your League Health Meter (aim for 55+)
- You can retry with different strategies

Target: Silver tier or higher (175+ XP)
Time: 10-15 minutes
```

---

## 📁 File Structure Reference

```
301-M1-L2/
├── index.html              # Main entry point
├── CURVE_ROOM_2.0_PLAN.md # Implementation plan
├── VERIFICATION_REPORT.md  # Testing and validation
├── DEPLOYMENT.md          # This file
├── curve_room_explainer.pdf # Original concept
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── game-engine.js     # Game logic
│   ├── ui-controller.js   # DOM updates
│   └── data-loader.js     # Data management
└── data/
    └── teams.json         # 6 teams data
```

**No build process required** - all files are production-ready

---

## 🔐 Security Considerations

### Public Data
- All files are public (GitHub Pages)
- Claim codes are intentionally public (not security-sensitive)
- No user data collected or stored
- No backend/database

### HTTPS
- GitHub Pages provides HTTPS automatically
- Clipboard API requires secure context (HTTPS or localhost)

### Content Security
- No external scripts except Chart.js CDN
- No inline JavaScript
- No user-generated content

---

## 🆘 Support

### Issues
Report bugs at: https://github.com/braydenokley13-ux/301-M1-L2/issues

### Common Student Questions

**Q: Can I play multiple times?**
A: Yes! Try different teams and strategies to improve your score.

**Q: Which team is easiest?**
A: Giants (Easy), Jets/Nets/Mets (Medium), Knicks/Yankees (Hard)

**Q: What if I get no code?**
A: Score was below 55. Try again! Avoid keeping payroll flat all 5 years.

**Q: How do I get Gold?**
A: Match the ideal curve closely. Score 85+. Watch the gray dotted line!

**Q: Can I see other students' codes?**
A: Everyone gets the same code for the same tier (by design).
   Your score determines which tier you reach.

---

## ✅ Launch Checklist

Final steps before going live:

- [ ] Pull request created/merged to main
- [ ] GitHub Pages enabled
- [ ] Deployed URL works: https://braydenokley13-ux.github.io/301-M1-L2/
- [ ] Tested all 6 teams
- [ ] Verified claim codes generate
- [ ] Mobile testing complete
- [ ] Student instructions prepared
- [ ] XP system ready to accept codes
- [ ] Announced to students

---

## 📈 Success Metrics

### Week 1 Goals
- [ ] 80%+ student completion rate
- [ ] Average score 65+ (Silver tier)
- [ ] Smooth operation (no critical bugs)
- [ ] Positive student feedback

### Long-term Goals
- Track improvement over multiple attempts
- Identify common student mistakes (flat curves, etc.)
- Gather data for Lesson 3 (Efficiency Frontier)
- Consider future enhancements based on usage

---

*Ready to deploy? Let's go! 🚀*

**Next Command:**
```bash
git add .
git commit -m "Add verification report and deployment guide"
git push -u origin claude/continue-plan-iu565
```

Then create a PR to merge into main and enable GitHub Pages!
