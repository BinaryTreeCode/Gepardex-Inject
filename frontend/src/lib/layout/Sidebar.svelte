<script lang="ts">
    import ChatItem from "./ChatItem.svelte";
    import {
        chats,
        isLoggedIn,
        messages,
        selectedChatId,
        showLogin,
        showSettings,
        username,
    } from "../stores";

    let isCollapsed = $state(false);

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
    }

    function handleSelect(id: number) {
        selectedChatId.set(id);
        getMessages(id);
    }

    async function handleNewChat() {
        if ($isLoggedIn) {
            try {
                const respuesta = await fetch("/api/new-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });

                const data = await respuesta.json();

                if (data.chat) {
                    chats.update((list) => [...list, data.chat]);
                    selectedChatId.set(data.chat.id);
                    messages.set([]);
                } else {
                    console.error("No se pudo crear el chat:", data.message);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        } else {
            showLogin.set(true);
        }
    }

    async function getMessages(chatId: number) {
        try {
            const respuesta = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId }),
            });
            const dataMessages = await respuesta.json();

            if (Array.isArray(dataMessages)) {
                messages.set(dataMessages);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    }
</script>

<nav
    class="sidebar"
    class:collapsed={isCollapsed}
    aria-label="Historial de chats"
>
    <header class="sidebar-header">
        <button
            onclick={toggleSidebar}
            title={isCollapsed ? "Expandir panel" : "Cerrar panel"}
            class="toggle-btn"
        >
            <svg class="icon" viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>

        <button class="new-chat-btn" title="Nuevo chat" onclick={handleNewChat}>
            <svg class="icon" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                ></path>
                <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                ></path>
            </svg>
        </button>
    </header>

    <ul class="chat-list">
        {#each $chats as chat (chat.id)}
            {#if !isCollapsed}
                <ChatItem
                    title={chat.title}
                    active={chat.id === $selectedChatId}
                    onclick={() => handleSelect(chat.id)}
                />
            {/if}
        {/each}
    </ul>

    <footer class="sidebar-footer">
        <button
            id="profileBtn"
            class="chat-item profile-btn"
            onclick={() =>
                $isLoggedIn ? showSettings.set(true) : showLogin.set(true)}
        >
            <svg class="icon" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {#if !isCollapsed}
                <span>{$username}</span>
            {/if}
        </button>
    </footer>
</nav>

<style>
    .sidebar {
        display: flex;
        width: 250px;
        background-color: var(--bg-sidebar);
        border-right: 1px solid var(--border-color);
        align-items: start;
        justify-content: space-between;
        flex-direction: column;
        padding: 0.75rem;
        transition: width 0.3s ease;
        overflow: hidden;
        height: 100vh;
    }

    .sidebar.collapsed {
        width: 60px;
    }

    .sidebar-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
        width: 100%;
        margin-bottom: 2rem;
    }

    .sidebar-header button {
        background: transparent;
        border: none;
        color: var(--text-main);
        padding: 0.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        transition:
            background 0.2s,
            color 0.2s;
        flex-shrink: 0;
    }

    .sidebar-header button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .chat-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        overflow-y: auto;
        flex: 1;
    }

    .chat-item {
        padding: 0.75rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-family: var(--font-tech);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .sidebar-footer {
        width: 100%;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }

    .profile-btn {
        display: flex;
        flex-direction: column;
        align-items: start;
        width: 100%;
        background: transparent;
        border: none;
        color: inherit;
    }
</style>
