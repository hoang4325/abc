import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: 200, data: [], msg: "success" });
}

export async function POST() {
  return NextResponse.json({ status: 200, data: { posts: [] }, msg: "success" });
}
