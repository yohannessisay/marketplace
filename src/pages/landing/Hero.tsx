import { Button } from "@/components/ui/button";
import { Coffee, ChevronRight } from "lucide-react";
import HeroImg from "../../assets/hero.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeroProps {
  setIsContactModalOpen: (open: boolean) => void;
}

export function Hero({ setIsContactModalOpen }: HeroProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="relative py-8 sm:py-3 md:py-16 lg:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-white pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)] sm:min-h-fit">
          <div className="flex flex-col items-center sm:items-start justify-center space-y-5 sm:space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center py-1.5 px-3 bg-green-100 text-green-800 rounded-md text-sm sm:text-sm font-medium">
              <Coffee className="w-4 h-4 sm:w-4 sm:h-4 mr-2" />
              Blockchain-powered coffee marketplace
            </div>

            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Connecting Coffee <span className="text-green-600">Farmers</span>{" "}
              to Global <span className="text-green-600">Markets</span>
            </h1>

            <p className="text-base sm:text-base md:text-lg text-gray-600 max-w-full sm:max-w-lg">
              AfroValley empowers coffee farmers with fair trade opportunities
              through our blockchain-based marketplace that ensures
              transparency, and authenticity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Button
                onClick={() => handleNavigation("/market-place")}
                disabled={isLoading}
                className="w-full sm:w-48 rounded-md px-4 py-2 text-sm sm:text-base flex items-center justify-center"
              >
                {isLoading ? "Loading..." : "Explore Marketplace"}
                {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-48 rounded-md px-4 py-2 text-sm sm:text-base flex items-center justify-center"
                onClick={() => setIsContactModalOpen(true)}
              >
                Contact Us
              </Button>
            </div>
          </div>

          <div className="hidden sm:block relative">
            <div className="relative aspect-[4/3] sm:aspect-[3/2] bg-amber-200/30 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={HeroImg}
                  alt="Hero Image"
                  className="w-full h-full object-cover"
                />
                <div className="text-amber-700/30 text-3xl sm:text-4xl md:text-5xl font-bold">
                  Bunaa
                </div>
              </div>
            </div>

            <div className="absolute -top-3 sm:-top-4 lg:-top-6 -right-2 sm:-right-3 lg:-right-4 bg-white rounded-xl p-1.5 sm:p-2 shadow-lg">
              <div className="bg-green-50 rounded-lg p-1 sm:p-1.5 text-center">
                <p className="text-green-800 font-medium text-xs sm:text-sm">
                  Blockchain Enabled
                </p>
                <div className="h-2.5 w-10 sm:h-3 sm:w-12 bg-green-200 rounded mt-1 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
