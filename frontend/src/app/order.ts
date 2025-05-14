export interface CreateOrderDto {
  orderNumber: string;
  paymentDescription: string;
  streetAddress: string;
  town: string;
  country: string;
  currency: string;
  amount: number;
  paymentDueDate: string;
}

export interface Order extends CreateOrderDto {
  id: string;
  publicId: string;
  orderNumber: string;
  paymentDescription: string;
  streetAddress: string;
  town: string;
  country: string;
  currency: string;
  amount: number;
  paymentDueDate: string;
  createdAt: string;
  updatedAt: string;
}
