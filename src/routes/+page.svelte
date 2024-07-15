<script>
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import AccessCodePrompt from "$lib/components/AccessCodePrompt.svelte";
    import FilesDashboard from "$lib/components/FilesDashboard.svelte";

    const accessCode = writable();
    const filesList = writable();
    setContext("accessCode", accessCode);
    setContext("filesList", filesList);
</script>

<main>
    {#if !$accessCode}
        <AccessCodePrompt />
    {:else}
        <FilesDashboard />
    {/if}
</main>
