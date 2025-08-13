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
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const items = await prisma.calendarEvent.findMany({ where: { userId: session.user.id, start: { gte: start, lt: end } }, orderBy: { start: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const created = await prisma.calendarEvent.create({ data: { userId: session.user.id, title: body.title, start: new Date(body.start), end: new Date(body.end), calendar: body.calendar ?? "default" } });
  return NextResponse.json(created);
}


