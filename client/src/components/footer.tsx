import { Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 px-4 border-t-3 border-black">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-black gradient-text" data-testid="text-footer-logo">CrowdChain</h3>
            <p className="text-background/80" data-testid="text-footer-description">
              Revolutionizing crowdfunding through blockchain technology and community governance.
            </p>
            <div className="flex space-x-4">
              <button className="brutalist-button bg-primary text-primary-foreground p-3 rounded-lg" data-testid="button-social-twitter">
                <Twitter size={20} />
              </button>
              <button className="brutalist-button bg-accent text-accent-foreground p-3 rounded-lg" data-testid="button-social-discord">
                <span className="text-xl">💬</span>
              </button>
              <button className="brutalist-button bg-secondary text-secondary-foreground p-3 rounded-lg" data-testid="button-social-github">
                <Github size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold" data-testid="text-footer-platform-title">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-browse-projects">Browse Projects</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-start-campaign">Start Campaign</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-how-it-works">How It Works</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-success-stories">Success Stories</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold" data-testid="text-footer-resources-title">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-documentation">Documentation</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-api-reference">API Reference</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-smart-contracts">Smart Contracts</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-whitepaper">Whitepaper</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold" data-testid="text-footer-community-title">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-help-center">Help Center</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-blog">Blog</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-terms">Terms of Service</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center">
          <p className="text-background/80" data-testid="text-footer-copyright">
            &copy; 2024 CrowdChain. All rights reserved. Built with ❤️ for the decentralized future.
          </p>
        </div>
      </div>
    </footer>
  );
}
