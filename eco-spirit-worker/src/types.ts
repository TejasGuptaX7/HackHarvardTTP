// src/types.ts

export interface Env {
  R2_BUCKET: R2Bucket;
  DB: D1Database;
  AI: any;
}

export interface BuildingProperties {
  id: number;
  "Commercial District": string;
  Address: string;
  City: string;
  State: string;
  "Square Footage": string;
  "Vacancy Date": number;
  "Length of Vacancy": string;
  "Ownership Type": string;
  "Former Tenant": string;
  "Leasing Activity": string;
  "Recorded Owner": string;
  "Leasing Contact": string;
  "Dataset Date": string;
  Image: string;
  
  // Computed sustainability metrics
  greenScore?: number;
  emissions?: number;
  treeCoverage?: number;
  walkability?: number;
  solarExposure?: number;
  transitAccess?: number;
  bikeability?: number;
  
  // Recommendation fields
  recommended?: boolean;
  recommendationReason?: string;
  recommendationScore?: number;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: BuildingProperties;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface Recommendation {
  buildingId: number;
  score: number;
  reason: string;
  address: string;
  district: string;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  recommendations?: Recommendation[];
}