
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { semesterInfo } from "@/data/mockData";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Shield, 
  CheckCircle
} from "lucide-react";

const PaymentPortal = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
      
      // Redirect faculty users to dashboard
      if (storedRole === "faculty") {
        navigate("/dashboard");
      }
    }
  }, [navigate]);
  
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate("/hallticket");
      }, 2000);
    }, 1500);
  };

  // Render only for students
  if (userRole === "faculty") {
    return null; // This will never render because of the redirect
  }

  if (isSuccess) {
    return (
      <Layout title="Payment Portal">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-green-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your examination fee has been successfully paid. You will be redirected to the hall ticket page.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">TXN{Math.random().toString().substring(2, 10)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{semesterInfo.feeAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>
          <Button onClick={() => navigate("/hallticket")}>
            Return to Hall Ticket
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Portal">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Examination Fee Payment</CardTitle>
            <CardDescription>
              Please select a payment method to complete your examination registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-medium">{semesterInfo.current} Examination Fee</h3>
                <p className="text-gray-600 text-sm">Registration Deadline: {new Date(semesterInfo.registrationDeadline).toLocaleDateString()}</p>
              </div>
              <div className="text-2xl font-bold">₹{semesterInfo.feeAmount}</div>
            </div>
            
            <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="credit">Credit Card</TabsTrigger>
                <TabsTrigger value="debit">Debit Card</TabsTrigger>
                <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
                <TabsTrigger value="airtel">Airtel Wallet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex mb-4">
                    <Smartphone className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">UPI Payment</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">UPI ID</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="username@upi"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Enter your UPI ID to make the payment directly from your linked bank account.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="credit" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex mb-4">
                    <CreditCard className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Credit Card Payment</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Card Number</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">CVV</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Card Holder Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="debit" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex mb-4">
                    <CreditCard className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Debit Card Payment</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Card Number</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">CVV</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Card Holder Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="netbanking" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex mb-4">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Net Banking</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Select Bank</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Select your bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="other">Other Banks</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-600">
                      You will be redirected to your bank's website to complete the payment.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="airtel" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex mb-4">
                    <Smartphone className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Airtel Wallet</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Mobile Number</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      You will receive an OTP on your registered Airtel number to complete the payment.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-1" />
              Secured by 256-bit SSL encryption
            </div>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentPortal;
