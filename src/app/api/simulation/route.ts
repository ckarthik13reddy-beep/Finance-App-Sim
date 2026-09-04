import { NextResponse } from 'next/server'

const markets = ['gold', 'bonds', 'tech', 'energy', 'crypto', 'emerging']
let snapshot = { round: 1, status: 'open', updatedAt: new Date().toISOString(), markets }

export async function GET() {
  return NextResponse.json(snapshot)
}

export async function POST(request: Request) {
  const payload = await request.json() as { round?: number; status?: string }
  snapshot = { ...snapshot, ...payload, updatedAt: new Date().toISOString() }
  return NextResponse.json(snapshot)
}
