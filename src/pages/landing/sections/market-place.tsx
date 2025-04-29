import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { MarketplaceCard } from "@/components/common/market-place-card";

export default function Marketplace() {
  return (
    <section id="marketplace" className="py-16 bg-gradient-to-b from-white to-amber-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Blockchain-Powered Ecosystem</h2>
            <p className="text-gray-600 text-lg">
              AfroValley connects every stakeholder in the coffee supply chain through secure, transparent blockchain technology.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div>
            <MarketplaceCard
              title="For Farmers"
              description="Get fair prices for your coffee with direct market access, transparent pricing, and blockchain verification of your produce."
              icon="Farmer"
              color="bg-amber-500"
              link="#"
            />
          </div>
          
          <div>
            <MarketplaceCard
              title="For Buyers"
              description="Source quality coffee directly from verified farmers. Get complete traceability and ensure EUDR compliance for all your purchases."
              icon="Cart"
              color="bg-emerald-500"
              link="#"
            />
          </div>
          
          <div>
            <MarketplaceCard
              title="For Agencies"
              description="Streamline certification, verification, and regulatory compliance. Monitor and validate the entire coffee supply chain with ease."
              icon="Building"
              color="bg-blue-500"
              link="#"
            />
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Button className="rounded-md hover:border-amber-700 bg-amber-700 hover:white hover:text-amber-700 text-white px-6">
            Join Our Ecosystem
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}