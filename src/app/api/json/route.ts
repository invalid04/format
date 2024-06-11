import { NextRequest } from "next/server"
import { z } from "zod"

export const POST = async (req: NextRequest) => {

    const body = await req.json()
    
    const genericSchema = z.object({
        data: z.string(),
        format: z.object({}).passthrough(),
    })

    const res = genericSchema.parse(body)
    console.log('res', res)

    return new Response("OK")
}