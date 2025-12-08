// src/app/api/artworks/create/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/artworks/create
 *
 * 预期 body(JSON)：
 * {
 *   title: string;
 *   artist?: string;
 *   style?: string;
 *   size?: string;
 *   description?: string;
 *   basePriceKzt: number;   // 基础价格（KZT）
 *   forSale: boolean;
 *   forRent: boolean;
 *   rentPerDayKzt?: number | null;
 *   rentPerWeekKzt?: number | null;
 *   rentPerMonthKzt?: number | null;
 * }
 */
export async function POST(req: Request) {
  try {
    // 简单鉴权：从 cookie 里拿 userId（你现有登录逻辑已经在用这个）
    const jar = await cookies();
    const ownerId = jar.get('userId')?.value;

    if (!ownerId) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.title !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'INVALID_BODY' },
        { status: 400 },
      );
    }

    const {
      title,
      artist,
      style,
      size,
      description,
      basePriceKzt,
      forSale,
      forRent,
      rentPerDayKzt,
      rentPerWeekKzt,
      rentPerMonthKzt,
    } = body as {
      title: string;
      artist?: string;
      style?: string;
      size?: string;
      description?: string;
      basePriceKzt?: number;
      forSale?: boolean;
      forRent?: boolean;
      rentPerDayKzt?: number | null;
      rentPerWeekKzt?: number | null;
      rentPerMonthKzt?: number | null;
    };

    // 基础校验
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return NextResponse.json(
        { ok: false, error: 'TITLE_REQUIRED' },
        { status: 400 },
      );
    }

    const normalizedForSale = !!forSale;
    const normalizedForRent = !!forRent;

    if (!normalizedForSale && !normalizedForRent) {
      return NextResponse.json(
        { ok: false, error: 'SALE_OR_RENT_REQUIRED' },
        { status: 400 },
      );
    }

    const priceNumber =
      typeof basePriceKzt === 'number' && !Number.isNaN(basePriceKzt)
        ? Math.max(0, Math.floor(basePriceKzt))
        : 0;

    // 租金字段：如果未勾选出租，就全部置为 null
    const rentDay =
      normalizedForRent &&
      typeof rentPerDayKzt === 'number' &&
      !Number.isNaN(rentPerDayKzt)
        ? Math.max(0, Math.floor(rentPerDayKzt))
        : null;

    const rentWeek =
      normalizedForRent &&
      typeof rentPerWeekKzt === 'number' &&
      !Number.isNaN(rentPerWeekKzt)
        ? Math.max(0, Math.floor(rentPerWeekKzt))
        : null;

    const rentMonth =
      normalizedForRent &&
      typeof rentPerMonthKzt === 'number' &&
      !Number.isNaN(rentPerMonthKzt)
        ? Math.max(0, Math.floor(rentPerMonthKzt))
        : null;

    const newArtwork = await prisma.artwork.create({
      data: {
        ownerId,
        title: trimmedTitle,
        artist: artist?.trim() || null,
        style: style?.trim() || null,
        size: size?.trim() || null,
        description: description?.trim() || null,

        // 旧字段 price：用基础价格填充，保持不为空
        price: priceNumber,

        // 简单起见：新建作品直接视为 published + ACTIVE
        status: 'published',
        lifecycleStatus: 'ACTIVE',

        forSale: normalizedForSale,
        salePriceKzt: normalizedForSale ? priceNumber : null,

        forRent: normalizedForRent,
        rentPerDayKzt: rentDay,
        rentPerWeekKzt: rentWeek,
        rentPerMonthKzt: rentMonth,
      },
      select: {
        id: true,
        ownerId: true,
        title: true,
        artist: true,
        style: true,
        size: true,
        description: true,
        forSale: true,
        salePriceKzt: true,
        forRent: true,
        rentPerDayKzt: true,
        rentPerWeekKzt: true,
        rentPerMonthKzt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { ok: true, item: newArtwork },
      { status: 201 },
    );
  } catch (err) {
    console.error('Error in POST /api/artworks/create:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
