import { NextRequest } from "next/server"
import { z } from "zod"

export const POST = async (req: NextRequest) => {

    const body = await req.json()
    
    const genericSchema = z.object({
        data: z.string(),
        format: z.object({})
    })

    return new Response("OK")
} 