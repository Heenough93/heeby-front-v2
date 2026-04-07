import type { OwnerScope } from "@/types/domain";

export type StockIpoEntry = {
  id: string;
  ownerScope: OwnerScope;
  stockName: string;
  brokerage: string;
  subscribedAt: string;
  deposit: number;
  allocatedQuantity: number;
  refundedAt?: string;
  refundAmount?: number;
  subscriptionFee?: number;
  listedAt?: string;
  sellAmount?: number;
  settledAt?: string;
  taxAndFee?: number;
  createdAt: string;
  updatedAt: string;
};

export type StockIpoDraftRow = {
  id: string;
  ownerScope: OwnerScope;
  stockName: string;
  brokerage: string;
  subscribedAt: string;
  deposit: string;
  allocatedQuantity: string;
  refundedAt: string;
  refundAmount: string;
  subscriptionFee: string;
  listedAt: string;
  sellAmount: string;
  settledAt: string;
  taxAndFee: string;
};
