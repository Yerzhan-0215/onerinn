// /src/app/api/admin-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Role = 'user' | 'assistant';

type IncomingMessage = {
  role: Role;
  content: string;
};

function languageName(locale: string): string {
  switch (locale) {
    case 'ru':
      return 'Russian';
    case 'kk':
      return 'Kazakh';
    case 'zh':
      return 'Chinese';
    default:
      return 'English';
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const locale: string = json.locale || 'en';
    const messages: IncomingMessage[] = json.messages || [];

    const pageContext = req.headers.get('x-page-context') || '';

    const sysPrompt = `
You are "Onerinn Builder", a technical assistant for the Onerinn admin/developer.
Always answer in: ${languageName(locale)}.

Current page:
${pageContext}

Your responsibilities:
- Help with Next.js (App Router), TypeScript, React, Tailwind.
- Help with Prisma + PostgreSQL schema & queries.
- Help with Onerinn business logic.
- Provide exact file paths and code blocks.
- When updating existing files, modify minimally.

If not sure, explain tradeoffs.
`.trim();

    const openaiMessages = [
      { role: 'system' as const, content: sysPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: openaiMessages,
    });

    const anyRes: any = response;

    let reply =
      anyRes.output_text ||
      anyRes.output?.[0]?.content?.[0]?.text ||
      '';

    if (!reply) {
      reply =
        locale === 'ru'
          ? 'Извините, не удалось получить ответ.'
          : locale === 'kk'
          ? 'Кешіріңіз, жауап алу мүмкін болмады.'
          : locale === 'zh'
          ? '抱歉，暂时无法获取回复。'
          : 'Sorry, failed to get a reply.';
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Admin Chat API error:', err);
    return NextResponse.json(
      { reply: null, error: 'Server error' },
      { status: 500 },
    );
  }
}
