<script lang="ts">
    import {
        showSettings,
        isAdmin,
        isLoggedIn,
        username,
        showLogin,
        chats,
        messages,
        selectedChatId,
        selectedModel
    } from "../stores";
    import { get } from "svelte/store";
    let model = $state(get(selectedModel));

    let mensaje = $state("");
    let mensajeColor = $state("black");

    let colorError = "--accent-error";
    let colorSuccess = "--accent-mint";

    function handleClose() {
        showSettings.set(false);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        handleClose();
    }

    async function modelSelected(modelName: string) {
        if (!$isAdmin) {
            return;
        }

        try {
            const respuesta = await fetch("/api/modelSelect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nuevoModelo: modelName,
                }),
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                model = data.currentModel;
                selectedModel.set(data.currentModel);
                mensajeColor = colorSuccess;
            } else {
                mensajeColor = colorError;
            }
            mensaje =
                data.message +
                (data.currentModel ? " (" + data.currentModel + ")" : "");
        } catch (error) {
            mensaje = "Error en la conexión";
            mensajeColor = colorError;
        }
    }

    function sesionClose() {
        isLoggedIn.set(false);
        isAdmin.set(false);
        username.set("perfil");
        showLogin.set(true);
        showSettings.set(false);
    }
    function sesionClear() {
        chats.set([]);
        messages.set([]);
        selectedChatId.set(null);
    }

    async function logout() {
        try {
            const respuesta = await fetch("/api/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                sesionClose();
                sesionClear();
            } else {
                mensajeColor = colorError;
            }
            mensaje =
                data.message +
                (data.currentModel ? " (" + data.currentModel + ")" : "");
        } catch (error) {
            mensaje = "Error en la conexión";
            mensajeColor = colorError;
        }
    }
</script>

<div
    class="overlay"
    id="overlay"
    onclick={(e) => e.target === e.currentTarget && handleClose()}
    onkeydown={(e) => e.key === "Escape" && handleClose()}
    role="button"
    tabindex="0"
>
    <form id="form" class="form" onsubmit={handleSubmit}>
        <header class="form-header">
            <div class="header-spacer"></div>
            <legend>Settings Admin</legend>
            <button
                type="button"
                class="close-btn"
                onclick={handleClose}
                aria-label="Cerrar">&times;</button
            >
        </header>
        {#if $isAdmin}
            <main class="form-content">
                <section class="input-group">
                    <div class="input-group-content">
                        <legend>gpt oss 120b</legend>
                        <p>El modelo mas rapido del mundo</p>
                        <ul>
                            <li>inteligencia media</li>
                            <li>3000 T/S</li>
                        </ul>
                    </div>
                    <button
                        type="button"
                        class="input-group-button"
                        class:active={model === "gpt"}
                        onclick={() => modelSelected("gpt")}
                    >
                        {#if model === "gpt"}
                            modelo activo
                        {:else}
                            modelo desactivado
                        {/if}
                    </button>
                </section>

                <section class="input-group">
                    <div class="input-group-content">
                        <legend>llama 3.2 70b</legend>
                        <p>El modelo mas barato</p>
                        <ul>
                            <li>inteligencia baja</li>
                            <li>2200 T/S</li>
                        </ul>
                    </div>
                    <button
                        type="button"
                        class="input-group-button"
                        class:active={model === "llama"}
                        onclick={() => modelSelected("llama")}
                    >
                        {#if model === "llama"}
                            modelo activo
                        {:else}
                            modelo desactivado
                        {/if}
                    </button>
                </section>
            </main>
        {/if}
        <footer class="actions">
            {#if mensaje}
                <p
                    class="form-message"
                    style:color={"var(" + mensajeColor + ")"}
                >
                    {mensaje}
                </p>
            {/if}
            <button type="button" class="primary-btn" onclick={logout}
                >cerrar sesión</button
            >
        </footer>
    </form>
</div>

<style>
    /* 1. Layout & Overlay */
    .overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(8px);
    }

    .form {
        background-color: var(--bg-sidebar, #1e1e2e);
        padding: 2.5rem;
        border-radius: var(--radius-lg, 1.5rem);
        display: flex;
        flex-direction: column;
        width: fit-content;
        max-width: 95%;
        max-height: 90vh;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        gap: 2rem;
    }

    /* 2. Header Styles */
    .form-header {
        display: grid;
        grid-template-columns: 40px 1fr 40px;
        align-items: center;
        width: 100%;
    }

    .form-header legend {
        font-size: 1.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-align: center;
        color: var(--text-main, #ffffff);
        margin: 0;
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: var(--text-main, #ffffff);
        font-size: 1.5rem;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .close-btn:hover {
        background: rgba(255, 0, 0, 0.2);
        color: #ff4d4d;
    }

    /* 3. Main Content Area */
    .form-content {
        display: flex;
        flex-direction: row;
        gap: 4rem;
        flex-grow: 1;
        justify-content: center;
        overflow-y: auto;
        padding: 0.5rem;
    }

    .form-content::-webkit-scrollbar {
        width: 6px;
    }

    .form-content::-webkit-scrollbar-thumb {
        background: var(--border-color, rgba(255, 255, 255, 0.1));
        border-radius: 10px;
    }

    /* 4. Input Groups (Cards) */
    .input-group {
        display: flex;
        flex-direction: column;
        width: 250px; /* Tamaño fijo para evitar saltos */
        gap: 1.5rem;
        padding: 1.5rem;
        background-color: var(--bg-input, rgba(0, 0, 0, 0.2));
        border-radius: var(--radius-md, 0.75rem);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .input-group-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        color: var(--text-main, #ffffff);
    }

    .input-group-content legend {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--accent-mint, #94e2d5);
    }

    .input-group-content ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .input-group-button {
        width: 100%;
        height: 3rem; /* Altura fija para que no salte al cambiar el texto */
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main, #ffffff);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: auto;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        white-space: nowrap; /* Evita que el texto largo rompa el diseño */
    }

    .input-group-button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .input-group-button.active {
        background: var(--accent-mint, #94e2d5);
        color: #11111b;
        border-color: var(--accent-mint, #94e2d5);
    }

    .input-group-button.active:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 1rem;
    }

    .primary-btn {
        padding: 1rem;
        background: var(--accent-error, #f38ba8);
        color: #ffffff;
        border: none;
        border-radius: var(--radius-md, 0.75rem);
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition:
            transform 0.1s,
            filter 0.2s;
    }

    .primary-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .primary-btn:active {
        transform: translateY(0);
    }

    /* 6. Feedback & Messages */
    .form-message {
        text-align: center;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
