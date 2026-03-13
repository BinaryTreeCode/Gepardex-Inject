<script lang="ts">
    let message = "";
    import { messages, selectedChatId, selectedModel } from "../stores";
    import { get } from "svelte/store";

    // API Key de Cerebras expuesta para evitar problemas de env en Vite/Vercel
    // Se recomienda proteger esto habilitando "Allowed Origins" en cloud.cerebras.ai
    const CEREBRAS_API_KEY = "csk-wj29kkp9v8t359xkx4nr5wx54cye4chm2rw9cdwjc39yjc52";

    async function handleSubmit() {
        if (!message.trim()) return;

        const chatId = get(selectedChatId);
        const currentModel = get(selectedModel);

        if (!chatId) {
            console.error("No hay un chat seleccionado");
            return;
        }

        const userMessage = { role: "user" as const, content: message };
        messages.update((list) => [...list, userMessage]);

        const bodyContent = message;
        message = "";

        try {
            const respuestaBackend = await fetch("/api/mensaje-manager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "user",
                    content: bodyContent,
                    chatId: chatId,
                }),
            });

            if (!respuestaBackend.ok) {
                throw new Error("Error al guardar el mensaje del usuario");
            }

            // Llamada directa a Cerebras
            const isLlama = currentModel === "llama";
            const modelName = isLlama ? "llama3.1-8b" : "qwen-3-235b-a22b-instruct-2507";
            const maxCompletionTokens = isLlama ? 2048 : 32768;
            
            const currentHistory = get(messages);

            const aiResponseRaw = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CEREBRAS_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: currentHistory,
                    max_completion_tokens: maxCompletionTokens,
                    stream: false
                }),
            });

            if (!aiResponseRaw.ok) {
                const errorData = await aiResponseRaw.text();
                throw new Error(`Error en Cerebras: ${errorData}`);
            }

            const aiData = await aiResponseRaw.json();
            const aiContent = aiData.choices[0].message.content;

            const assistantMessage = { role: "assistant" as const, content: aiContent };
            messages.update((list) => [...list, assistantMessage]);

            await fetch("/api/mensaje-manager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "assistant",
                    content: aiContent,
                    chatId: chatId,
                }),
            });

        } catch (error: any) {
            console.error("Error en el flujo de chat:", error);
            messages.update((list) => [
                ...list,
                {
                    role: "assistant",
                    content: `Error: ${error.message || "Error al procesar la respuesta"}`,
                },
            ]);
        }
    }
</script>

<footer class="chat-footer">
    <div class="input-wrapper">
        <form
            class="input-form"
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <input
                type="text"
                bind:value={message}
                placeholder="Escribe tu mensaje..."
                aria-label="Mensaje para la AI"
            />
            <button type="submit" class="send-btn" title="Enviar">
                <svg
                    class="icon"
                    style="transform: rotate(45deg); margin-left: -2px; margin-top: -2px;"
                    viewBox="0 0 24 24"
                >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                enviar
            </button>
        </form>
    </div>
</footer>

<style>
    .chat-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        width: 100%;
    }

    .input-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 800px;
    }

    .input-form {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
        background-color: var(--bg-input);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-xl);
        border: 1px solid var(--border-color);
    }

    .input-form input {
        flex: 1;
        padding: 0.75rem;
        border: none;
        background: transparent;
        color: var(--text-main);
        font-family: var(--font-body);
        outline: none;
    }

    .input-form input::placeholder {
        color: var(--text-muted);
    }

    .send-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
        font-family: var(--font-tech);
        font-size: 0.75rem;
        text-transform: uppercase;
    }

    .send-btn:hover {
        color: var(--accent-mint);
        background-color: rgba(166, 227, 161, 0.1);
    }
</style>
