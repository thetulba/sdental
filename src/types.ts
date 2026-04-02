export type UserRole = 'admin' | 'receptionist' | 'accountant' | 'doctor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  branch?: string;
  createdAt: string;
}

export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  patientId: string;
  internalId?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  insuranceCompany?: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus?: string;
  memberNumber?: string;
  groupNumber?: string;
  crtNumber?: string;
  isInsured: boolean;
  insuranceLimit?: number;
  approvalRequired?: boolean;
  insurancePercentage?: number;
  insuranceExpiry?: string;
  nationality?: string;
  country?: string;
  address?: string;
  dob?: string;
  details?: string;
  emergencyContact?: string;
  referral?: string;
  doctor?: string;
  branch?: string;
  priceListGroup?: string;
  status: 'active' | 'pending' | 'disabled';
  createdAt: string;
  updatedAt: string;
  totalPayments: number;
  remainingBalance: number;
  balance: number;
}

export interface Payment {
  id?: string;
  patientId: string;
  amount: number;
  type: 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet';
  balance: number;
  isClaimed: boolean;
  isSigned: boolean;
  isRefunded: boolean;
  details?: string;
  insuranceCompany?: string;
  invoiceId?: string;
  branch?: string;
  doctor?: string;
  appointmentId?: string;
  refundDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  procedure: string;
  code: string;
  quantity: number;
  tooth?: string;
  price: number;
  discount: number;
  netPrice: number;
}

export interface Invoice {
  id?: string;
  patientId: string;
  invoiceId: string;
  procedures: string;
  items: InvoiceItem[];
  total: number;
  tax: number;
  taxPercent: number;
  discount: number;
  discountPercent: number;
  diagnosticFees: number;
  subtotal: number;
  insuranceShare: number;
  patientShare: number;
  requiredToPay: number;
  paid: number;
  isPaidInFull: boolean;
  isSigned: boolean;
  isReleased: boolean;
  releasedAt?: string;
  branch?: string;
  doctor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id?: string;
  patientId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  room?: string;
  doctor?: string;
  branch?: string;
  notes?: string;
}

export interface BackupRecord {
  id?: string;
  timestamp: string;
  size: number;
  status: string;
  type: 'manual' | 'scheduled';
  fileUrl?: string;
  createdBy: string;
}
