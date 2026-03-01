export interface InfoCenterAddress {
  street?: string;
  city?: string;
  country?: string;
  full?: string;
}

export interface InfoCenterContact {
  phone?: string;
  email?: string;
}

export interface InfoCenterHour {
  day: string;
  hours: string;
}

export interface InfoCenter {
  _id: string;
  name?: string;
  address?: InfoCenterAddress;
  contact?: InfoCenterContact;
  hoursSummary?: string;
  openingHours?: InfoCenterHour[];
  footerHours?: InfoCenterHour[];
  parkingInfo?: string;
  transportInfo?: string[];
  createdAt?: string;
  updatedAt?: string;
}
