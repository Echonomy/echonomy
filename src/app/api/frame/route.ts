import { NextRequest, NextResponse } from 'next/server';
import { api } from "~/utils/trpc";
async function getResponse(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams
  const id = String(searchParams.get("id"));
  const idAsNumber = parseInt(id)

  const nextId = idAsNumber + 1

  const songData = api.songs.get.useQuery({
    id: Number(id),
  });


  return new NextResponse(`<!DOCTYPE html><html><head>
    <title>This is frame ${id}</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${songData.data?.artwork}" />
    <meta property="fc:frame:button:1" content="Next Page" />
    <meta property="fc:frame:post_url" content="https://echonomy.vercel.app/api/frame?id=${nextId}" />
  </head></html>`);
  
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';