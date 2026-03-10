<script lang="ts">
    import Sidebar from "./lib/layout/Sidebar.svelte";
    import ChatArea from "./lib/chat/ChatArea.svelte";
    import FormUser from "./lib/auth/FormUser.svelte";
    import SettingsAdmin from "./lib/auth/SettingsAdmin.svelte";

    import { isLoggedIn, isAdmin, showLogin, showSettings } from "./lib/stores";
</script>

<main class="app-container">
    <Sidebar />
    <ChatArea />
    {#if !$isLoggedIn && $showLogin}
        <FormUser />
    {/if}
    {#if $showSettings}
        <SettingsAdmin />
    {/if}
</main>

<style>
    .app-container {
        display: flex;
        height: 100vh;
        width: 100%;
    }
</style>
