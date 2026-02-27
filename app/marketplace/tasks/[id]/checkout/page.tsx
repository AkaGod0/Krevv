"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  CreditCard,
  Package,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";

interface Service {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deliveryTime: number;
  category: string;
  features?: string[];
  // ✅ clientId here is the SERVICE OWNER (developer/seller)
  // We no longer need their paypalEmail — payment goes to platform
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchService();
  }, [user, authLoading, id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/marketplace/services/${id}`);
      setService(res.data);

      // ✅ Only check the service exists — no PayPal email check needed
      // Payment goes to YOUR platform account, not directly to developer
      if (!res.data.clientId) {
        setError("Service information is incomplete. Please contact support.");
      }
    } catch (err: any) {
      console.error("Error fetching service:", err);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!service) return;

    setProcessingPayment(true);
    setError("");

    try {
      // ✅ Step 1: Create order — payment will go to YOUR platform PayPal account
      const orderRes = await api.post(`/marketplace/services/${id}/orders`, {
        title: service.title,
        description: service.description,
        price: service.budget,
        deliveryTime: parseInt(service.deliveryTime.toString(), 10),
      });

      const orderId = orderRes.data.order._id;

      // ✅ Step 2: Redirect to payment page (PayPal captures to YOUR account)
      router.push(`/marketplace/orders/${orderId}/payment`);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.response?.data?.message || "Failed to create order. Please try again.");
      setProcessingPayment(false);
    }
  };

  const sellerName = (s: Service) =>
    s.clientId?.companyName ||
    `${s.clientId?.firstName || ""} ${s.clientId?.lastName || ""}`.trim() ||
    "Developer";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">This service may have been removed.</p>
          <button onClick={() => router.push("/marketplace")} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const platformFee = service.budget * 0.05;
  const totalAmount = service.budget + platformFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { n: 1, label: "Review Order", active: true },
              { n: 2, label: "Payment", active: false },
              { n: 3, label: "Confirmation", active: false },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step.active ? "bg-blue-600" : "bg-gray-300"}`}>
                    {step.n}
                  </div>
                  <span className={`font-semibold ${step.active ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-12 h-1 bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: Order Summary ── */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-500">Review your purchase details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{service.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Service Price</p>
                      <p className="font-bold text-gray-900">${service.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Time</p>
                      <p className="font-bold text-gray-900">{service.deliveryTime} Days</p>
                    </div>
                  </div>
                </div>

                {service.features && service.features.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">What's Included</h4>
                    <div className="space-y-2">
                      {service.features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seller */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Seller</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {sellerName(service)[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{sellerName(service)}</p>
                    <p className="text-sm text-gray-500">Professional Developer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">How It Works</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                {[
                  "Your payment is held securely in our escrow account",
                  "Developer receives notification and starts work",
                  `Developer delivers work within ${service.deliveryTime} days`,
                  "You review and approve the delivery",
                  "We release payment to the developer after your approval",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ✅ Escrow notice — reassures client money goes to platform first */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-green-50 rounded-2xl p-5 border-2 border-green-200">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 mb-1">Escrow Protection</p>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Your payment goes directly to our secure platform account — <strong>not</strong> to the developer.
                    Funds are only released to the developer after you approve the completed work.
                    If the work isn't delivered, you're covered.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Payment Sidebar ── */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 sticky top-4">
              <h3 className="text-xl font-black text-gray-900 mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-bold text-gray-900">${service.budget.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="font-bold text-gray-900">${platformFee.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t-2 border-gray-200 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span className="text-3xl font-black text-gray-900">{totalAmount.toFixed(2)}</span>
                    </div>
                    {/* ✅ Updated copy — reflects escrow model */}
                    <p className="text-xs text-gray-400 mt-1">Held in escrow until delivery approved</p>
                  </div>
                </div>
              </div>

              {/* ✅ Where money goes — transparent breakdown */}
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <p className="font-black text-slate-600 uppercase text-[10px] mb-2">Where your money goes</p>
                <div className="flex justify-between text-slate-600">
                  <span>→ Platform escrow</span>
                  <span className="font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>→ Released to developer (after approval)</span>
                  <span className="font-semibold">${service.budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>→ Platform fee retained</span>
                  <span className="font-semibold">${platformFee.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={processingPayment || !!error}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed mb-4"
              >
                {processingPayment ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> Proceed to Payment</>
                )}
              </button>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Payment secured in escrow — not sent to developer</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Full refund if delivery isn't approved</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>24/7 support</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400 mb-3">Secure payment via</p>
                <div className="flex items-center justify-center">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-bold text-blue-700">PayPal</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest font-bold">
                  Funds held by platform · Released after approval
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}