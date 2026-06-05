import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto, OwnerRatingsQueryDto } from './dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all stores with pagination, sorting, name/address search, and per-user rating.
   * @param query   Filter & pagination parameters
   * @param userId  The currently authenticated user's ID (to embed their personal rating)
   */
  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      name?: string;
      address?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    userId?: string,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Specific field filters (take precedence over generic search)
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    if (query.address) {
      where.address = { contains: query.address, mode: 'insensitive' };
    }

    // Generic full-text search across name, email, address
    if (query.search && !query.name && !query.address) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, stores] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          ratings: {
            select: { userId: true, value: true, id: true },
          },
        },
      }),
    ]);

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings;
      const ratingCount = ratings.length;
      const averageRating =
        ratingCount > 0
          ? ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount
          : 0;

      // Find the current user's personal rating for this store
      const userRating = userId
        ? ratings.find((r) => r.userId === userId) ?? null
        : null;

      const { ratings: _, ...storeData } = store;
      return {
        ...storeData,
        averageRating: Number(averageRating.toFixed(2)),
        ratingCount,
        userRating: userRating
          ? { id: userRating.id, value: userRating.value }
          : null,
      };
    });

    return {
      stores: formattedStores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single store details with overall rating stats and all reviews.
   */
  async findOne(id: string, userId?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const ratings = store.ratings;
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount
        : 0;

    const userRating = userId
      ? ratings.find((r) => r.userId === userId) ?? null
      : null;

    return {
      ...store,
      averageRating: Number(averageRating.toFixed(2)),
      ratingCount,
      userRating: userRating
        ? { id: userRating.id, value: userRating.value, comment: userRating.comment }
        : null,
    };
  }

  /**
   * Register a new store (linked to a store owner or admin).
   */
  async create(dto: CreateStoreDto, ownerId: string) {
    const existingStore = await this.prisma.store.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingStore) {
      throw new ConflictException('A store with this email is already registered');
    }

    return this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        address: dto.address,
        ownerId,
      },
    });
  }

  /**
   * Update an existing store's details.
   */
  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.address) data.address = dto.address;

    if (dto.email) {
      const emailLower = dto.email.toLowerCase();
      if (emailLower !== store.email) {
        const existingEmail = await this.prisma.store.findUnique({
          where: { email: emailLower },
        });
        if (existingEmail) {
          throw new ConflictException('Store email already in use');
        }
        data.email = emailLower;
      }
    }

    return this.prisma.store.update({ where: { id }, data });
  }

  /**
   * Delete a store (admin only).
   */
  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.prisma.store.delete({ where: { id } });

    return { message: 'Store deleted successfully' };
  }

  /**
   * Retrieve statistics for an owner's stores.
   */
  async getOwnerStats(ownerId: string) {
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          select: { value: true },
        },
      },
    });

    const totalStores = stores.length;
    let totalRatings = 0;
    let ratingSum = 0;

    for (const store of stores) {
      totalRatings += store.ratings.length;
      ratingSum += store.ratings.reduce((sum, r) => sum + r.value, 0);
    }

    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;

    return {
      totalStores,
      totalRatings,
      averageRating: Number(averageRating.toFixed(2)),
    };
  }

  /**
   * List ratings submitted to any store owned by the owner, with sorting and pagination.
   */
  async getOwnerRatings(ownerId: string, query: OwnerRatingsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      store: {
        ownerId,
      },
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const orderBy: any = {};
    if (sortBy === 'userName') {
      orderBy.user = { name: sortOrder };
    } else if (sortBy === 'userEmail') {
      orderBy.user = { email: sortOrder };
    } else if (sortBy === 'storeName') {
      orderBy.store = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, ratings] = await Promise.all([
      this.prisma.rating.count({ where }),
      this.prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          store: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      ratings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
