



import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
    baseURL: 'https://api.cerebras.ai/v1',
});

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Obtiene la respuesta de Cerebras usando el SDK oficial.
 * El SDK maneja automáticamente las cabeceras para evitar bloqueos de Cloudflare
 * y es compatible con Vercel Edge Runtime.
 */
export async function getCerebrasResponse(messages: ChatMessage[], model: string) {
    try {
        const isLlama = model === "llama";
        const modelName = isLlama ? "llama3.1-8b" : "gpt-oss-120b";
        const maxTokens = isLlama ? 2048 : 32768;
        const temperature = isLlama ? 0.2 : 1;

        const response = await client.chat.completions.create({
            messages: messages as any,
            model: modelName,
            stream: false,
            max_completion_tokens: maxTokens,
            temperature: temperature,
            top_p: 1
        });

        // Accedemos al contenido de forma segura
        const completion = response as any;
        return completion.choices?.[0]?.message?.content || "";

    } catch (error: any) {
        console.error("Error en Cerebras SDK:", error.message || error);
        throw error;
    }
}

