import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <div className="mb-4 rounded-lg bg-amber-50 w-12 h-12 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}