import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const updates = body.order as { id: string; position: number }[];
  for (const u of updates) {
    await prisma.reminder.update({ where: { id: u.id }, data: { position: u.position } });
  }
  return NextResponse.json({ ok: true });
}


