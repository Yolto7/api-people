import { UniqueId } from '@common';

export interface Onboarding {
  id: UniqueId;
  email: string;
  buildingId: string;
  apartments: string[];
  parkingLots: string[];
  warehouses: string[];
}

export interface OnboardingSearchResponse {
  onboardings: Onboarding[];
  page: string;
  take: string;
}

export interface OnboardingProxyPort {
  search(email: string, page?: string): Promise<OnboardingSearchResponse>;
}
