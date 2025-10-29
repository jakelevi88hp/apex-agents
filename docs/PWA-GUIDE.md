# Progressive Web App (PWA) Guide

Apex Agents is now a **Progressive Web App** that can be installed on any device!

## 🎯 What is a PWA?

A Progressive Web App allows users to install your web application on their device and use it like a native app, with:

- ✅ **Offline support** - Works without internet connection
- ✅ **Fast loading** - Cached resources load instantly
- ✅ **App-like experience** - Full-screen, no browser UI
- ✅ **Desktop/mobile icons** - Appears on home screen or Start menu
- ✅ **Push notifications** - (can be added in future)
- ✅ **Auto-updates** - Users always get the latest version

---

## 📱 How to Install

### **Desktop (Windows, Mac, Linux)**

#### Chrome/Edge:
1. Visit https://apex-agents.vercel.app
2. Look for the install icon (➕) in the address bar
3. Click "Install Apex Agents"
4. App will open in its own window

#### Firefox:
1. Visit https://apex-agents.vercel.app
2. Click menu (☰) → "Install Apex Agents"
3. Confirm installation

#### Safari (Mac):
1. Visit https://apex-agents.vercel.app
2. Click Share → "Add to Dock"

### **Mobile (iOS, Android)**

#### iOS (Safari):
1. Visit https://apex-agents.vercel.app
2. Tap the Share button (⬆️)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

#### Android (Chrome):
1. Visit https://apex-agents.vercel.app
2. Tap menu (⋮) → "Install app" or "Add to Home screen"
3. Tap "Install"
4. App icon appears on home screen

---

## ✨ Features

### **Automatic Install Prompt**
- After 30 seconds on the site, users see a friendly install prompt
- Can be dismissed (won't show again)
- Only appears if browser supports installation

### **Offline Support**
- Static assets (CSS, JS, images) are cached
- API responses are cached for 24 hours
- Falls back to cache if network is unavailable

### **App Shortcuts**
Right-click the installed app icon to see shortcuts:
- **Dashboard** - Go directly to main dashboard
- **AGI Chat** - Open AGI interface
- **AI Admin** - Access admin panel (if admin)

### **Optimized Performance**
- **Fonts** - Cached for 1 year
- **Images** - Cached for 24 hours
- **JavaScript/CSS** - Cached for 24 hours
- **API calls** - Network-first with cache fallback

---

## 🛠️ Technical Details

### **Manifest File**
Location: `/public/manifest.json`

Defines:
- App name and description
- Icons (multiple sizes)
- Theme colors
- Display mode (standalone)
- App shortcuts
- Categories

### **Service Worker**
Generated automatically by `next-pwa`

Handles:
- Asset caching
- Offline fallback
- Cache strategies:
  - **CacheFirst** - Fonts, audio, video
  - **StaleWhileRevalidate** - Images, CSS, JS
  - **NetworkFirst** - API calls, pages

### **Caching Strategies**

| Resource Type | Strategy | Cache Duration |
|---------------|----------|----------------|
| Fonts | CacheFirst | 1 year |
| Images | StaleWhileRevalidate | 24 hours |
| CSS/JS | StaleWhileRevalidate | 24 hours |
| API Calls | NetworkFirst | 24 hours |
| Pages | NetworkFirst | 24 hours |

### **Icons**
All icons are SVG format for:
- Smaller file size
- Perfect scaling
- Consistent appearance

Sizes: 72, 96, 128, 144, 152, 192, 384, 512px

---

## 🎨 Customization

### **Change App Name**
Edit `/public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### **Change Theme Color**
Edit `/public/manifest.json` and `/src/app/layout.tsx`:
```json
{
  "theme_color": "#8b5cf6"
}
```

### **Change App Icon**
Replace icon files in `/public/`:
- `icon-*.svg` - App icons
- `apple-touch-icon.svg` - iOS icon
- `favicon-*.svg` - Browser favicons

### **Add More Shortcuts**
Edit `/public/manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "New Feature",
      "url": "/new-feature",
      "icons": [{ "src": "/icon-96x96.svg", "sizes": "96x96" }]
    }
  ]
}
```

---

## 🧪 Testing

### **Test Installation**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Manifest" - check for errors
4. Click "Service Workers" - verify registration

### **Test Offline Mode**
1. Install the app
2. Open DevTools → Network tab
3. Select "Offline" from throttling dropdown
4. Reload app - should still work

### **Test Cache**
1. Open DevTools → Application → Cache Storage
2. Expand "workbox-*" caches
3. Verify resources are cached

---

## 📊 PWA Audit

Run Lighthouse audit to check PWA score:

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Analyze page load"
5. Aim for 100/100 score

---

## 🚀 Deployment

PWA features work automatically on Vercel:

1. Service worker is generated during build
2. Manifest is served from `/manifest.json`
3. Icons are served from `/public/`
4. HTTPS is required (Vercel provides this)

### **Required for PWA:**
- ✅ HTTPS (Vercel provides)
- ✅ Service worker (auto-generated)
- ✅ Manifest file (created)
- ✅ Icons (created)
- ✅ Responsive design (already implemented)

---

## 🐛 Troubleshooting

### **Install button doesn't appear**
- Check if already installed
- Clear browser cache
- Ensure HTTPS is enabled
- Check browser compatibility

### **Offline mode not working**
- Verify service worker is registered
- Check cache storage in DevTools
- Ensure service worker is not disabled

### **Icons not showing**
- Verify icon paths in manifest.json
- Check icon files exist in /public/
- Clear browser cache

### **App won't update**
- Service worker caches aggressively
- Force refresh (Ctrl+Shift+R)
- Uninstall and reinstall app
- Update service worker strategy

---

## 📈 Analytics

Track PWA installation:

```javascript
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  // Track with analytics
});
```

---

## 🔮 Future Enhancements

Potential PWA features to add:

- [ ] Push notifications
- [ ] Background sync
- [ ] Periodic background sync
- [ ] Share target API
- [ ] File handling API
- [ ] Badge API
- [ ] Web share API

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

## ✅ Checklist

- [x] Manifest file created
- [x] Service worker configured
- [x] App icons generated (all sizes)
- [x] Install prompt component added
- [x] Meta tags for mobile optimization
- [x] Offline support enabled
- [x] Caching strategies configured
- [x] App shortcuts defined
- [x] Theme colors set
- [x] Documentation written

**Status:** ✅ **PWA READY!**

Users can now install Apex Agents on any device and use it like a native app!

