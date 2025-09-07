import { Shield, Users, Globe } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-slide-left">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black">
                About <span className="gradient-text" data-testid="text-about-title">CrowdChain</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-about-description">
                CrowdChain revolutionizes crowdfunding by leveraging blockchain technology to create a transparent, 
                secure, and decentralized platform where creators and backers can connect without intermediaries.
              </p>
            </div>

            <div className="space-y-6">
              <div className="brutalist-card bg-primary/10 p-6 rounded-xl" data-testid="card-transparent-secure">
                <div className="flex items-start space-x-4">
                  <div className="brutalist-button bg-primary text-primary-foreground p-3 rounded-lg">
                    <Shield className="text-xl" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Transparent & Secure</h3>
                    <p className="text-muted-foreground">Every transaction is recorded on the blockchain, ensuring complete transparency and security for all participants.</p>
                  </div>
                </div>
              </div>

              <div className="brutalist-card bg-accent/10 p-6 rounded-xl" data-testid="card-community-governed">
                <div className="flex items-start space-x-4">
                  <div className="brutalist-button bg-accent text-accent-foreground p-3 rounded-lg">
                    <Users className="text-xl" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Community Governed</h3>
                    <p className="text-muted-foreground">Our platform is governed by the community through decentralized autonomous organization (DAO) principles.</p>
                  </div>
                </div>
              </div>

              <div className="brutalist-card bg-secondary/10 p-6 rounded-xl" data-testid="card-global-access">
                <div className="flex items-start space-x-4">
                  <div className="brutalist-button bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <Globe className="text-xl" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Global Access</h3>
                    <p className="text-muted-foreground">Anyone, anywhere in the world can participate without traditional banking barriers or geographic restrictions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-right">
            {/* A modern blockchain network visualization with connected nodes and data flows */}
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Blockchain network visualization" 
              className="brutalist-card rounded-2xl w-full h-auto transform -rotate-1"
              data-testid="img-blockchain-visualization"
            />
            
            <div className="absolute -bottom-8 -left-8 brutalist-card bg-card p-6 rounded-xl" data-testid="card-blockchain-powered">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">⛓️</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Blockchain Powered</div>
                  <div className="text-lg font-black">100% Decentralized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
