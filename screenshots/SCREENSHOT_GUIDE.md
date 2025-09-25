# 📸 Screenshot Guide for ConfidenceLab

This guide provides detailed instructions for taking the perfect screenshots for the ConfidenceLab README.

## 📋 Screenshot Checklist

### 🏠 **Authentication & Dashboard Screenshots**

#### 1. Login Page (`01-login-page.png`)
**What to capture:**
- Full login form with ConfidenceLab logo
- Blue-emerald gradient background
- Email and password fields
- "Sign in" button
- "Don't have an account? Sign up" link
- Animated background elements

**Steps:**
1. Navigate to http://localhost:5173
2. Ensure you're on the login page
3. Take full-page screenshot
4. Save as `01-login-page.png`

#### 2. Signup Page (`02-signup-page.png`)
**What to capture:**
- Registration form with logo
- Name, email, password fields
- Password confirmation field
- "Create Account" button
- "Already have an account? Sign in" link
- Consistent branding and colors

**Steps:**
1. Click "Sign up" from login page
2. Take full-page screenshot
3. Save as `02-signup-page.png`

#### 3. Main Dashboard (`03-main-dashboard.png`)
**What to capture:**
- Welcome message with user name
- Statistics cards (Total Sessions, Average Confidence, Highest Score)
- Three interview type cards (HR, Technical, Behavioral)
- "View Sessions" button
- User avatar with sparkle animation
- Logout button

**Steps:**
1. Login with test account
2. Take full-page screenshot of dashboard
3. Save as `03-main-dashboard.png`

### 🎥 **Interview Interface Screenshots**

#### 4. HR Interview - Camera Ready (`04-hr-interview-ready.png`)
**What to capture:**
- Three-column layout (LeetCode style)
- Left sidebar: Question text and tips
- Center: Video area with "Camera Ready" overlay
- Right sidebar: Analysis area (empty)
- Question selection dropdown
- "Start Recording" button
- Camera icon and "Camera Ready" text

**Steps:**
1. Click on "HR Interview" from dashboard
2. Ensure no recording is active
3. Take full-page screenshot
4. Save as `04-hr-interview-ready.png`

#### 5. Technical Interview - Recording (`05-technical-interview-recording.png`)
**What to capture:**
- Live video feed in center
- Red recording indicator with timer
- Camera label in bottom-left
- Timer in top-right corner
- Question displayed in left sidebar
- "Stop Recording" button
- Recording status overlay

**Steps:**
1. Click on "Technical Interview"
2. Start recording (click record button)
3. Wait for video to start
4. Take screenshot while recording
5. Save as `05-technical-interview-recording.png`

#### 6. Behavioral Interview - Analysis Results (`06-behavioral-interview-results.png`)
**What to capture:**
- Recorded video in center
- Confidence score display (e.g., "85%")
- "Interview Score" card with gradient background
- "View Detailed Analysis" button
- Download video link
- Reset session button
- Question and tips in left sidebar

**Steps:**
1. Complete a recording in Behavioral Interview
2. Click "Analyze Video" and wait for results
3. Take screenshot showing the score
4. Save as `06-behavioral-interview-results.png`

### 📊 **Analysis & Results Screenshots**

#### 7. Detailed Analysis View (`07-detailed-analysis.png`)
**What to capture:**
- Expanded detailed analysis section
- Three confidence cards:
  - Facial Confidence (blue)
  - Speech Confidence (blue)
  - Body Confidence (green)
- Individual metrics and descriptions
- "Hide Detailed Analysis" button
- All metrics visible

**Steps:**
1. From previous screenshot, click "View Detailed Analysis"
2. Take screenshot of expanded analysis
3. Save as `07-detailed-analysis.png`

#### 8. Session History (`08-session-history.png`)
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
4. Save as `08-session-history.png`

#### 9. Session Details (`09-session-details.png`)
**What to capture:**
- Detailed view of a specific session
- Session information:
  - Session ID
  - Topic (e.g., "HR Interview")
  - Score percentage
  - Duration
  - Timestamp
  - Question asked
- Confidence breakdown
- "Back to Sessions" button

**Steps:**
1. From session history, click on a session
2. Take screenshot of detailed view
3. Save as `09-session-details.png`

### 🎯 **Question Management Screenshots**

#### 10. Question Selection (`10-question-selection.png`)
**What to capture:**
- Question selection dropdown open
- List of available questions
- Current question highlighted
- Dropdown arrow
- Question categories visible

**Steps:**
1. Go to any interview page
2. Click on question selection dropdown
3. Take screenshot with dropdown open
4. Save as `10-question-selection.png`

#### 11. Tips Display (`11-tips-display.png`)
**What to capture:**
- Tips section expanded
- "Hide Tips" button
- List of tips with bullet points
- General tips section at bottom
- Tips related to current question

**Steps:**
1. Click "Show Tips" button
2. Take screenshot of expanded tips
3. Save as `11-tips-display.png`

## 🎨 **Screenshot Requirements**

### 📐 **Technical Specifications**
- **Resolution**: 1920x1080 or higher
- **Format**: PNG (for transparency support)
- **Quality**: High resolution, crisp text
- **Browser**: Chrome or Firefox (latest version)

### 🎯 **Content Guidelines**
- **Clean Interface**: No browser bookmarks, extensions, or clutter
- **Consistent Data**: Use realistic but consistent test data
- **Professional Look**: Ensure UI looks polished and professional
- **Complete Views**: Capture full sections, not partial views

### 🖼️ **Visual Guidelines**
- **Lighting**: Good contrast, no dark areas
- **Colors**: Accurate color representation
- **Text**: All text should be readable
- **Layout**: Show complete UI components

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
- `02-signup-page.png`
- `03-main-dashboard.png`
- `04-hr-interview-ready.png`
- `05-technical-interview-recording.png`
- `06-behavioral-interview-results.png`
- `07-detailed-analysis.png`
- `08-session-history.png`
- `09-session-details.png`
- `10-question-selection.png`
- `11-tips-display.png`

## ✅ **Final Checklist**

Before submitting screenshots, ensure:
- [ ] All 11 screenshots are captured
- [ ] Images are high quality and clear
- [ ] File names match exactly
- [ ] Images show realistic, professional content
- [ ] All UI elements are visible and readable
- [ ] Consistent branding and colors throughout
- [ ] No personal information or sensitive data visible

## 🎯 **Pro Tips**

1. **Use Test Data**: Create consistent test data for all screenshots
2. **Multiple Attempts**: Take several screenshots and choose the best
3. **Consistent Browser**: Use the same browser for all screenshots
4. **Clean Environment**: Close unnecessary tabs and applications
5. **Good Timing**: Take screenshots when the UI is fully loaded
6. **Professional Look**: Ensure the application looks polished and ready for production

---

**Happy Screenshotting! 📸✨**
