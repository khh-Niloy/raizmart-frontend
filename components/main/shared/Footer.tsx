"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="text-9xl font-bold text-gray-600 select-none">
          Gadgets
        </div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contact Information & App Downloads */}
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-lg">🍎</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-orange-400 font-bold text-xl">
                    gadgets
                  </span>
                  <span className="text-white text-sm">AppleGadgets</span>
                </div>
                <span className="text-orange-400 text-sm">™</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Phone Number</p>
                    <p className="text-white font-medium">09678148148</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Email Address</p>
                    <p className="text-white font-medium">contact@applegadgetsbd.com</p>
                  </div>
                </div>
              </div>

              {/* App Download Buttons */}
              <div className="space-y-3">
                <button className="flex items-center space-x-3 bg-black hover:bg-gray-800 rounded-lg p-3 transition-colors duration-200 w-full">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-black font-bold text-sm">🍎</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">Download on the</p>
                    <p className="text-white text-lg font-bold">App Store</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 bg-black hover:bg-gray-800 rounded-lg p-3 transition-colors duration-200 w-full">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-black font-bold text-sm">▶</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">GET IT ON</p>
                    <p className="text-white text-lg font-bold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg uppercase">Location</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Bashundhara City Shopping Complex</p>
                    <p className="text-gray-300 text-sm">Basement 2, Shop 26</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Bashundhara City Shopping Complex</p>
                    <p className="text-gray-300 text-sm">Level- 5, Block- A, Shop- 6, 7, 8</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Jamuna Future Park</p>
                    <p className="text-gray-300 text-sm">Level 4, Zone A (West Court), Shop 28D</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">AG Care | Bashundhara City Shopping Complex</p>
                    <p className="text-gray-300 text-sm">Level- 3, Block- B, Shop- 07</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg uppercase">About Us</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  About Us
                </Link>
                <Link href="/corporate" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Corporate
                </Link>
                <Link href="/order-tracking" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Order Tracking
                </Link>
                <Link href="/blog" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Blog
                </Link>
                <Link href="/press-coverage" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Press Coverage
                </Link>
                <Link href="/careers" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Careers
                </Link>
                <Link href="/complain" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Complain / Advice
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Contact Us
                </Link>
                <Link href="/faq" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  FAQs
                </Link>
              </div>
            </div>

            {/* Policy */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg uppercase">Policy</h3>
              <div className="space-y-3">
                <Link href="/privacy-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/emi-payment-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  EMI and Payment Policy
                </Link>
                <Link href="/warranty-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Warranty Policy
                </Link>
                <Link href="/exchange-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Exchange Policy
                </Link>
                <Link href="/delivery-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Delivery Policy
                </Link>
                <Link href="/pre-order-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Pre-Order Policy
                </Link>
                <Link href="/refund-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Refund Policy
                </Link>
                <Link href="/return-policy" className="block text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Return Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-gray-400 text-sm">
                © 2025 Thanks From Apple Gadgets | All rights reserved
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center space-x-4">
                {/* WhatsApp */}
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </button>

                {/* Instagram */}
                <button className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </button>

                {/* LinkedIn */}
                <button className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
