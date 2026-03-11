<script lang="ts">
    let message = "";
    import { messages, selectedChatId } from "../stores";
    import { get } from "svelte/store";

    async function handleSubmit() {
        if (!message.trim()) return;

        const chatId = get(selectedChatId);
        if (!chatId) {
            console.error("No hay un chat seleccionado");
            return;
        }

        const userMessage = { role: "user" as const, content: message };
        messages.update((list) => [...list, userMessage]);

        const bodyContent = message;
        message = "";

        try {
            // 1. Guardar mensaje del usuario en el Backend
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

            // 2. Llamada directa a Cerebras desde el Navegador (Bypass Cloudflare)
            // IMPORTANTE: Asegúrate de tener CEREBRAS_API_KEY en tu .env de Vite
            const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY; 
            
            // Creamos el historial para la IA
            const currentHistory = get(messages);

            const aiResponseRaw = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: currentHistory,
                    max_completion_tokens: 2048,
                    stream: false
                }),
            });

            if (!aiResponseRaw.ok) {
                const errorData = await aiResponseRaw.text();
                throw new Error(`Error en Cerebras: ${errorData}`);
            }

            const aiData = await aiResponseRaw.json();
            const aiContent = aiData.choices[0].message.content;

            // 3. Mostrar respuesta en el chat
            const assistantMessage = { role: "assistant" as const, content: aiContent };
            messages.update((list) => [...list, assistantMessage]);

            // 4. Guardar respuesta de la IA en el Backend para persistencia
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
