
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  prefill: {
    contact: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const useRazorpay = (onSuccess: () => void) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const initializePayment = (mobileNumber: string, feeAmount: number) => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    if (typeof window.Razorpay === 'undefined') {
      toast({
        title: "Payment Error",
        description: "Payment gateway is not loaded properly. Please try again later.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
      return;
    }

    const options: RazorpayOptions = {
      key: "rzp_test_6pTGl9erTbxe0T",
      amount: feeAmount * 100,
      currency: "INR",
      name: "SRM University",
      description: "Exam Registration Fee",
      image: "https://example.com/logo.png",
      prefill: {
        contact: mobileNumber,
        email: "student@srmuniversity.edu.in"
      },
      theme: {
        color: "#3399cc"
      },
      handler: function(response: any) {
        console.log("Payment successful:", response);
        toast({
          title: "Payment Successful",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        toast({
          title: "Confirmation Sent",
          description: `Payment confirmation SMS sent to ${mobileNumber} and email sent to your registered email.`,
        });
        onSuccess();
        setIsProcessingPayment(false);
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal dismissed");
          setIsProcessingPayment(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response: any) {
        console.error("Payment failed:", response.error);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Your payment could not be processed. Please try again.",
          variant: "destructive"
        });
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast({
        title: "Payment Error",
        description: "There was an error initializing the payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };

  return { isProcessingPayment, initializePayment };
};
