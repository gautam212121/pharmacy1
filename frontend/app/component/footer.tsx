import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto p-4 text-gray-200 bg-gray-900">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-around gap-8">
        {/* Company & Services */}
        <div className="flex-1 space-y-2 text-left">
          <h1 className="font-bold text-md">Company</h1>
          <ul className="space-y-2 text-sm">
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Partner with PharmEasy</a></li>
            <li><a href="#">Sell at Ikabal</a></li>
            <li className="pt-2 font-bold text-md">Our Services</li>
            <li><a href="#">Order Medicine</a></li>
            <li><a href="#">Healthcare Products</a></li>
            <li><a href="#">Lab Tests</a></li>
            <li><a href="#">Doctor Consultation</a></li>
            <li><a href="#">Wellness Solutions</a></li>
            <li><a href="#">Home Healthcare</a></li>
            <li><a href="#">Nutrition Support</a></li>
          </ul>
        </div>

        {/* Featured Categories */}
        <div className="flex-1 space-y-2 text-left">
          <h1 className="font-bold text-md">Featured Categories</h1>
          <ul className="space-y-2 text-sm">
            <li><a href="#">Must Haves</a></li>
            <li><a href="#">Vitamins & Supplements</a></li>
            <li><a href="#">Personal Care</a></li>
            <li><a href="#">Ayurvedic Care</a></li>
            <li><a href="#">Heart Care</a></li>
            <li><a href="#">Skin Care</a></li>
            <li><a href="#">Health Concerns</a></li>
            <li><a href="#">Mother and Baby Care</a></li>
          </ul>
        </div>

        {/* Need Help / Policy Info */}
        <div className="flex-1 space-y-2 text-left">
          <h1 className="font-bold text-md">Need Help</h1>
          <ul className="space-y-2 text-sm">
            <li><a href="#">Browse All Medicines</a></li>
            <li><a href="#">Browse All Molecules</a></li>
            <li><a href="#">Browse All Cities</a></li>
            <li><a href="#">Browse All Stores</a></li>
            <li><a href="#">FAQs</a></li>
            <li className="pt-2 font-bold text-md">Policy Info</li>
            <li><a href="#">Editorial Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Vulnerability Disclosure Policy</a></li>
            <li><a href="#">Terms and Conditions</a></li>
            <li><a href="#">Customer Support Policy</a></li>
            <li><a href="#">Smartbuy Policy</a></li>
            <li><a href="#">Return Policy</a></li>
          </ul>
        </div>

        {/* Follow Us / Map */}
        <div className="flex-1 space-y-2 text-left">
          <h1 className="font-bold text-md">Follow us on</h1>
          <ul className="flex flex-row gap-4">
            <li><a href="#"><img className="h-7 w-7" src="/images/instagram.png" alt="insta" /></a></li>
            <li><a href="#"><img className="h-7 w-7" src="/images/facebook.png" alt="fb" /></a></li>
            <li><a href="#"><img className="h-7 w-7" src="/images/twitter.png" alt="tw" /></a></li>
            <li><a href="#"><img className="h-7 w-7" src="/images/youtube2.png" alt="yt" /></a></li>
          </ul>
          <div className="mt-2 w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.7870579842075!2d80.91943507410088!3d26.846694776693723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399957a3a3f379ef%3A0xa4ed6807c0f612!2sSR%20Group%20Of%20Institutions!5e0!3m2!1sen!2sin!4v1695138093021!5m2!1sen!2sin"
              width="100%"
              height="200"
              className="rounded-md"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Payment Partners */}
      <div className="mt-6">
        <h1 className="text-left font-bold text-lg">Our Payment Partners</h1>
        <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
          <ul className="flex flex-wrap gap-4">
            <li><a href="#"><img className="h-9 w-auto" src="/images/gpay.svg" alt="gpay" /></a></li>
            <li><a href="#"><img className="h-9 w-auto" src="/images/phonepe.svg" alt="phonepe" /></a></li>
            <li><a href="#"><img className="h-9 w-auto" src="/images/paytm.svg" alt="paytm" /></a></li>
            <li><a href="#"><img className="h-9 w-auto" src="/images/mobikwik.svg" alt="mobikwik" /></a></li>
            <li><a href="#"><img className="h-9 w-auto" src="/images/maestro.svg" alt="maestro" /></a></li>
            <li><a href="#"><img className="h-9 w-auto" src="/images/amazon-pay.svg" alt="amazon-pay" /></a></li>
          </ul>
          <div className="w-full mt-4 text-center sm:text-left">
            <span>© 2025 Ikabal Care. All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
