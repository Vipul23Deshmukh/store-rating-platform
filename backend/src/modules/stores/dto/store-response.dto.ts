export class StoreResponseDto {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  averageRating?: number;
  totalRatings?: number;
  createdAt: Date;
  updatedAt: Date;
}
