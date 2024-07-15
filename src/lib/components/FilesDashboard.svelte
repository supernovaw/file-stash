<script>
    import IconDownload from "$lib/components/IconDownload.svelte";
    import IconTrash from "$lib/components/IconTrash.svelte";
    import FileUploader from "$lib/components/FileUploader.svelte";
    import { formatSize, formatTimeAgo } from "$lib";
    import { getContext } from "svelte";
    import { fade } from "svelte/transition";

    const accessCode = getContext("accessCode");
    const filesList = getContext("filesList");
    let refreshing = false;

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function download(file) {
        try {
            const params = new URLSearchParams({ file: file.name });
            const response = await fetch("api?" + params, {
                headers: { "access-code": $accessCode },
            });
            downloadBlob(await response.blob(), file.name);
        } catch (e) {
            alert("Error: " + e.message);
        }
    }

    async function deleteFile(file) {
        file.pendingDelete = true;
        $filesList = $filesList;

        try {
            const params = new URLSearchParams({ file: file.name });
            const response = await fetch("api?" + params, {
                method: "DELETE",
                headers: { "access-code": $accessCode },
            });
            if (response.ok) {
                $filesList = $filesList.filter((f) => f.name !== file.name);
            } else if (response.status === 404) {
                $filesList = $filesList.filter((f) => f.name !== file.name);
                alert(
                    "File was not found (did you delete it from a different device/tab?)",
                );
            } else {
                const code = response.status;
                const msg = await response.text();
                throw { message: code + ": " + msg };
            }
        } catch (e) {
            alert("Error deleting file: " + e.message);
            delete file.pendingDelete;
            $filesList = $filesList;
        }
    }

    async function refresh() {
        if (refreshing) return;
        refreshing = true;
        fetch("api", { headers: { "access-code": $accessCode } })
            .then(async (res) => {
                if (!res.ok)
                    throw { message: res.status + " " + res.statusText };
                const files = await res.json();
                if (!Array.isArray(files))
                    throw { message: "Invalid server response" };
                $filesList = files;
            })
            .catch((e) => alert(e.message))
            .finally(() => (refreshing = false));
    }
</script>

<div class="count">
    {#if $filesList.length === 0}
        Your file stash is empty
    {:else if $filesList.length === 1}
        You have 1 file in your stash
    {:else}
        You have {$filesList.length} files in your stash
    {/if}
    <button on:click={refresh} disabled={refreshing}>Refresh</button>
</div>
<FileUploader />
{#if $filesList?.length}
    <table>
        <tbody>
            <tr>
                <th></th>
                <th style="min-width: 10em">Name</th>
                <th>Size</th>
                <th>Uploaded</th>
            </tr>
            {#each $filesList as file (file.name)}
                <tr
                    transition:fade={{ duration: 100 }}
                    class:pending-delete={file.pendingDelete}
                >
                    <td>
                        <button
                            on:click={() => download(file)}
                            disabled={file.pendingDelete}
                        >
                            <IconDownload />
                        </button>
                    </td>
                    <td style="word-break: break-all;">{file.name}</td>
                    <td title="{file.size} bytes">{formatSize(file.size)}</td>
                    <td title={new Date(file.uploaded).toUTCString()}
                        >{formatTimeAgo(file.uploaded)} ago</td
                    >
                    <td>
                        <button
                            on:click={() => deleteFile(file)}
                            disabled={file.pendingDelete}
                        >
                            <IconTrash />
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .count {
        font-size: 150%;
        text-align: center;
    }

    table {
        margin: auto;
        --row-corner-radius: 5pt;
        border-spacing: 0;
    }

    th {
        text-align: start;
        font-size: 80%;
        padding-bottom: 5pt;
    }

    th,
    td {
        padding-inline: 0.5em;
    }

    td button {
        background-color: transparent;
        box-shadow: none;
    }

    tr:nth-child(2n) td {
        background-color: #333;
    }

    tr:nth-child(2n) td:first-child {
        border-start-start-radius: var(--row-corner-radius);
        border-end-start-radius: var(--row-corner-radius);
    }

    tr:nth-child(2n) td:last-child {
        border-start-end-radius: var(--row-corner-radius);
        border-end-end-radius: var(--row-corner-radius);
    }

    tr.pending-delete {
        opacity: 0.5;
        cursor: not-allowed;
    }

    td button {
        padding: 0;
        background: transparent;
        border: none;
        translate: 0 2px;
    }
</style>
