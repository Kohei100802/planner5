import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const date = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const note = await prisma.dailyNote.findUnique({ where: { userId_date: { userId: session.user.id, date: start } } });
  return NextResponse.json(note ?? { content: "" });
}

export async function POST(req: Request) {
  const body = await req.json();
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);
  const note = await prisma.dailyNote.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { content: body.content ?? "" },
    create: { userId: session.user.id, date, content: body.content ?? "" },
  });
  return NextResponse.json(note);
}


