# Apex Agents Platform - Complete Fix TODO

## CRITICAL: Remaining Text Contrast Issues
- [x] Fix agents page: line 121 - text-gray-500
- [x] Fix workflows page: line 111, 238 - text-gray-500
- [x] Fix knowledge page: line 244 - text-gray-500
- [x] Fix analytics page: lines 11, 16, 21, 26, 28, 43, 63, 102 - text-gray-500
- [x] Fix settings page: lines 112, 116, 123, 127, 211, 233 - text-gray-500

## CRITICAL: Non-Functional Buttons/Features
- [x] Settings page - Save Changes button (line 95-97) - no onClick
- [x] Settings page - Revoke buttons (lines 114, 125) - no onClick
- [x] Settings page - Create New Key button (line 131-133) - no onClick
- [x] Settings page - Manage Subscription button (line 176-178) - no onClick
- [x] Settings page - Update payment button (line 214) - no onClick
- [x] Settings page - Invite Member button (line 249-251) - no onClick
- [x] Settings page - Remove buttons (line 242) - no onClick
- [x] Analytics page - all static, no interactivity (informational only)
- [x] Check all other pages for missing onClick handlers

## Testing Required
- [x] Test every single button on every page
- [x] Verify all text is readable (gray-700 minimum)
- [x] Check all modals open and close
- [x] Verify all forms submit correctly
- [x] Test navigation between all pages



## Dark Theme Implementation
- [x] Update global styles to dark theme
- [x] Update layout component with dark background
- [x] Update dashboard page to dark theme
- [x] Update agents page to dark theme
- [x] Update workflows page to dark theme
- [x] Update knowledge page to dark theme
- [x] Update analytics page to dark theme
- [x] Update settings page to dark theme
- [x] Update login/signup pages to dark theme (already dark)
- [x] Test dark theme across all pages



## Knowledge Base Functionality Fixes
- [x] Replace Manage button alerts with proper in-app modals
- [x] Replace View document alerts with proper in-app document viewer
- [x] Add data source configuration modal
- [x] Add document preview/viewer modal
- [x] Test all knowledge base interactions



## Phase 1: Graphics Enhancements (Quick Wins)
- [x] Install and configure Lucide Icons library
- [x] Replace all emoji with proper Lucide icons (Dashboard, Agents)
- [x] Add hover effects to all cards (lift, shadow, glow)
- [x] Add hover effects to all buttons (scale, glow)
- [x] Implement gradient backgrounds for hero sections
- [x] Add gradient borders to agent cards
- [ ] Add gradient borders to workflow cards
- [ ] Create animated status indicators (pulsing dots)
- [ ] Add sparkline charts to dashboard metrics
- [ ] Create empty state illustrations for all pages
- [ ] Test all animations and effects
- [ ] Deploy Phase 1 enhancements



## Phase 2: Animated Metric Cards
- [x] Install recharts library for sparkline charts
- [x] Add sparkline charts to dashboard metric cards
- [x] Implement animated number counters
- [x] Add progress bars with animations
- [x] Create gradient progress indicators
- [x] Add micro-animations on card hover
- [ ] Test all metric card animations
- [ ] Deploy Phase 2 enhancements

