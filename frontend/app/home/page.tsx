"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { io } from "socket.io-client";
import { useSearchParams } from "next/navigation";
import { useCart } from "../context/cartContext";
import Homeslider from "../home/Homeslider";
import Link from "next/link";
import CheckoutModal from "../component/CheckoutModal";
import RatingStars from "../component/RatingStars";
import { useCategory } from "../context/CategoryContext";
import { API_BASE_URL, SOCKET_URL, normalizeBackendUrl } from "../lib/backend";



type LabTest = {
  _id: string;
  name: string;
  healthConcern: string;
  price: number;
  image?: string;
  discount?: number;
  rating?: number;
  reviews?: any[];
};

type Product = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  amount?: number;
  discount?: number;
  rating?: number;
  reviews?: any[];
  category?: string;
};

type CartItem = (Product | LabTest) & { qty: number };

export default function Home() {
  const { addToCart } = useCart();
  const { selectedCategory } = useCategory();

  // backend path required when host the website on server  


  const normalizeImage = normalizeBackendUrl;

  const [products, setProducts] = useState<Product[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchQueryRef = useRef<string>("");
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    labTests: LabTest[];
    doctors: boolean;
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedItemForCheckout, setSelectedItemForCheckout] = useState<Product | LabTest | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string>("");


  // backend path required when host the website on server  

  const PRODUCT_URL = `${API_BASE_URL}/products`;
  const LAB_URL = `${API_BASE_URL}/health-products`;
  const SEARCH_URL = `${API_BASE_URL}/search`;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch health products
  const fetchLabTests = async () => {
    try {
      const res = await axios.get(LAB_URL);
      const items = res.data.map((t: any) => ({ ...t, image: normalizeImage(t.image), createdAt: t.createdAt }));
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLabTests(items);
    } catch (err) {
      console.error(err);
    }
  };

  const quickSearchTerms = [
    "headache",
    "fever",
    "cough",
    "acidity",
    "diabetes",
    "allergy",
    "cold and flu",
  ];

  const fetchSearchResults = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults(null);
      setHasSearched(false);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      const res = await axios.get(SEARCH_URL, { params: { q: trimmed } });
      const normalizedProducts = res.data.products.map((p: any) => ({ ...p, image: normalizeImage(p.image) }));
      const normalizedLabTests = res.data.labTests.map((t: any) => ({ ...t, image: normalizeImage(t.image) }));

      const isDoctorQuery = ["doctor", "appointment", "consultant", "physician", "medical"].some(
        (keyword) => trimmed.toLowerCase().includes(keyword)
      );

      setSearchResults({
        products: normalizedProducts,
        labTests: normalizedLabTests,
        doctors: isDoctorQuery,
      });
      setHasSearched(true);
    } catch (err) {
      console.error("Search fetch failed:", err);
      setSearchError("Unable to fetch search results. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Search button handler
  const handleSearch = () => {
    fetchSearchResults(searchQuery);
  };

  // Handle Enter key in search input
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Initial fetch & socket connection
  useEffect(() => {
    fetchProducts();
    fetchLabTests();

    const s = io(SOCKET_URL);
    setSocket(s);

    s.on("product-updated", () => {
      fetchProducts();
      if (searchQueryRef.current.trim().length >= 2) fetchSearchResults(searchQueryRef.current);
    });
    s.on("labtest-updated", () => {
      fetchLabTests();
      if (searchQueryRef.current.trim().length >= 2) fetchSearchResults(searchQueryRef.current);
    });

    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setHasSearched(false);
      setSearchError("");
      return;
    }

    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        fetchSearchResults(query);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Add item to cart
  const handleAddToCart = (item: Product | LabTest) => {
    // local cart preview
    const exists = cart.find((i) => i._id === item._id);
    if (exists) {
      setCart(cart.map((i) => (i._id === item._id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...item, qty: 1 } as CartItem]);
    }

    // The context addToCart expects the product object (see app/context/cartContext.tsx)
    try {
      // If item is a Product-like object expected by context, pass minimal shape
      addToCart({ _id: item._id, title: (item as any).title || (item as any).name, amount: (item as any).amount || (item as any).price || 0 });
    } catch (e) {
      // fallback: ignore context errors
      console.error("addToCart context error:", e);
    }

    setShowPopup((item as any).title || (item as any).name);
    setTimeout(() => setShowPopup(null), 3000);
  };

  // Buy Now - Open Checkout Modal
  const handleBuyNow = (item: Product | LabTest) => {
    setSelectedItemForCheckout(item);
    setShowCheckoutModal(true);
  };

  // Handle Checkout Success
  const handleCheckoutSuccess = (message: string, order?: any) => {
    setCheckoutMessage(message);
    setShowCheckoutModal(false);
    setSelectedItemForCheckout(null);
    setTimeout(() => setCheckoutMessage(""), 5000);
    if (socket && order) socket.emit("new-order", order);
  };
  // type of medicines and services

  const searchParams = useSearchParams();
  const categoryQuery =
    searchParams.get("category") ||
    (selectedCategory && selectedCategory !== "All Products" ? selectedCategory : "");

  const categoryGroups: Record<string, string[]> = {
    "Medicines": [
      "Prescription Medicines",
      "OTC Medicines (Over The Counter)",
      "Ayurvedic / Homeopathic Medicines",
      "Generic Medicines"
    ],
    "Healthcare Products": [
      "Vitamins & Supplements",
      "Personal Care Items",
      "Baby Care",
      "Women Care",
      "Men's Care"
    ],
    "Medical Equipment": [
      "Diabetes Care",
      "Fitness & Activity Monitors",
      "Health Monitors",
      "Medical Accessories",
      "Thermometers",
      "Oximeters",
      "Nebulizers"
    ]
  };

  const getMainCategory = (subcategory?: string) => {
    if (!subcategory) return "Other Products";
    const entry = Object.entries(categoryGroups).find(([_, subcats]) => subcats.includes(subcategory));
    return entry ? entry[0] : "Other Products";
  };

  const filteredProducts = categoryQuery
    ? products.filter((p) => {
        if (categoryGroups[categoryQuery]) {
          return categoryGroups[categoryQuery].includes(p.category || "");
        }
        return p.category === categoryQuery;
      })
    : products;

  const groupedProducts = filteredProducts.reduce<Record<string, Product[]>>((acc, product) => {
    const mainCategory = getMainCategory(product.category);
    if (!acc[mainCategory]) acc[mainCategory] = [];
    acc[mainCategory].push(product);
    return acc;
  }, {});

  const pharmacyTypes = [
    { name: "Medicine", image: "/images/medicine.jpg" },
    { name: "Lab Test", image: "/images/blood-sample.jpg" },
    { name: "Doctor Appointment", image: "/images/doctor.png" },
    { name: "Health Products", image: "/images/heart.jpeg" },
    { name: "Wellness Solutions", image: "/images/heart.jpeg" },
    { name: "Nutrition Support", image: "/images/medicine.jpg" },
    { name: "Home Healthcare", image: "/images/doctor.png" },
  ];
  // Removed Typed.js usage as 'Typed' is not defined or imported.
  // If you want to use Typed.js, install it and initialize inside useEffect.

  // brands 
  const brands = [
    { name: "Cipla", logo: "/images/cipla.png" },
    { name: "Sun Pharma", logo: "/images/sunpharma.png" },
    { name: "Dr. Reddy's", logo: "/images/drreddys.png" },
    { name: "Lupin", logo: "/images/lupin.png" },
    { name: "Abbott", logo: "/images/abbott.png" },
    { name: "Dabur", logo: "/images/dabur.png" },
    { name: "Himalaya", logo: "/images/himalaya.png" },
    { name: "Baidyanath", logo: "/images/baidyanath.png" },
    { name: "Vicks", logo: "/images/vicks.png" },
    { name: "Dolo", logo: "/images/dolo1.png" },
    { name: "Zydus Healthcare" },
    { name: "Torrent Pharma" },
    { name: "Mankind Pharma" },
    { name: "GSK" },
  ];

  const medicalSolutions = [
    {
      title: "Paracetamol",
      formula: "C₈H₉NO₂",
      use: "Fever, headache, body pain",
      description: "Trusted relief for fever, headache, and body pain.",
    },
    {
      title: "Aspirin",
      formula: "C₉H₈O₄",
      use: "Pain relief, blood thinner",
      description: "A classic option for pain reduction and mild blood thinning.",
    },
    {
      title: "Ibuprofen",
      formula: "C₁₃H₁₈O₂",
      use: "Pain, inflammation, fever",
      description: "Effective for inflammation, fever, and general body pain.",
    },
    {
      title: "Caffeine",
      formula: "C₈H₁₀N₄O₂",
      use: "Headache relief",
      description: "A stimulant that often helps with headache relief and alertness.",
    },
    {
      title: "Antibiotic",
      formula: "C₁₆H₁₉N₃O₅S",
      use: "Bacterial infection",
      description: "Used for treating bacterial infections and related symptoms.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6 bg-teal-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Health, Our Priority</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">Find medicines, health products, and book appointments with ease</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <input
                type="text"
                placeholder="Enter a symptom, formula, or medicine name"
                className="flex-1 px-6 py-4 outline-none text-black text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
              />
              <button 
                className="px-8 py-4 bg-green-500 hover:bg-green-700 text-white font-semibold cursor-pointer transition"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-white/90">
              {quickSearchTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-2 hover:bg-white hover:text-teal-900 transition"
                >
                  {term}
                </button>
              ))}
            </div>
            {searchLoading && (
              <p className="mt-3 text-sm text-white/90">Finding matches for "{searchQuery}"...</p>
            )}
            {searchError && (
              <p className="mt-3 text-sm text-red-100">{searchError}</p>
            )}
          </div>
          
          <div className="mt-6">
            <span className="text-sm opacity-75">Need a prescription? </span>
            <button className="text-secondary hover:text-white font-semibold underline">Upload Now</button>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && searchResults && (
        <div className="max-w-7xl mx-auto px-6 py-8  ">
          <h2 className="text-3xl font-bold mb-8 text-black text-center">Search Results for "{searchQuery}"</h2>

          {/* Products Results */}
          {searchResults.products.length > 0 && (
            <div className="mb-12 " >
              <h3 className="text-2xl font-semibold mb-6 text-black">Medicines</h3>
              <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {searchResults.products.map((p) => (
                  <div key={p._id} className="bg-white rounded-none shadow-xl shadow-teal-200/50 overflow-hidden transition hover:shadow-2xl hover:shadow-teal-200/70 border border-gray-100 hover:border-teal-900">
                    <div className="relative h-56 w-full">
                      {p.image ? (
                        <Image src={normalizeImage(p.image)!} alt={p.title} fill className="object-cover" />
                      ) : (
                        <Image src="/images/medicine.jpg" alt="placeholder" fill className="object-cover" />
                      )}
                      {p.discount && p.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {p.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">₹{p.discount && p.discount > 0 ? (p.amount! * (1 - p.discount / 100)).toFixed(2) : p.amount}</p>
                        {p.discount && p.discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">₹{p.amount}</p>
                        )}
                      </div>
                      <button className="w-full rounded-2xl bg-teal-900 hover:bg-teal-700 text-white py-3 text-sm font-semibold transition" onClick={() => handleAddToCart(p)}>
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests Results */}
          {searchResults.labTests.length > 0 && (
            <div className="mb-12 ">
              <h3 className="text-2xl font-semibold mb-6 text-black">Health Products</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {searchResults.labTests.map((test) => (
                  <div key={test._id} className="bg-white rounded-none shadow-xl shadow-teal-200/50 overflow-hidden transition hover:shadow-2xl hover:shadow-teal-200/70 border border-gray-100 hover:border-teal-900">
                    <div className="relative h-56 w-full">
                      {test.image ? (
                        <Image src={test.image} alt={test.name} fill className="object-cover" />
                      ) : (
                        <Image src="/images/blood-sample.jpg" alt="placeholder" fill className="object-cover" />
                      )}
                      {test.discount && test.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {test.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{test.name}</h3>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">₹{test.discount && test.discount > 0 ? (test.price * (1 - test.discount / 100)).toFixed(2) : test.price}</p>
                        {test.discount && test.discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">₹{test.price}</p>
                        )}
                      </div>
                      <button className="w-full rounded-2xl bg-teal-900 hover:bg-teal-700 text-white py-3 text-sm font-semibold transition" onClick={() => handleAddToCart(test)}>
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Appointments Link */}
          {searchResults.doctors && (
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-black">Looking for Doctor Appointments?</h3>
              <Link href="/doctors">
                <button className="bg-green-500 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition">
                  Book Doctor Appointment
                </button>
              </Link>
            </div>
          )}

          {/* No Results Message */}
          {searchResults.products.length === 0 && searchResults.labTests.length === 0 && !searchResults.doctors && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-800">No results found for "{searchQuery}"</p>
              <p className="text-gray-800 mt-2">Try searching for different keywords</p>
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2 text-black">Medicinal Solutions & Trusted Brands</h1>
        <p className="text-gray-700 max-w-3xl mb-6">Explore more healthcare services, medical brands, and trusted solutions tailored to your pharmacy, lab, and wellness needs.</p>
      </div>
      <h1 className="text-2xl font-bold mb-4 px-6 text-black">Brand and company for medicines</h1>
      <div className="px-6">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="flex space-x-6 py-8 px-4 sm:px-2 md:px-3">
            {brands.slice(0, 8).map((brand, index) => (
              <div key={index} className="flex-shrink-0 w-32 h-32 bg-white rounded-2xl shadow-lg shadow-teal-200/50 hover:shadow-2xl hover:shadow-teal-200/70 transition-all duration-300 flex items-center justify-center p-6 border border-gray-100 hover:border-teal-900 transform hover:-translate-y-1 hover:scale-105">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-20 h-20 object-contain filter hover:brightness-110 transition-all duration-200" />
                ) : (
                  <span className="text-center text-sm font-semibold text-gray-700">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="py-10 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-black">Medical Solutions</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {medicalSolutions.map((solution) => (
              <div key={solution.title} className="min-w-[220px] flex-shrink-0 bg-white rounded-none shadow-lg shadow-teal-200/50 p-5 border border-gray-100 hover:border-teal-900 hover:shadow-2xl hover:shadow-teal-200/70 transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-black">{solution.title}</h3>
                  <span className="text-xs uppercase font-semibold text-teal-900 bg-teal-100 px-2 py-1 rounded-full">Formula</span>
                </div>
                <p className="text-base text-slate-900 font-semibold mb-2">{solution.formula}</p>
                <p className="text-sm text-gray-600 mb-4">{solution.description}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Use:</span> {solution.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Services */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-black">Our Services</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {pharmacyTypes.map((type, index) => {
                const isLab = type.name.toLowerCase().includes("lab");
                const isDoctor = type.name.toLowerCase().includes("doctor");
                const tile = (
                  <div className="min-w-[220px] h-[260px] flex-shrink-0 bg-white rounded-none shadow-lg shadow-teal-200/50 hover:border-teal-900 hover:shadow-2xl hover:shadow-teal-200/70 transition-all duration-300 p-6 text-center border border-gray-100 transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-2xl">🏥</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-black group-hover:text-green-600 transition-colors duration-200">{type.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">Click to explore</p>
                  </div>
                );

                if (isLab) return (
                  <Link href="/lab-tests" key={index} className="no-underline">
                    {tile}
                  </Link>
                );

                if (isDoctor) return (
                  <Link href="/doctors" key={index} className="no-underline">
                    {tile}
                  </Link>
                );

                return <div key={index}>{tile}</div>;
              })}
            </div>
          </div>
        </section>

<Homeslider />

        {/* Grouped Products by Main Category */}
        {Object.entries(categoryGroups).map(([mainCategory]) => {
          const groupItems = groupedProducts[mainCategory] || [];
          if (groupItems.length === 0) return null;
          return (
            <section key={mainCategory} className="py-12 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-black text-center">{mainCategory}</h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {groupItems.map((p) => (
                    <div key={p._id} className="min-w-[220px] flex-shrink-0 bg-white rounded-none shadow-xl shadow-teal-200/50 overflow-hidden transition hover:border-teal-900 hover:shadow-2xl hover:shadow-teal-200/70 border border-gray-100">
                      <div className="relative h-48 w-full">
                        {p.image ? (
                          <Image src={normalizeImage(p.image)!} alt={p.title} fill className="object-cover" />
                        ) : (
                          <Image src="/images/medicine.jpg" alt="placeholder" fill className="object-cover" />
                        )}
                        {p.discount && p.discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                            {p.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                          {p.category && (
                            <span className="text-xs uppercase font-semibold text-teal-900 bg-teal-100 px-2 py-1 rounded-full">
                              {p.category}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">₹{p.discount && p.discount > 0 ? (p.amount! * (1 - p.discount / 100)).toFixed(2) : p.amount}</p>
                          {p.discount && p.discount > 0 && (
                            <p className="text-sm text-gray-500 line-through">₹{p.amount}</p>
                          )}
                        </div>
                        <button className="w-full rounded-2xl bg-teal-900 hover:bg-teal-700 text-white py-3 text-sm font-semibold transition" onClick={() => handleAddToCart(p)}>
                          ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        {groupedProducts["Other Products"]?.length > 0 && (
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-black text-center">Other Products</h2>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {groupedProducts["Other Products"].map((p) => (
                  <div key={p._id} className="min-w-[220px] flex-shrink-0 bg-white rounded-none shadow-xl shadow-teal-200/50 overflow-hidden transition hover:border-teal-900 hover:shadow-2xl hover:shadow-teal-200/70 border border-gray-100">
                    <div className="relative h-48 w-full">
                      {p.image ? (
                        <Image src={normalizeImage(p.image)!} alt={p.title} fill className="object-cover" />
                      ) : (
                        <Image src="/images/medicine.jpg" alt="placeholder" fill className="object-cover" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                        {p.category && (
                          <span className="text-xs uppercase font-semibold text-teal-900 bg-teal-100 px-2 py-1 rounded-full">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">₹{p.discount && p.discount > 0 ? (p.amount! * (1 - p.discount / 100)).toFixed(2) : p.amount}</p>
                        {p.discount && p.discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">₹{p.amount}</p>
                        )}
                      </div>
                      <button className="w-full rounded-2xl bg-teal-900 hover:bg-teal-700 text-white py-3 text-sm font-semibold transition" onClick={() => handleAddToCart(p)}>
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      {/* Cart Preview */}
      {
        cart.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white shadow p-4 rounded-lg z-50">
            <h3 className="font-bold mb-2">Cart</h3>
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>{(item as any).title || (item as any).name} x {item.qty}</span>
                <span>₹{(((item as any).amount || (item as any).price || 100) * item.qty)}</span>
              </div>
            ))}
            <div className="font-bold mt-2">
              Total: ₹{cart.reduce((sum, i) => sum + (((i as any).amount || (i as any).price || 100) * i.qty), 0)}
            </div>
          </div>
        )
      }

      {/* Pop-up Notification */}
      {
        showPopup && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {showPopup} added to cart!
          </div>
        )
      }

      {/* Checkout Success Message */}
      {
        checkoutMessage && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {checkoutMessage}
          </div>
        )
      }

      {/* Checkout Modal */}
      {showCheckoutModal && selectedItemForCheckout && (
        <CheckoutModal
          item={selectedItemForCheckout}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedItemForCheckout(null);
          }}
          onSuccess={handleCheckoutSuccess}
          normalizeImage={normalizeImage}
        />
      )}

    </div>
  

  );
}