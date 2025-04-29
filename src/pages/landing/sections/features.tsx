import { FeatureCard } from "@/components/common/feature-card";
import { Check, Coffee, Globe, Shield, TrendingUp } from "lucide-react";
 
export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AfroValley</h2>
            <p className="text-gray-600 text-lg">
              Our platform offers unique advantages through blockchain technology, ensuring transparency, fair trade, and EUDR compliance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-emerald-600" />}
              title="EUDR Compliance"
              description="Automatically ensure all transactions meet European Union Deforestation Regulation standards."
            />
          </div>
          
          <div>
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
              title="Fair Pricing"
              description="Transparent blockchain verification ensures farmers receive fair compensation for their high-quality coffee."
            />
          </div>
          
          <div>
            <FeatureCard
              icon={<Coffee className="h-6 w-6 text-amber-700" />}
              title="Quality Assurance"
              description="Verified production standards and complete traceability from farm to cup."
            />
          </div>
          
          <div>
            <FeatureCard
              icon={<Check className="h-6 w-6 text-green-600" />}
              title="Sustainability"
              description="Support environmentally responsible farming practices that protect our planet's forests."
            />
          </div>
          
          <div>
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-blue-600" />}
              title="Global Access"
              description="Connect farmers directly with international markets, eliminating unnecessary intermediaries."
            />
          </div>
          
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-6">
              <div className="text-amber-700/30 text-xl font-bold">Features Image Placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}