import { Badge } from "@/components/ui/badge";
import AboutImg from "../../../assets/about.jpg";
export default function About() {
  return (
    <section id="about" className="py-20 bg-amber-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-amber-200/50 flex items-center justify-center">
              <img src={AboutImg} alt="Hero Image" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="absolute top-8 -left-8 z-10">
              <Badge className="bg-amber-700 text-white hover:bg-amber-800 px-3 py-1.5 text-sm shadow-lg">
                Founded in 2021
              </Badge>
            </div>
            
            <div className="absolute bottom-8 -right-8 z-10">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 text-sm shadow-lg">
                15+ Washing Locations
              </Badge>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
            
            <p className="text-gray-700 text-lg">
              AfroValley was born from a vision to transform the coffee industry by empowering African farmers through technology. We recognized that despite producing some of the world's finest coffee, many farmers struggled to receive fair compensation and market access.
            </p>
            
            <p className="text-gray-700">
              By leveraging blockchain technology, we've created a transparent ecosystem where farmers can connect directly with global buyers, ensuring fair prices and complete traceability from farm to cup.
            </p>
            
            <p className="text-gray-700">
              Our commitment to sustainability and responsible trade has made us a pioneer in EUDR compliance, helping protect valuable forest resources while supporting the livelihoods of farming communities.
            </p>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-amber-700/30 rounded-md"></div>
                </div>
                <div>
                  <h4 className="font-medium">Transparency</h4>
                  <p className="text-sm text-gray-600">Full supply chain visibility</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-amber-700/30 rounded-md"></div>
                </div>
                <div>
                  <h4 className="font-medium">Sustainability</h4>
                  <p className="text-sm text-gray-600">Environmentally responsible</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-amber-700/30 rounded-md"></div>
                </div>
                <div>
                  <h4 className="font-medium">Fair Trade</h4>
                  <p className="text-sm text-gray-600">Equitable compensation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-amber-700/30 rounded-md"></div>
                </div>
                <div>
                  <h4 className="font-medium">Innovation</h4>
                  <p className="text-sm text-gray-600">Blockchain technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}