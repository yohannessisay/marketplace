import { Coffee, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
 

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-16 pb-8 px-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">AfroValley</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering coffee farmers with blockchain technology for a transparent, sustainable, and fair trade ecosystem.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-500">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 rounded-md bg-gray-700"><Facebook></Facebook></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 rounded-md bg-gray-700" ><Twitter></Twitter></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500">
                <span className="sr-only">Instagram</span>
                <div className="w-6 h-6 rounded-md bg-gray-700"><Instagram></Instagram></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500">
                <span className="sr-only">LinkedIn</span>
                <div className="w-6 h-6 rounded-md bg-gray-700"><Linkedin></Linkedin></div>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#marketplace" className="text-gray-400 hover:text-amber-500 text-sm">Marketplace</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-amber-500 text-sm">Features</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-amber-500 text-sm">About Us</a></li>
              <li><a href="#eudr" className="text-gray-400 hover:text-amber-500 text-sm">EUDR Policy</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-amber-500 text-sm">Testimonials</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-500 text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-500 text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-500 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-500 text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-500 text-sm">Contact Us</a></li>
            </ul>
          </div>
          
          {/* <div>
            <h3 className="text-white font-medium mb-4">Subscribe</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with our latest news and offers.</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800 border-gray-700 text-gray-300 focus:ring-amber-500"
              />
              <Button className="hover:border-amber-700 bg-amber-700 hover:white hover:text-amber-700 mt-1 text-white">
                Subscribe
              </Button>
            </div>
          </div> */}
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center md:flex md:justify-between md:text-left text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AfroValley. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            <span className="px-2">Privacy Policy</span>
            <span className="px-2 border-l border-gray-700">Terms of Service</span>
            <span className="px-2 border-l border-gray-700">Cookies Policy</span>
          </p>
        </div>
      </div>
    </footer>
  );
}