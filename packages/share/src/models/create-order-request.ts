export interface CreateOrderRequest {
    applicantName?: string;
    applicantPhoneNumber?: string;
    applicantCode?: string;
    notes?: string;
    orderTypeCode?: string;
    regionId?: number;
    priority?: number;
    organizationUnitCode?: string;
    country?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
    postalCode?: string;
    street?: string;
    longitude?: number;
    latitude?: number;
    location: number;
    serviceAddress: string;
    serviceReferentialAddress?: string;
    serviceAddressNumber?: string;
    estimatedDuration: number;

    serviceDueDate?: string;
    ticketingSystemCode?: string;
    crmAccountCode?: string;
    useUnitCodeToResolveOrganization?: boolean;
    extraFieldList?: { name: string; value: string }[];
  }
