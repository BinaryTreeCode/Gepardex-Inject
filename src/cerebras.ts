




export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

async function callCerebras(messages: ChatMessage[], model: string, maxTokens: number, temperature: number) {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
        throw new Error("CEREBRAS_API_KEY no está configurada");
    }

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
            messages,
            model,
            max_completion_tokens: maxTokens,
            temperature,
            top_p: 1,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cerebras API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

export async function getCerebrasResponse(messages: ChatMessage[], model: string) {
    try {
        if (model === "llama") {
            return await callCerebras(messages, 'llama3.1-8b', 2048, 0.2);
        } else {
            // Default: gpt (gpt-oss-120b)
            return await callCerebras(messages, 'gpt-oss-120b', 32768, 1);
        }
    } catch (error) {
        console.error("Error in getCerebrasResponse:", error);
        throw error;
    }
}

