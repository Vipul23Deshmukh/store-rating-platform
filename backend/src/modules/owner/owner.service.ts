import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnerRatingsQueryDto } from './dto';

/**
 * Service for the Store Owner dashboard.
 *
 * Provides two capabilities:
 *   1. Aggregate statistics (total stores, total ratings, average rating)
 *   2. Paginated + sortable list of all ratings submitted to the owner's stores
 */
@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────
  //  1.  Dashboard Statistics
  // ──────────────────────────────────────────────────────────

  /**
   * Retrieve aggregate stats for every store belonging to `ownerId`.
   *
   * @returns { totalStores, totalRatings, averageRating }
   */
  async getDashboardStats(ownerId: string) {
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

  // ──────────────────────────────────────────────────────────
  //  2.  Ratings Table — Paginated + Sorted
  // ──────────────────────────────────────────────────────────

  /**
   * List **all** ratings submitted to any store owned by `ownerId`.
   *
   * Supports:
   *   • Pagination  (page / limit)
   *   • Sorting     (sortBy / sortOrder)
   *     – Relational sorts: userName, userEmail, storeName
   *     – Direct sorts:     value, createdAt
   *
   * Each rating row includes nested `user { id, name, email }` and `store { id, name }`.
   */
  async getRatings(ownerId: string, query: OwnerRatingsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter: only ratings on stores owned by this user
    const where = {
      store: {
        ownerId,
      },
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    // Build Prisma-compatible orderBy (supports relational sorts)
    const orderBy: any = {};
    if (sortBy === 'userName') {
      orderBy.user = { name: sortOrder };
    } else if (sortBy === 'userEmail') {
      orderBy.user = { email: sortOrder };
    } else if (sortBy === 'storeName') {
      orderBy.store = { name: sortOrder };
    } else {
      // Direct column on the Rating model (value | createdAt)
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
