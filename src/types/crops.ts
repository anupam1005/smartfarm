export interface CropParameter {
  min: number;
  max: number;
  optimal: number;
}

export interface CropHealthParameters {
  temperature: CropParameter;
  humidity: CropParameter;
  soilMoisture: CropParameter;
}

export interface Crop {
  id: string;
  name: string;
  healthyParameters: CropHealthParameters;
  growthStages: string[];
  commonIssues: string[];
}

export interface CropsData {
  crops: Crop[];
}