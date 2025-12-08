// src/app/api/rentals/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/rentals/:id
 * 返回单个租赁电子产品详情
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_ID' },
        { status: 400 },
      );
    }

    const item = await prisma.rentalItem.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        category: true,
        brand: true,
        modelName: true,

        description: true,
        condition: true,

        rentPerDayKzt: true,
        rentPerWeekKzt: true,
        rentPerMonthKzt: true,
        depositKzt: true,

        coverUrl: true,
        location: true,
        district: true,

        status: true,
        createdAt: true,
        updatedAt: true,

        // ✅ 新增：所有者信息（不影响原有字段）
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            contactPhone: true,
            contactWhatsApp: true,
            contactTelegram: true,
            contactNote: true,
            showName: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ok: true, item },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in GET /api/rentals/[id]:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
