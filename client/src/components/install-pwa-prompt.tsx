import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for this session
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if user has dismissed it before or if app is already installed
  const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (!showPrompt || isDismissed || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="brutalist-card bg-primary text-primary-foreground border-3 border-black shadow-brutalist">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download size={20} />
              Install CrowdChain
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6 p-0"
            >
              <X size={16} />
            </Button>
          </div>
          <CardDescription className="text-primary-foreground/80">
            Install our app for a better experience with offline access and quick launch.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="brutalist-button bg-primary-foreground text-primary border-2 border-black hover:bg-primary-foreground/90 flex-1"
            >
              <Download size={16} className="mr-2" />
              Install
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="brutalist-button border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20"
            >
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}