export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number | null;
  discountAmountMinor: number | null;
  validFrom: string;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = {
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmountMinor?: number;
  validFrom?: string;
  validUntil?: string | null;
  maxUses?: number | null;
};

export type CouponUpdatePayload = {
  active?: boolean;
  validUntil?: string | null;
  maxUses?: number | null;
};

export type ListCouponsQuery = {
  active?: "false" | "true";
  limit?: number;
  page?: number;
};
