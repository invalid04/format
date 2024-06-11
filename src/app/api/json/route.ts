import { NextRequest } from "next/server"
import { z } from "zod"

const determineSchemaType = (schema: any) => {
    if(!schema.hasOwnProperty("type")) {
        if(Array.isArray(schema)) {
            return "array"
        } else {
            return typeof schema 
        }
    }
}

const jsonSchemaToZod = (schema: any) => {
    const type = determineSchemaType(schema)
}

export const POST = async (req: NextRequest) => {

    const body = await req.json()
    
    // request validation
    const genericSchema = z.object({
        data: z.string(),
        format: z.object({}).passthrough(),
    })

    const { data, format } = genericSchema.parse(body)

    // create schema for user format
    const dynamicSchema = jsonSchemaToZod(format)

    return new Response("OK")
}