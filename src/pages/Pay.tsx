import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Loader2, CheckCircle2, XCircle, Info, ExternalLink, Hash, User, Mail, Calendar, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_KEY = "982d381360a69d419689740d9f2e26ce36fb7a50";
const BASE_URL = "https://sandbox.uddoktapay.com/api";

interface PaymentDetails {
  full_name: string;
  email: string;
  amount: string;
  status?: string;
  invoice_id?: string;
  transaction_id?: string;
  payment_method?: string;
  date?: string;
  message?: string;
}

const Pay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoice_id");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    amount: "100",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<PaymentDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = async (id: string) => {
    setIsVerifying(true);
    try {
      const targetUrl = `${BASE_URL}/verify-payment`;
      const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

      const response = await fetch(proxiedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": API_KEY
        },
        body: JSON.stringify({ invoice_id: id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVerificationData(data);
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(`Verification Failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    document.title = "Payment Sandbox | UddoktaPay";
    if (invoiceId) {
      verifyPayment(invoiceId);
    }
  }, [invoiceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      amount: formData.amount,
      metadata: {
        example_meta: "test_value"
      },
      redirect_url: window.location.origin + window.location.pathname,
      cancel_url: window.location.origin + window.location.pathname,
      return_type: "GET"
    };

    try {
      const targetUrl = `${BASE_URL}/checkout-v2`;
      const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

      const response = await fetch(proxiedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.payment_url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(`Error: ${error.message || "An error occurred while connecting to the payment gateway."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-surface-1/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold gradient-text leading-none uppercase tracking-tighter">
              Payment Gateway
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase">
              UddoktaPay Sandbox v2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-[10px] text-yellow-500 font-bold uppercase">Sandbox Mode</span>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-8">
        {invoiceId ? (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight uppercase">Payment Verification</h2>
              <p className="text-sm text-muted-foreground">
                Retrieving transaction status from UddoktaPay servers.
              </p>
            </div>

            {isVerifying ? (
              <div className="p-12 border border-primary/20 rounded-2xl bg-surface-1 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest">Verifying Connection</p>
                  <p className="text-[10px] text-muted-foreground">INVOICE: {invoiceId}</p>
                </div>
              </div>
            ) : verificationData ? (
              <div className="space-y-4">
                <div className={cn(
                  "p-8 border rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl",
                  verificationData.status === "COMPLETED"
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-red-500/5 border-red-500/20"
                )}>
                  {verificationData.status === "COMPLETED" ? (
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className={cn(
                      "text-2xl font-black uppercase tracking-tighter",
                      verificationData.status === "COMPLETED" ? "text-green-500" : "text-red-500"
                    )}>
                      Payment {verificationData.status}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {verificationData.message || `The transaction has been processed with status: ${verificationData.status}`}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-1 border border-primary/10 rounded-2xl overflow-hidden divide-y divide-primary/5 shadow-sm">
                  {[
                    { label: "Full Name", value: verificationData.full_name, icon: User },
                    { label: "Email", value: verificationData.email, icon: Mail },
                    { label: "Amount", value: `${verificationData.amount} BDT`, icon: Banknote },
                    { label: "Invoice ID", value: verificationData.invoice_id, icon: Hash },
                    { label: "Transaction ID", value: verificationData.transaction_id || "N/A", icon: CreditCard },
                    { label: "Payment Method", value: verificationData.payment_method || "N/A", icon: Info },
                    { label: "Date", value: verificationData.date || "N/A", icon: Calendar },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <item.icon size={14} />
                        <span className="text-xs uppercase font-bold tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/pay")}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/10 font-bold uppercase tracking-widest"
                >
                  Create Another Charge
                </Button>
              </div>
            ) : (
              <div className="p-8 border border-red-500/20 rounded-2xl bg-red-500/5 flex flex-col items-center justify-center text-center space-y-4">
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="text-sm font-bold text-red-500 uppercase">Verification Failed</p>
                <p className="text-xs text-muted-foreground">Could not retrieve payment data for this invoice.</p>
                <Button onClick={() => navigate("/pay")} size="sm" variant="link">Back to Payment Form</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight uppercase">Create Charge</h2>
              <p className="text-sm text-muted-foreground">
                Enter your details below to test the payment flow. No real money will be charged.
              </p>
            </div>

            <form onSubmit={handlePay} className="space-y-4 bg-surface-1 p-6 rounded-2xl border border-primary/10 shadow-xl">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (BDT)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="100"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </>
                )}
              </Button>
            </form>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-xs text-blue-400 leading-relaxed shadow-sm">
              <Info className="shrink-0 w-4 h-4" />
              <p>
                This is a sandbox implementation. You can use any valid email and name.
                The payment process will take you to UddoktaPay's sandbox checkout page.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 border-t border-primary/10 text-[10px] text-muted-foreground uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <span>&copy; {new Date().getFullYear()} Payment.sys</span>
        <div className="flex gap-4">
          <a href="https://uddoktapay.readme.io/reference/api-information" target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-1 transition-colors">
            API Docs <ExternalLink size={10} />
          </a>
          <span>Status: Sandbox Active</span>
        </div>
      </footer>
    </div>
  );
};

export default Pay;
