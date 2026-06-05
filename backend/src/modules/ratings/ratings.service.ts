import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit or update a store rating via upsert.
   * If the user has already rated the store, their existing rating is updated.
   * If they haven't, a new rating is created.
   * This satisfies: "User can rate a store only once. Subsequent ratings must update."
   */
  async submitRating(dto: CreateRatingDto, userId: string) {
    // 1. Verify the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // 2. Upsert: create if not exists, update if exists
    const rating = await this.prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId: dto.storeId,
        },
      },
      update: {
        value: dto.value,
        comment: dto.comment ?? null,
      },
      create: {
        value: dto.value,
        comment: dto.comment,
        userId,
        storeId: dto.storeId,
      },
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
    });

    return rating;
  }

  /**
   * Update a rating by ID (only the author can update their own rating).
   */
  async update(id: string, dto: UpdateRatingDto, userId: string) {
    const rating = await this.prisma.rating.findUnique({ where: { id } });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own rating');
    }

    const data: any = {};
    if (dto.value !== undefined) data.value = dto.value;
    if (dto.comment !== undefined) data.comment = dto.comment;

    return this.prisma.rating.update({ where: { id }, data });
  }

  /**
   * Get the current user's rating for a specific store.
   */
  async getMyRating(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId },
      },
    });

    return rating ?? null;
  }

  /**
   * Get all ratings submitted for a store (with user details).
   */
  async findByStore(storeId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.rating.findMany({
      where: { storeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Remove a rating (admin or the rating owner).
   */
  async remove(id: string) {
    const rating = await this.prisma.rating.findUnique({ where: { id } });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    await this.prisma.rating.delete({ where: { id } });

    return { message: 'Rating deleted successfully' };
  }
}
