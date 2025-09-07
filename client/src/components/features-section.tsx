import { Wallet, Vote, Coins, TrendingUp, Smartphone, Lock } from "lucide-react";
import { Link } from "wouter";
import FeatureCard from "./feature-card";

const features = [
  {
    icon: Wallet,
    title: "Smart Contracts",
    description: "Automated, trustless funding with programmable conditions and milestone-based releases.",
    bgColor: "bg-primary",
    textColor: "text-primary-foreground"
  },
  {
    icon: Vote,
    title: "DAO Governance",
    description: "Community-driven decision making through decentralized autonomous organization voting.",
    bgColor: "bg-accent",
    textColor: "text-accent-foreground"
  },
  {
    icon: Coins,
    title: "Token Rewards",
    description: "Earn platform tokens for backing projects and participating in the ecosystem.",
    bgColor: "bg-secondary",
    textColor: "text-secondary-foreground"
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Comprehensive dashboard with real-time project metrics and funding analytics.",
    bgColor: "bg-primary",
    textColor: "text-primary-foreground"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Native mobile app with seamless web3 integration for funding on the go.",
    bgColor: "bg-accent",
    textColor: "text-accent-foreground"
  },
  {
    icon: Lock,
    title: "Multi-sig Security",
    description: "Enhanced security through multi-signature wallets and advanced cryptographic protection.",
    bgColor: "bg-secondary",
    textColor: "text-secondary-foreground"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Platform <span className="gradient-text" data-testid="text-features-title">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="text-features-description">
            Discover the powerful features that make CrowdChain the future of decentralized crowdfunding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              bgColor={feature.bgColor}
              textColor={feature.textColor}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onLearnMore={() => {
                // Handle learn more action
                console.log(`Learn more about ${feature.title}`);
              }}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-slide-up">
          <div className="brutalist-card bg-gradient-to-br from-primary to-accent p-12 rounded-2xl text-white transform rotate-1" data-testid="card-cta">
            <h3 className="text-3xl md:text-4xl font-black mb-4" data-testid="text-cta-title">
              Ready to Launch Your Project?
            </h3>
            <p className="text-xl mb-8 opacity-90" data-testid="text-cta-description">
              Join thousands of creators who have successfully funded their dreams on CrowdChain.
            </p>
            <Link href="/signup">
              <button className="brutalist-button bg-background text-foreground px-8 py-4 rounded-xl text-lg" data-testid="button-start-campaign">
                🚀 Start Your Campaign
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
