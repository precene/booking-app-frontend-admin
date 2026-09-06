import { useState } from "react";

import { customersApi } from "../services/customersApi";
import type { Customer } from "../types/customerTypes";

import { Button } from "#/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/shared/components/ui/dialog";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type CustomerActiveDialogProps = {
  customer: Customer;
  onUpdated: (customer: Customer) => void;
  size?: "md" | "sm";
};

export function CustomerActiveDialog({
  customer,
  onUpdated,
  size = "md",
}: CustomerActiveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextActive = !customer.active;

  async function handleUpdate() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await customersApi.updateActive(customer.id, { active: nextActive });
      toast.success({ title: nextActive ? "Customer Activated." : "Customer Deactivated." });
      onUpdated(response.data.user);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update customer status."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
        setErrorMessage(null);
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button size={size} type="button" variant={customer.active ? "outline" : "primary"}>
          {customer.active ? "Deactivate" : "Activate"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nextActive ? "Activate Customer?" : "Deactivate Customer?"}</DialogTitle>
          <DialogDescription>
            {nextActive
              ? "This customer will be able to sign in and book tickets again."
              : "This customer will be signed out, blocked from booking, and any held seats will be released."}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-surface-muted rounded-md p-3 text-sm">
          <p className="font-medium">{customer.fullName ?? customer.email}</p>
          <p className="text-muted mt-1">{customer.email}</p>
        </div>

        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => setIsOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleUpdate}
            type="button"
            variant={nextActive ? "primary" : "destructive"}
          >
            {nextActive ? "Activate Customer" : "Deactivate Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
