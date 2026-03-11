import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
});



export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function getCerebrasResponse(messages: ChatMessage[], model: string) {
    try {
        switch (model) {
            case "llama":
                return await llama(messages);
            case "gpt":
                return await gpt(messages);
            default:
                return await llama(messages);
        }
    } catch (error: any) {
        console.error("Error in getCerebrasResponse:", error);
        const errorMessage = error.response?.data?.error?.message || error.message || "Error al conectar con Cerebras";
        throw new Error(errorMessage);
    }
}

async function gpt(messages: ChatMessage[]) {
    const response = await client.chat.completions.create({
        messages: messages,
        model: 'gpt-oss-120b',
        stream: false,
        max_completion_tokens: 32768,
        temperature: 1,
        top_p: 1
    });

    return response.choices[0]?.message?.content || "No se recibió respuesta del modelo.";
}

async function llama(messages: ChatMessage[]) {
    const response = await client.chat.completions.create({
        messages: messages,
        model: 'llama3.1-8b',
        stream: false,
        max_completion_tokens: 2048,
        temperature: 0.2,
        top_p: 1
    });

    return response.choices[0]?.message?.content || "No se recibió respuesta del modelo.";
}
