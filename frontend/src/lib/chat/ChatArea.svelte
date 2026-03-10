<script lang="ts">
    import MessageBubble from "./MessageBubble.svelte";
    import InputArea from "./InputArea.svelte";
    import { isLoggedIn, showLogin } from "../stores";
    import { messages } from "../stores";
</script>

<section class="chat-area">
    <header class="chat-header">
        <h1 id="chat-title">Gepardex Inject</h1>
        {#if !$isLoggedIn}
            <button class="login-btn" onclick={() => showLogin.set(true)}
                >Iniciar Sesión</button
            >
        {/if}
    </header>

    <div class="messages-container" id="chat-messages">
        {#each $messages as message}
            <MessageBubble role={message.role} content={message.content} />
        {/each}
    </div>

    <InputArea />
</section>

<style>
    .chat-area {
        display: flex;
        flex: 1;
        width: 100%;
        flex-direction: column;
        background-color: var(--bg-app);
    }

    .chat-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        height: 60px;
        border-bottom: 1px solid var(--border-color);
    }

    .chat-header h1 {
        font-family: var(--font-brand);
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
    }

    .login-btn {
        background: var(--accent-mint);
        color: #11111b;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition:
            transform 0.1s,
            filter 0.2s;
    }

    .login-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .login-btn:active {
        transform: translateY(0);
    }

    .messages-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        align-self: center;
        max-width: 800px;
    }
</style>
