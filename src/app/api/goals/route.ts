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
  date.setHours(0, 0, 0, 0);
  const items = await prisma.goal.findMany({ where: { userId: session.user.id, date }, orderBy: { position: "asc" } });
  return NextResponse.json(items);
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);
  const count = await prisma.goal.count({ where: { userId: session.user.id, date } });
  await prisma.goal.create({ data: { userId: session.user.id, date, title: body.title ?? "ゴール", position: count } });
  const items = await prisma.goal.findMany({ where: { userId: session.user.id, date }, orderBy: { position: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  if (body.action === "toggle") {
    const g = await prisma.goal.findUnique({ where: { id: body.id } });
    if (g) await prisma.goal.update({ where: { id: g.id }, data: { completed: !g.completed } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "title") {
    await prisma.goal.update({ where: { id: body.id }, data: { title: body.title ?? "" } });
    return NextResponse.json({ ok: true });
  }
  return new NextResponse("Bad Request", { status: 400 });
}


