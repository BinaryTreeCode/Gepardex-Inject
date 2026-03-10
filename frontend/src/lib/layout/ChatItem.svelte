<script lang="ts">
    interface Props {
        title: string;
        active?: boolean;
        onclick?: () => void;
    }

    let { title, active = $bindable(false), onclick }: Props = $props();
</script>

<li class="chat-item-container">
    <button type="button" class="chat-item" class:active {onclick}>
        {title}
    </button>
</li>

<style>
    .chat-item-container {
        list-style: none;
        width: 100%;
    }

    .chat-item {
        width: 100%;
        background: transparent;
        border: none;
        text-align: left;
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

    .chat-item:hover,
    .chat-item.active {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
    }

    .chat-item.active {
        color: var(--accent-mint);
        background-color: rgba(166, 227, 161, 0.1);
        border-left: 3px solid var(--accent-mint);
        padding-left: calc(0.75rem - 3px);
    }
</style>
