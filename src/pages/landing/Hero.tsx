import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ContactModal from "./contact-us";

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 via-green-700 to-amber-800 flex flex-col">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-b from-amber-900/90 via-amber-800/80 to-amber-950/90"
          style={{
            backgroundImage: "url(images/hero.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        ></div>
      </div>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">AfroValley</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to={"/login"}>
              <Button className=" ">Login</Button>
            </Link>
            <Link to={"/registration"}>
              <Button className="bg-white text-green-700 hover:bg-primary hover:text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold sm:text-amber-100 text-gray-900 mb-6">
              Premium coffee marketplace
            </h2>
            <p className="text-xl text-amber-100 mb-8 backdrop-blur-md bg-white/10  rounded-md p-2">
              Connecting the world's finest coffee growers with global markets.
              Exceptional beans, sustainable practices, and reliable delivery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <ContactModal></ContactModal>
              <Link to={"/market-place"}>
                <Button className="bg-white text-green-700 hover:bg-primary hover:text-white">
                  Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-black/20 border-t border-white/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 mb-4 md:mb-0">
              © {new Date().getFullYear()} AfroValley. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {/* <Link to="#" className="text-white/70 hover:text-white">
                Terms
              </Link>
              <Link to="#" className="text-white/70 hover:text-white">
                Privacy
              </Link>
              <Link to="#" className="text-white/70 hover:text-white">
                Contact
              </Link> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
