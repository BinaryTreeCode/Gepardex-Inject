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

            default:
                return await gpt(messages);
        }

    } catch (error) {
        console.error("Error in getCerebrasResponse:", error);
        throw error;
    }

}

async function gpt(messages: ChatMessage[]) {
    try {
        const response = await client.chat.completions.create({
            messages: messages,
            model: 'gpt-oss-120b',
            stream: false,
            max_completion_tokens: 32768,
            temperature: 1,
            top_p: 1
        });

        const completion = response as any;
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error enviando mensaje a Cerebras (GPT):", error);
        throw error;
    }
}

async function llama(messages: ChatMessage[]) {
    try {
        const response = await client.chat.completions.create({
            messages: messages,
            model: 'llama3.1-8b',
            stream: false,
            max_completion_tokens: 2048,
            temperature: 0.2,
            top_p: 1
        });

        const completion = response as any;
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error enviando mensaje a Cerebras (llama):", error);
        throw error;
    }
}
