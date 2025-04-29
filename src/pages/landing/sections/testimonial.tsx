import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  type: 'farmer' | 'buyer' | 'agency';
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Daniel Kiptoo",
      role: "Coffee Farmer",
      company: "Kenyan Highlands",
      text: "AfroValley has transformed how I sell my coffee. The blockchain verification ensures I get fair prices, and the EUDR compliance makes it easier to access European markets. My income has increased by 40% since joining.",
      type: 'farmer'
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Procurement Director",
      company: "Global Coffee Roasters",
      text: "The transparency in AfroValley's platform gives us complete confidence in our supply chain. We can trace every bean back to its source and ensure all our products meet EUDR standards with minimal administrative burden.",
      type: 'buyer'
    },
    {
      id: 3,
      name: "Michael Okafor",
      role: "Coffee Farmer",
      company: "Ethiopian Highlands",
      text: "The blockchain verification on AfroValley has given my coffee the recognition it deserves. I can now showcase the quality and origin of my beans to buyers around the world. It's truly revolutionary.",
      type: 'farmer'
    },
    {
      id: 4,
      name: "Isabella Martinez",
      role: "Sustainability Officer",
      company: "EcoCert Agency",
      text: "AfroValley's platform has streamlined our certification process. The blockchain ledger provides immutable records that make verification efficient and reliable. This is the future of sustainable commodity tracking.",
      type: 'agency'
    },
    {
      id: 5,
      name: "Thomas Weber",
      role: "Coffee Importer",
      company: "European Coffee House",
      text: "With EUDR regulations becoming stricter, AfroValley has been a lifesaver. Their documentation and verification system ensures we're always compliant without the administrative headache.",
      type: 'buyer'
    }
  ];

  const [filter, setFilter] = useState<'all' | 'farmer' | 'buyer' | 'agency'>('all');
  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.type === filter);

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 text-lg">
              From farmers to global buyers, discover how AfroValley is revolutionizing the coffee industry.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-md p-1 shadow-sm">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('farmer')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'farmer' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Farmers
            </button>
            <button 
              onClick={() => setFilter('buyer')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'buyer' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buyers
            </button>
            <button 
              onClick={() => setFilter('agency')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'agency' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Agencies
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id}>
              <Card className="h-full flex flex-col p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-md"></div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 flex-grow italic">"{testimonial.text}"</p>
                
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 bg-amber-100">
                    <div className="w-full h-full bg-amber-300/50 flex items-center justify-center text-amber-800 font-medium">
                      {testimonial.name.charAt(0)}
                    </div>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">{testimonial.name}</h4>
                    <p className="text-gray-600 text-xs">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}