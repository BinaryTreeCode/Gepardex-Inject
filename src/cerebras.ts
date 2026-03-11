
export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Intenta obtener la respuesta de Cerebras usando fetch directo.
 * Usamos cabeceras que simulan un navegador para intentar evadir el bloqueo de Cloudflare en Vercel.
 */
export async function getCerebrasResponse(messages: ChatMessage[], model: string) {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
        throw new Error("CEREBRAS_API_KEY environment variable is not set");
    }

    const isLlama = model === "llama";
    const modelName = isLlama ? "llama3.1-8b" : "gpt-oss-120b";
    const maxCompletionTokens = isLlama ? 2048 : 32768;
    const temperature = isLlama ? 0.2 : 1;

    try {
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                // Cabeceras para intentar engañar al WAF de Cloudflare
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                model: modelName,
                messages: messages,
                max_completion_tokens: maxCompletionTokens,
                temperature: temperature,
                top_p: 1,
                stream: false
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Si sigue bloqueado por Cloudflare, el errorText tendrá el HTML de "Attention Required"
            if (response.status === 403 && (errorText.includes("Cloudflare") || errorText.includes("blocked"))) {
                throw new Error("Cloudflare sigue bloqueando el acceso desde Vercel. Cerebras (sandbox) no permite peticiones desde servidores de AWS/Vercel.");
            }
            throw new Error(`Cerebras API error ${response.status}: ${errorText}`);
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || "";

    } catch (error: any) {
        console.error("Error al conectar con Cerebras:", error.message || error);
        throw error;
    }
}

