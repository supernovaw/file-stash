<script>
    import { formatSize, formatTimeAgo } from "$lib";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    export let files; // writable store
    export let onClose;

    let dialog;
    onMount(() => dialog.showModal());
    const accessCode = getContext("accessCode");
    const remoteFiles = getContext("filesList");
    let loading = false, error;

    function close() {
        $files = undefined;
        onClose();
    }

    async function upload() {
        if (loading) return;
        loading = true;
        error = undefined;

        try {
            const formData = new FormData();
            for (const f of $files) formData.append("file", f);
            const response = await fetch("api", {
                method: "POST",
                body: formData,
                headers: { "access-code": $accessCode },
            });
            if (response.ok) {
                $remoteFiles = await response.json();
                onClose();
            } else {
                error = "Error " + response.status + " " + response.statusText;
            }
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    let sum = 0;
    for (const f of $files) sum += f.size;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={close}>
    <table>
        <tbody>
            <tr>
                <th style="min-width: 150pt">Name</th>
                <th style="min-width: 50pt">Size</th>
                <th>Last change</th>
            </tr>
            {#each $files as file (file.name)}
                <tr>
                    <td style="word-break: break-all;">{file.name}</td>
                    <td title="{file.size} bytes">{formatSize(file.size)}</td>
                    <td title={new Date(file.lastModifiedDate).toUTCString()}>
                        {formatTimeAgo(file.lastModifiedDate)} ago
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    {#if $files.length > 1}{formatSize(sum)} total{/if}
    <div class="buttons">
        <button on:click={upload} disabled={loading}>
            Upload {$files.length}
            {$files.length === 1 ? "file" : "files"}
        </button>
        <button on:click={close} disabled={loading}>Cancel</button>
    </div>
    {#if error}
        <div transition:slide style="text-align: center">{error}</div>
    {/if}
</dialog>

<style>
    dialog {
        border-radius: 1em;
        border: none;
        box-shadow: 0 2px 20px #fff1;
        background-color: #1117;
    }

    dialog::backdrop {
        backdrop-filter: blur(4px);
        background-color: #0009;
    }

    table {
        --row-corner-radius: 5pt;
        border-spacing: 0 2pt;
        margin-bottom: 1em;
    }

    th {
        text-align: start;
        font-size: 80%;
        padding-bottom: 5pt;
    }

    th,
    td {
        padding-inline: 6pt;
    }

    tr:nth-child(2n) td {
        background-color: #272727;
    }

    tr:nth-child(2n) td:first-child {
        border-start-start-radius: var(--row-corner-radius);
        border-end-start-radius: var(--row-corner-radius);
    }

    tr:nth-child(2n) td:last-child {
        border-start-end-radius: var(--row-corner-radius);
        border-end-end-radius: var(--row-corner-radius);
    }

    .buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1em;
    }
</style>
