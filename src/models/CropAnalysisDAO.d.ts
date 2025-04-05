import { ICropAnalysis } from './CropAnalysisModel';

export interface ICropAnalysisDAO {
  create(cropAnalysis: Partial<ICropAnalysis>): Promise<number>;
  findByFarmerId(farmerId: string, limit?: number): Promise<Partial<ICropAnalysis>[]>;
  update(id: number, cropAnalysis: Partial<ICropAnalysis>): Promise<void>;
  delete(id: number): Promise<void>;
}

declare class CropAnalysisDAO implements ICropAnalysisDAO {
  static create(cropAnalysis: Partial<ICropAnalysis>): Promise<number>;
  static findByFarmerId(farmerId: string, limit?: number): Promise<Partial<ICropAnalysis>[]>;
  static update(id: number, cropAnalysis: Partial<ICropAnalysis>): Promise<void>;
  static delete(id: number): Promise<void>;
}

export default CropAnalysisDAO;