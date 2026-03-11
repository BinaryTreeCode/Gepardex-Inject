<script lang="ts">
    import { chats, isLoggedIn, isAdmin, showLogin, username } from "../stores";

    let isLogin = $state(true);
    let mensaje = $state("");
    let mensajeColor = $state("black");

    let Username = $state("");
    let Email = $state("");
    let Password = $state("");

    let colorError = "--accent-error";
    let colorSuccess = "--accent-mint";

    let text = $derived(isLogin ? "Login" : "Registrar");

    async function registro() {
        if (!Username || !Email || !Password) {
            mensaje = "Todos los campos son obligatorios";
            mensajeColor = colorError;
            return;
        }
        try {
            const respuesta = await fetch("/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: Username,
                    email: Email,
                    password: Password,
                }),
            });
            const data = await respuesta.json();
            mensaje = data.message;
            mensajeColor = respuesta.ok ? colorSuccess : colorError;

            if (respuesta.ok) {
                isLoggedIn.set(true);
                isAdmin.set(data.admin || false);
                username.set(data.username || Username);

                setTimeout(() => {
                    handleClose();
                    getChats();
                }, 1000);
            }
        } catch (error) {
            mensaje = "Error en la conexión";
            mensajeColor = colorError;
        }
    }

    async function login() {
        if (!Email || !Password) {
            mensaje = "El email y la contraseña son obligatorios";
            mensajeColor = colorError;
            return;
        }
        try {
            const respuesta = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: Email,
                    password: Password,
                }),
            });
            const data = await respuesta.json();
            mensaje = data.message;
            mensajeColor = respuesta.ok ? colorSuccess : colorError;

            if (respuesta.ok) {
                isLoggedIn.set(true);
                isAdmin.set(data.admin);
                username.set(data.username);
                handleClose();
                getChats();
            }
        } catch (error) {
            mensaje = "Error en la conexión";
            mensajeColor = colorError;
        }
    }

    async function getChats() {
        try {
            const respuesta = await fetch("/api/chats", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const dataChats = await respuesta.json();
            if (Array.isArray(dataChats)) {
                chats.set(dataChats);
            }
        } catch (error) {
            console.error("Error al obtener chats:", error);
        }
    }

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();

        if (isLogin) {
            login();
        } else {
            registro();
        }
    }

    function handleClose() {
        showLogin.set(false);
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
            <legend>{text}</legend>
            <button
                type="button"
                class="close-btn"
                onclick={handleClose}
                aria-label="Cerrar">&times;</button
            >
        </header>

        <main class="form-content">
            {#if !isLogin}
                <div class="input-group">
                    <input
                        type="text"
                        id="name"
                        bind:value={Username}
                        placeholder="Nombre completo"
                        aria-label="Nombre"
                    />
                </div>
            {/if}
            <div class="input-group">
                <input
                    type="email"
                    id="email"
                    bind:value={Email}
                    placeholder="Correo electrónico"
                    aria-label="Email"
                />
            </div>
            <div class="input-group">
                <input
                    type="password"
                    id="password"
                    bind:value={Password}
                    placeholder="Contraseña"
                    aria-label="Contraseña"
                />
            </div>
        </main>

        <footer class="actions">
            {#if mensaje}
                <p
                    class="form-message"
                    style:color={"var(" + mensajeColor + ")"}
                >
                    {mensaje}
                </p>
            {/if}
            <button type="submit" class="primary-btn">{text}</button>
            <button
                type="button"
                class="secondary-btn"
                onclick={() => (isLogin = !isLogin)}
            >
                {isLogin
                    ? "¿No tienes cuenta? Regístrate"
                    : "¿Ya tienes cuenta? Entra"}
            </button>
        </footer>
    </form>
</div>

<style>
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
        width: 95%;
        max-width: 500px;
        max-height: 90vh;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        gap: 2rem;
    }

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

    .form-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        flex-grow: 1;
        justify-content: center;
        overflow-y: auto;
        padding-right: 0.5rem;
    }

    .form-content::-webkit-scrollbar {
        width: 6px;
    }
    .form-content::-webkit-scrollbar-thumb {
        background: var(--border-color, rgba(255, 255, 255, 0.1));
        border-radius: 10px;
    }

    .input-group {
        display: flex;
        flex-direction: column;
    }

    .form input {
        padding: 1rem 1.25rem;
        border-radius: var(--radius-md, 0.75rem);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        background-color: var(--bg-input, rgba(0, 0, 0, 0.2));
        color: var(--text-main, #ffffff);
        font-family: inherit;
        outline: none;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
    }

    .form input:focus {
        border-color: var(--accent-mint, #94e2d5);
        box-shadow: 0 0 0 2px rgba(148, 226, 213, 0.1);
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    }

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

    .primary-btn {
        padding: 1rem;
        background: var(--accent-mint, #94e2d5);
        color: #11111b;
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

    .secondary-btn {
        background: transparent;
        border: none;
        color: var(--text-muted, #a6adc8);
        font-size: 0.9rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .secondary-btn:hover {
        color: var(--accent-mint, #94e2d5);
    }
</style>
