import { NextRequest } from "next/server"
import { ZodTypeAny, z } from "zod"

const determineSchemaType = (schema: any) => {
    if(!schema.hasOwnProperty("type")) {
        if(Array.isArray(schema)) {
            return "array"
        } else {
            return typeof schema 
        }
    }
}

const jsonSchemaToZod = (schema: any): ZodTypeAny => {
    const type = determineSchemaType(schema)

    switch (type) {
        case "string": 
            return z.string().nullable()
        case "number":
            return z.number().nullable()
        case "boolean":
            return z.boolean().nullable()
        case "array":
            return z.array(jsonSchemaToZod(schema.items)).nullable()
        case "object":
            const shape: Record<string, ZodTypeAny> = {}

            for (const key in schema) {
                if(key !== "type") {
                    shape[key] = jsonSchemaToZod(schema[key])
                }
            }

            return z.object(shape)
        
            default:
                throw new Error(`Unsupported data type: ${type}`)
    }
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