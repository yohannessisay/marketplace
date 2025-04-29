import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Mail, MapPin, Phone } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-gray-600 text-lg max-w-md">
                Have questions about AfroValley? Our team is here to help you navigate the world of blockchain-powered coffee trading.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-medium">Email Us</h4>
                  <p className="text-gray-600 text-sm">info@afrovalley.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-medium">Call Us</h4>
                  <p className="text-gray-600 text-sm">+254 (0) 123 456 789</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-medium">Visit Us</h4>
                  <p className="text-gray-600 text-sm">Nairobi, Kenya</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Coffee className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-medium">Trading Hours</h4>
                  <p className="text-gray-600 text-sm">Mon-Fri: 8am - 6pm</p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <h3 className="font-medium text-lg mb-3">Join Our Community</h3>
              <p className="text-gray-600 text-sm mb-4">
                Stay updated with the latest news, market trends, and EUDR policy updates.
              </p>
              <div className="flex gap-3">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-full border-amber-200 focus:border-amber-500"
                />
                <Button className="rounded-full mt-1 hover:border-amber-700 bg-amber-700 hover:white hover:text-amber-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 lg:p-8">
              <h3 className="text-xl font-semibold mb-6">Send Us a Message</h3>
              
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      className="rounded-md border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      className="rounded-md border-gray-300"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Input 
                    id="subject" 
                    placeholder="How can we help?" 
                    className="rounded-md border-gray-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    rows={5} 
                    placeholder="Your message..." 
                    className="rounded-md border-gray-300"
                  />
                </div>
                
                <div className="pt-2">
                  <Button className="w-full rounded-md hover:border-amber-700 bg-amber-700 hover:white hover:text-amber-700">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}