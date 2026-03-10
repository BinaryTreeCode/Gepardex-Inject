<script lang="ts">
    let {
        role = "user",
        content,
    }: { role?: "user" | "assistant"; content: string } = $props();

    let copied = $state(false);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(content);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            console.error("Error al copiar al portapapeles:", err);
        }
    }
</script>

{#if role === "user"}
    <article class="message-user">
        <div class="message-content">
            {content}
        </div>
    </article>
{:else}
    <article class="message-ai">
        <div class="message-content">
            {@html content}

            <button
                class="copy-btn"
                onclick={copyToClipboard}
                title="Copiar respuesta"
            >
                <svg class="icon" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    ></path>
                </svg>
                {copied ? "¡Copiado!" : "Copiar respuesta"}
            </button>
        </div>
    </article>
{/if}

<style>
    .message-user {
        align-self: flex-end;
        max-width: 75%;
        width: fit-content;
        background-color: var(--bg-card);
        color: var(--text-main);
        border-radius: var(--radius-lg);
        border-bottom-right-radius: 4px;
        padding: 1rem 1.5rem;
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .message-ai {
        align-self: flex-start;
        max-width: 85%;
        width: fit-content;
        background-color: transparent;
        color: var(--text-main);
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .copy-btn {
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
        width: fit-content;
    }

    .copy-btn:hover {
        color: var(--accent-mint);
        background-color: rgba(166, 227, 161, 0.1);
    }

    .icon {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
    }
</style>
