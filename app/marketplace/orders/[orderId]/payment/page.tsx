"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, useAuth } from "@/app/context/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Lock,
  CheckCircle2,
  Clock,
  PartyPopper,
} from "lucide-react";

interface Order {
  _id: string;
  title: string;
  clientModel: 'User' | 'Company';
  price: number;
  platformFee: number;
  totalAmount: number;
  deliveryTime: number;
  status: string;
  serviceId: { _id: string };
  developerId: {
    firstName: string;
    lastName: string;
    paypalEmail?: string;
    companyName?: string;
  };
  paypalEmail?: string; // Fallback for direct population
}

export default function OrderPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchOrderDetails();
  }, [user, authLoading, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/marketplace/orders/${orderId}`);
      const data = res.data;

      // Already paid — redirect to chat
      if (data.status !== "pending_payment") {
        const serviceId = data.serviceId?._id || data.serviceId;
        router.replace(`/marketplace/chat/${serviceId}`);
        return;
      }

      setOrder(data);
    } catch (err) {
      setError("Could not retrieve order details.");
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    try {
      const res = await api.post(
        `/marketplace/orders/${orderId}/create-paypal-order`
      );
      return res.data.paypalOrderId;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to initialize payment.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    setError("");
    try {
      const res = await api.post(
        `/marketplace/orders/${orderId}/capture-paypal-order`,
        { paypalOrderId: data.orderID }
      );

      if (res.data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          const serviceId = order?.serviceId?._id || (order?.serviceId as any);
          router.push(`/marketplace/chat/${serviceId}`);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment capture failed. Please try again.");
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    setError("PayPal encountered an error. Please try again.");
  };

  const onCancel = () => {
    setError("Payment was cancelled. You can try again.");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "This order doesn't exist."}</p>
          <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
            <PartyPopper className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment is held securely in escrow. The developer has been notified.</p>
          <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
            <Loader2 className="animate-spin" size={16} /> Redirecting to chat...
          </div>
        </motion.div>
      </div>
    );
  }

  // UPDATED CHECK: Looks at developerId or directly on order for paypalEmail
  const paypalEmail = order.developerId?.paypalEmail || order.paypalEmail;

  if (!paypalEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-xl">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Payment Not Available</h2>
          <p className="text-gray-600 mb-6">
            The developer hasn't connected their PayPal account yet. Please contact them to resolve this.
          </p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors font-semibold">
          <ArrowLeft size={20} /> Back to Chat
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] shadow-2xl shadow-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black">Secure Checkout</h1>
            <p className="text-blue-100 text-sm mt-1">Order #{order._id.slice(-6).toUpperCase()}</p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 mb-2">{order.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-semibold">
                <span className="flex items-center gap-1"><Clock size={14} /> {order.deliveryTime} Days Delivery</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Escrow Protected</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 font-semibold">
                <span>Service Price</span>
                <span>${order.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-semibold">
                <span>Platform Fee (5%)</span>
                <span>${order.platformFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-3xl font-black text-blue-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-semibold border border-red-100">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "USD" }}>
              <PayPalButtons 
                style={{ layout: "vertical", shape: "rect", label: "pay", height: 55 }}
                createOrder={createPayPalOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={onCancel}
              />
            </PayPalScriptProvider>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6 text-gray-400 text-sm font-black">
                <div className="flex items-center gap-1"><Lock size={12} /> SSL SECURED</div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="italic">PayPal</div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 font-bold uppercase tracking-widest">
                Funds held in escrow until you approve the work
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}