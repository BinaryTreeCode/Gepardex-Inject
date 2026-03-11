
export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Obtiene la respuesta del LLM usando OpenRouter como proxy.
 * OpenRouter no está bloqueado por Cloudflare desde Vercel/AWS IPs.
 */
export async function getCerebrasResponse(messages: ChatMessage[], model: string) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const isLlama = model === "llama";
    // Mapeo de modelos a OpenRouter
    const modelName = isLlama
        ? "meta-llama/llama-3.1-8b-instruct:free"
        : "meta-llama/llama-3.1-70b-instruct";
    const maxTokens = isLlama ? 2048 : 32768;
    const temperature = isLlama ? 0.2 : 1;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.APP_URL || "https://gepardex.vercel.app",
                "X-Title": "Gepardex",
            },
            body: JSON.stringify({
                model: modelName,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
                top_p: 1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || "";

    } catch (error: any) {
        console.error("Error en OpenRouter API:", error.message || error);
        throw error;
    }
}

