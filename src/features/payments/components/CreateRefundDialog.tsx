import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { paymentsApi } from "../services/paymentsApi";
import type { RefundReason } from "../types/paymentTypes";
import { paymentFeatureFlags } from "../utils/paymentFeatureFlags";
import { refundReasonOptions } from "../utils/paymentFormatters";
import { createRefundSchema, type CreateRefundFormValues } from "../validations/paymentValidation";

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
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";

type CreateRefundDialogProps = {
  disabled?: boolean;
  initialBookingId?: string;
  onCreated: () => void;
  size?: "md" | "sm";
  triggerLabel?: string;
  variant?: "outline" | "primary";
};

export function CreateRefundDialog({
  disabled = false,
  initialBookingId = "",
  onCreated,
  size = "md",
  triggerLabel = "Create Refund",
  variant = "primary",
}: CreateRefundDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [reason, setReason] = useState<RefundReason>("requested");
  const [errors, setErrors] = useState<FormValidationErrors<CreateRefundFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!paymentFeatureFlags.refunds) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);
    setErrors({});
    setFormError(null);

    if (!nextOpen) {
      setBookingId(initialBookingId);
      setReason("requested");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const payload = { bookingId, reason };
    const validation = createRefundSchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await paymentsApi.createRefund(validation.data.bookingId, { reason: validation.data.reason });
      toast.success({ title: "Refund Created." });
      setBookingId("");
      setReason("requested");
      setIsOpen(false);
      onCreated();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create refund."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size={size} type="button" variant={variant}>
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Refund</DialogTitle>
          <DialogDescription>
            Start an admin refund for a paid booking with a successful payment.
          </DialogDescription>
        </DialogHeader>

        <Form disabled={isSubmitting} onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="refund-booking-id">Booking ID</Label>
              <Input
                aria-describedby={errors.bookingId ? "refund-booking-id-error" : undefined}
                aria-invalid={Boolean(errors.bookingId)}
                id="refund-booking-id"
                onChange={(event) => setBookingId(event.target.value)}
                placeholder="Booking UUID"
                value={bookingId}
              />
              {errors.bookingId ? (
                <p className="text-destructive mt-1 text-sm" id="refund-booking-id-error">
                  {errors.bookingId}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="refund-reason">Reason</Label>
              <Select
                disabled={isSubmitting}
                onValueChange={(value) => setReason(value as RefundReason)}
                value={reason}
              >
                <SelectTrigger id="refund-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refundReasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
          </div>

          <DialogFooter className="mt-6">
            <Button
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              Create Refund
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
