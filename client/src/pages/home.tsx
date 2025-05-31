import { Clock, Shield, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Healthcare at your doorstep
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Professional medical care when you need it
              </p>
              <Link href="/doctors">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Find a Doctor Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose OnCall Clinic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Medical care at home in less than 1 hour</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure online payment</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Track your doctor's location in real-time</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Verified and licensed doctors</h3>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Find a Doctor</h3>
                <p className="text-gray-600">Search for available doctors by specialty or location.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Book an Appointment</h3>
                <p className="text-gray-600">Select a convenient time and provide your address.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Doctor Visits You</h3>
                <p className="text-gray-600">The doctor arrives at your location at the scheduled time.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Receive Treatment</h3>
                <p className="text-gray-600">Get professional medical care in the comfort of your home.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Convenience</h3>
                <p className="text-gray-600">
                  Receive medical care without leaving your home. Our doctors come to you when you need them.
                </p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Quality Care</h3>
                <p className="text-gray-600">
                  All our doctors are certified professionals with extensive experience in home medical visits.
                </p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4">Safety First</h3>
                <p className="text-gray-600">
                  Strict health protocols and verification processes to ensure your safety and peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Find a qualified doctor near you and book your appointment today.
            </p>
            <div className="space-x-4">
              <Link href="/doctors">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Find a Doctor
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}