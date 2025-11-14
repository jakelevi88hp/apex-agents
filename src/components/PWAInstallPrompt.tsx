'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    let frameId: number | undefined;

    const markInstalled = () => {
      frameId = window.requestAnimationFrame(() => setIsInstalled(true));
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      markInstalled();
      return () => {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const handleInstalled = () => {
      markInstalled();
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            <h3 className="font-bold">Install Apex Agents</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-white/90 mb-4">
          Install our app for quick access, offline support, and a better experience!
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-white/90 hover:text-white transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

