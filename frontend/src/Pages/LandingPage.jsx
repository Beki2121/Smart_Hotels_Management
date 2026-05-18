import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Wifi,
  Coffee,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Utensils,
  Dumbbell,
  Waves,
} from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏨</span>
            <div>
              <h1 className="text-2xl font-bold">Luxury Grand Hotel</h1>
              <p className="text-amber-100 text-xs">Your Perfect Destination</p>
            </div>
          </div>
          <button
            onClick={handleLoginClick}
            className="bg-white text-amber-700 px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2"
          >
            Staff Login <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6">
            <Star className="text-yellow-500" size={18} />
            <span className="text-sm font-semibold text-gray-700">5-Star Luxury Experience</span>
            <Star className="text-yellow-500" size={18} />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Luxury Grand Hotel
          </h2>
          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            Experience world-class hospitality, elegant accommodations, and exceptional service in the heart of the city.
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Whether you're here for business or leisure, we're committed to making your stay unforgettable.
          </p>
          <button
            onClick={() => document.getElementById("rooms").scrollIntoView({ behavior: "smooth" })}
            className="bg-amber-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-800 transition-colors inline-flex items-center gap-2"
          >
            Explore Our Rooms <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Luxurious Room Options
          </h3>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Choose from our selection of elegantly designed rooms, each offering comfort and sophistication
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Room Type 1 */}
            <div className="bg-amber-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🛏️</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Single Room
              </h4>
              <p className="text-gray-600 mb-4 text-sm">
                Cozy rooms perfect for solo travelers with modern amenities and city views.
              </p>
              <p className="text-amber-700 font-bold text-lg">From ETB 500/night</p>
            </div>

            {/* Room Type 2 */}
            <div className="bg-amber-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🛌</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Double Room
              </h4>
              <p className="text-gray-600 mb-4 text-sm">
                Spacious rooms with premium bedding and a relaxing ambiance for couples.
              </p>
              <p className="text-amber-700 font-bold text-lg">From ETB 800/night</p>
            </div>

            {/* Room Type 3 */}
            <div className="bg-amber-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👑</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Deluxe Suite
              </h4>
              <p className="text-gray-600 mb-4 text-sm">
                Luxurious suites with separate living areas and premium amenities.
              </p>
              <p className="text-amber-700 font-bold text-lg">From ETB 1,500/night</p>
            </div>

            {/* Room Type 4 */}
            <div className="bg-amber-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Family Room
              </h4>
              <p className="text-gray-600 mb-4 text-sm">
                Spacious rooms perfect for families with multiple beds and extra space.
              </p>
              <p className="text-amber-700 font-bold text-lg">From ETB 1,200/night</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dining & Facilities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            World-Class Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fine Dining */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Utensils size={32} className="text-amber-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Fine Dining Restaurant
              </h4>
              <p className="text-gray-600 mb-4">
                Experience culinary excellence with our award-winning chefs preparing international and local cuisine.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ À la carte menu</li>
                <li>✓ Wine selection</li>
                <li>✓ Private dining</li>
              </ul>
            </div>

            {/* Cafe & Bar */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Coffee size={32} className="text-amber-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Cafe & Bar
              </h4>
              <p className="text-gray-600 mb-4">
                Relax with signature cocktails, premium coffee, and light refreshments in our elegant lounge.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Craft cocktails</li>
                <li>✓ Premium coffee</li>
                <li>✓ Evening entertainment</li>
              </ul>
            </div>

            {/* Fitness Center */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell size={32} className="text-amber-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Fitness Center
              </h4>
              <p className="text-gray-600 mb-4">
                Stay active with state-of-the-art equipment and personalized training services available.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Modern equipment</li>
                <li>✓ Personal training</li>
                <li>✓ Yoga classes</li>
              </ul>
            </div>

            {/* Swimming Pool */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Waves size={32} className="text-amber-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Swimming Pool
              </h4>
              <p className="text-gray-600 mb-4">
                Enjoy our Olympic-sized swimming pool with heated water and cabana facilities.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Heated pool</li>
                <li>✓ Cabanas</li>
                <li>✓ Pool bar</li>
              </ul>
            </div>

            {/* Spa & Wellness */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🧖</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Spa & Wellness
              </h4>
              <p className="text-gray-600 mb-4">
                Rejuvenate yourself with our luxurious spa treatments and wellness programs.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Massage therapy</li>
                <li>✓ Facials & treatments</li>
                <li>✓ Sauna & steam room</li>
              </ul>
            </div>

            {/* WiFi & Connectivity */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Wifi size={32} className="text-amber-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Business Center
              </h4>
              <p className="text-gray-600 mb-4">
                Stay connected with high-speed WiFi, meeting rooms, and modern business facilities.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ High-speed WiFi</li>
                <li>✓ Meeting rooms</li>
                <li>✓ Business services</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Star,
                title: "Exceptional Service",
                desc: "Our dedicated staff ensures every moment of your stay is perfect.",
              },
              {
                icon: Clock,
                title: "24/7 Concierge",
                desc: "Our concierge team is available round-the-clock for your needs.",
              },
              {
                icon: MapPin,
                title: "Prime Location",
                desc: "Located in the heart of the city with easy access to attractions.",
              },
              {
                icon: Users,
                title: "Expert Team",
                desc: "Our experienced staff speaks multiple languages.",
              },
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="bg-amber-700 text-white p-3 rounded-lg flex-shrink-0 mt-1">
                    <IconComponent size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h3>
          <p className="text-amber-100 mb-8 text-lg">
            Experience luxury and comfort at Luxury Grand Hotel. Reserve your room today!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Get In Touch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-amber-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Phone</h4>
              <p className="text-gray-600">+251 11 123 4567</p>
              <p className="text-gray-600">+251 11 123 4568</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">info@luxurygrandhotel.com</p>
              <p className="text-gray-600">reservations@luxurygrandhotel.com</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Location</h4>
              <p className="text-gray-600">Addis Ababa, Ethiopia</p>
              <p className="text-gray-600">Bole Road, Premium District</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="text-lg font-bold mb-4">Luxury Grand Hotel</h5>
              <p className="text-gray-400">
                Your destination for luxury, comfort, and unforgettable experiences in Addis Ababa.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Quick Links</h5>
              <ul className="text-gray-400 space-y-2">
                <li>
                  <a href="#rooms" className="hover:text-white transition">
                    Rooms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Amenities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Events
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Support</h5>
              <ul className="text-gray-400 space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2026 Luxury Grand Hotel. All rights reserved. | Excellence in Hospitality
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
