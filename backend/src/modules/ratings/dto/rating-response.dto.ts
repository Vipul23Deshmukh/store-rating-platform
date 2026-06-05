export class RatingResponseDto {
  id: string;
  value: number;
  comment?: string;
  userId: string;
  storeId: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
