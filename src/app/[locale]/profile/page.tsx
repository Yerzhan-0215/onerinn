// /src/app/[locale]/profile/page.tsx
import ProfileLayout from '@/components/profile/ProfileLayout';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Params = { locale: string };

export const metadata = {
  title: 'Профиль — Onerinn',
};

export default async function ProfileHome({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const [artCount, favCount, user] = await Promise.all([
    prisma.artwork.count({ where: { ownerId: userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true, email: true, avatarUrl: true, bio: true },
    }),
  ]);

  const displayName =
    user?.username?.trim() ||
    user?.name?.trim() ||
    session?.user?.name ||
    'Без имени';

  const email = user?.email || session?.user?.email || '—';

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* 顶部：头像 + 基本信息 */}
        <section className="rounded-xl border bg-white p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <img
              src={user?.avatarUrl || '/images/default-avatar.png'}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover ring-1 ring-black/5 sm:h-20 sm:w-20"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {displayName}
              </h1>
              <p className="text-sm text-gray-600 truncate">{email}</p>
              {user?.bio ? (
                <p className="mt-2 text-sm text-gray-700">{user.bio}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-400">Нет описания профиля.</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/${locale}/profile/edit`}
                  className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  ✏️ Редактировать
                </Link>
                <Link
                  href={`/${locale}/profile/security`}
                  className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  🔒 Безопасность
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Произведения"
            value={artCount}
            href={`/${locale}/profile/artworks`}
          />
          <StatCard
            title="Избранное"
            value={favCount}
            href={`/${locale}/profile/favorites`}
          />
          <StatCard title="Подписки" value={0} />
          <StatCard title="Подписчики" value={0} />
        </section>

        {/* 快捷入口 */}
        <section className="rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Быстрые действия</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/profile/artworks`}
              className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              🖼️ Мои произведения
            </Link>
            <Link
              href={`/${locale}/profile/favorites`}
              className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ⭐ Избранное
            </Link>
            <Link
              href={`/${locale}/profile/edit`}
              className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ✏️ Редактировать профиль
            </Link>
            <Link
              href={`/${locale}/profile/security`}
              className="inline-flex items-center rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              🔒 Сменить пароль
            </Link>
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
}

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content; // ✅ 不再使用 JSX.Element 断言，避免 'JSX' 命名空间错误
}
