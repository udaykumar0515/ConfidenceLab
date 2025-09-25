# 📸 Screenshot Guide for ConfidenceLab

This guide provides instructions for taking the essential screenshots for the ConfidenceLab README.

## 📋 Essential Screenshots (5 Total)

### 🏠 **Main Interface Screenshots**

#### 1. Login Page (`01-login-page.png`)
**What to capture:**
- Full login form with ConfidenceLab logo
- Blue-emerald gradient background
- Email and password fields
- "Sign in" button
- "Don't have an account? Sign up" link

**Steps:**
1. Navigate to http://localhost:5173
2. Take full-page screenshot
3. Save as `01-login-page.png`

#### 2. Main Dashboard (`02-main-dashboard.png`)
**What to capture:**
- Welcome message with user name
- Statistics cards (Total Sessions, Average Confidence, Highest Score)
- Three interview type cards (HR, Technical, Behavioral)
- "View Sessions" button
- User avatar with sparkle animation

**Steps:**
1. Login with test account
2. Take full-page screenshot of dashboard
3. Save as `02-main-dashboard.png`

### 🎥 **Interview Practice Screenshots**

#### 3. Interview Ready (`03-interview-ready.png`)
**What to capture:**
- Three-column layout (LeetCode style)
- Left sidebar: Question text and tips
- Center: Video area with "Camera Ready" overlay
- Right sidebar: Analysis area (empty)
- Question selection dropdown
- "Start Recording" button

**Steps:**
1. Click on any interview type from dashboard
2. Ensure no recording is active
3. Take full-page screenshot
4. Save as `03-interview-ready.png`

#### 4. Analysis Results (`04-analysis-results.png`)
**What to capture:**
- Recorded video in center
- Confidence score display (e.g., "85%")
- "Interview Score" card with gradient background
- "View Detailed Analysis" button
- Download video link
- Detailed analysis breakdown visible

**Steps:**
1. Complete a recording and analysis
2. Click "View Detailed Analysis" to expand
3. Take screenshot showing the results
4. Save as `04-analysis-results.png`

### 📊 **Session Management Screenshots**

#### 5. Session History (`05-session-history.png`)
**What to capture:**
- List of past interview sessions
- Session cards showing:
  - Interview type
  - Date and time
  - Confidence score
  - Duration
- "Back to Dashboard" button
- Multiple sessions visible

**Steps:**
1. From dashboard, click "View Sessions"
2. Ensure multiple sessions are visible
3. Take full-page screenshot
4. Save as `05-session-history.png`

## 🎨 **Screenshot Requirements**

### 📐 **Technical Specifications**
- **Resolution**: 1920x1080 or higher
- **Format**: PNG
- **Quality**: High resolution, crisp text
- **Browser**: Chrome or Firefox (latest version)

### 🎯 **Content Guidelines**
- **Clean Interface**: No browser bookmarks, extensions, or clutter
- **Consistent Data**: Use realistic but consistent test data
- **Professional Look**: Ensure UI looks polished and professional
- **Complete Views**: Capture full sections, not partial views

## 🚀 **Quick Setup for Screenshots**

### 1. **Prepare Test Data**
```bash
# Start the application
npm run dev
# In another terminal
cd backend && uvicorn main:app --reload
```

### 2. **Create Test Account**
- Sign up with: `test@confidencelab.com`
- Password: `TestPassword123`
- Name: `Test User`

### 3. **Generate Test Sessions**
- Complete 3-4 interviews of different types
- Ensure good lighting and clear audio
- Record for 30-60 seconds each

### 4. **Browser Setup**
- Use incognito/private mode
- Set browser zoom to 100%
- Hide bookmarks bar
- Use full-screen mode

## 📝 **Screenshot Naming Convention**

All screenshots should follow this naming pattern:
- `01-login-page.png`
- `02-main-dashboard.png`
- `03-interview-ready.png`
- `04-analysis-results.png`
- `05-session-history.png`

## ✅ **Final Checklist**

Before submitting screenshots, ensure:
- [ ] All 5 screenshots are captured
- [ ] Images are high quality and clear
- [ ] File names match exactly
- [ ] Images show realistic, professional content
- [ ] All UI elements are visible and readable
- [ ] Consistent branding and colors throughout
- [ ] No personal information or sensitive data visible

---

**Happy Screenshotting! 📸✨**