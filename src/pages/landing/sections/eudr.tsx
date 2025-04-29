import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function EUDRSection() {
  return (
    <section
      id="eudr"
      className="py-20 bg-gradient-to-b from-white to-green-50 relative overflow-hidden"
    >
      <div className="absolute -right-64 top-0 w-[500px] h-[500px] rounded-md bg-green-100/50 blur-3xl" />
      <div className="absolute -left-64 bottom-0 w-[400px] h-[400px] rounded-md bg-amber-100/50 blur-3xl" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl md:text-4xl font-bold">
                EUDR Compliance
              </h2>
            </div>

            <p className="text-gray-700 text-lg mb-6">
              The European Union Deforestation Regulation (EUDR) ensures that
              products sold in the EU market do not contribute to deforestation
              or forest degradation. AfroValley is at the forefront of
              implementing these standards.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Comprehensive Traceability</h4>
                  <p className="text-gray-600">
                    Our blockchain solution traces coffee from its origin,
                    ensuring zero deforestation impact.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Verified Documentation</h4>
                  <p className="text-gray-600">
                    Automated due diligence procedures that meet all EUDR
                    requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Risk Assessment</h4>
                  <p className="text-gray-600">
                    Advanced geolocation tools verify coffee is grown on
                    non-deforested land.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Transparent Reporting</h4>
                  <p className="text-gray-600">
                    Clear documentation for all stakeholders in the supply
                    chain.
                  </p>
                </div>
              </div>
            </div>

            <Button className="rounded-md   text-white">
              <Link
                to={
                  "https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en"
                }
              >
                {" "}
                Learn More About EUDR
              </Link>

              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <div className="p-6 md:p-8">
                <div className="w-16 h-16 bg-green-100 rounded-md flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-green-700" />
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  EUDR Certification Process
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-green-800 font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Geolocation Verification</h4>
                      <p className="text-sm text-gray-600">
                        Precise mapping of farm boundaries to verify
                        non-deforested land.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-green-800 font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Blockchain Registration</h4>
                      <p className="text-sm text-gray-600">
                        Permanent, tamper-proof recording of all supply chain
                        transactions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-green-800 font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Documentation Verification
                      </h4>
                      <p className="text-sm text-gray-600">
                        Review of all required permits and certificates.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-green-800 font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">
                        EUDR Compliance Declaration
                      </h4>
                      <p className="text-sm text-gray-600">
                        Final certification of compliance with all EUDR
                        requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-700 py-4 px-8 text-white text-center">
                <p className="text-sm font-medium">
                  AfroValley simplifies EUDR compliance for all stakeholders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
