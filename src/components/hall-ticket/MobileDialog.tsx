
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MobileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobileNumber: string;
  onMobileNumberChange: (value: string) => void;
  onContinue: () => void;
}

const MobileDialog = ({
  open,
  onOpenChange,
  mobileNumber,
  onMobileNumberChange,
  onContinue,
}: MobileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Contact Details</DialogTitle>
          <DialogDescription>
            Please provide your mobile number to receive payment confirmation
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="mobile" className="text-right col-span-1">
              Mobile
            </label>
            <Input
              id="mobile"
              value={mobileNumber}
              onChange={(e) => onMobileNumberChange(e.target.value)}
              placeholder="10-digit mobile number"
              className="col-span-3"
              maxLength={10}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onContinue}>Continue to Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileDialog;
