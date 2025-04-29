import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  link: string;
}

export function MarketplaceCard({ title, description, color, link }: MarketplaceCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-5", color)}>
        {/* SVG Placeholder */}
        <div className="w-6 h-6 bg-white/30 rounded-full"></div>
      </div>
      
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      
      <a 
        href={link} 
        className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium text-sm mt-auto"
      >
        Learn more
        <ArrowRight className="ml-1 h-4 w-4" />
      </a>
    </div>
  );
}