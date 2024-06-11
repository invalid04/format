import { NextRequest, NextResponse } from "next/server"
import { ZodTypeAny, z } from "zod"

const determineSchemaType = (schema: any) => {
    if(!schema.hasOwnProperty("type")) {
        if(Array.isArray(schema)) {
            return "array"
        } else {
            return typeof schema 
        }
    }

    return schema.type
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

    // retry mechanism
    type PromiseExecutor<T> = (
        resolve: (value: T) => void, 
        reject: (reason?: any) => void
    ) => void

    class RetryablePromise<T> extends Promise<T> {
        static async retry<T>(
            retries: number,
            executor: PromiseExecutor<T>
        ): Promise<T> {
            return new RetryablePromise(executor).catch((error) => {
                console.error(`Retrying due to error: ${error}`)

                return retries > 0 
                ? RetryablePromise.retry(retries - 1, executor) 
                : RetryablePromise.reject(error)
            })
        }
    }

    const validationResult = RetryablePromise.retry<object>(3, (resolve, reject) => {
        try {
            const res = "{name: 'John'}"

            const validationResult = dynamicSchema.parse(JSON.parse(res))

            return resolve(validationResult)
        } catch (err) {
            reject(err)
        }
    })

    return NextResponse.json(validationResult, { status: 200 })
}