import { Button } from "@/components/ui/button";
import { Coffee, ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-white pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start space-y-6">
            <div className="inline-flex items-center py-1.5 px-3 bg-amber-100 text-amber-800 rounded-md text-sm font-medium">
              <Coffee className="w-4 h-4 mr-2" />
              Blockchain-powered coffee marketplace
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Connecting Coffee <span className="text-amber-700">Farmers</span> to Global <span className="text-amber-700">Markets</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              AfroValley empowers coffee farmers with fair trade opportunities through our blockchain-based marketplace that ensures transparency, authenticity, and compliance with EUDR policies.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button className="rounded-md hover:border-amber-700 bg-amber-700 hover:white hover:text-amber-700 text-white px-6">
                Explore Marketplace
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-md border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white">
                Learn More
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-700">500+</p>
                <p className="text-gray-600 text-sm">Farmers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-700">120+</p>
                <p className="text-gray-600 text-sm">Buyers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-700">15+</p>
                <p className="text-gray-600 text-sm">Countries</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative aspect-square md:aspect-[4/3] bg-amber-200/30 rounded-2xl overflow-hidden">
              {/* SVG Placeholder for hero image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-amber-700/30 text-6xl font-bold">Hero Image Placeholder</div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-8 -right-8 bg-white rounded-xl p-3 shadow-lg">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-green-800 font-medium">EUDR Compliant</p>
                <div className="h-4 w-16 bg-green-200 rounded mt-1 mx-auto" />
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg">
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-amber-800 font-medium">Blockchain Verified</p>
                <div className="h-4 w-20 bg-amber-200 rounded mt-1 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}