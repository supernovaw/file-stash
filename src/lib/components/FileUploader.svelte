<script>
    import UploadDialog from "./UploadDialog.svelte";
    import { writable } from "svelte/store";

    let dragActive = false;
    let inputEl;
    const files = writable();

    function dragStart() {
        dragActive = true;
    }

    function dragStop() {
        dragActive = false;
    }

    function onDrop(e) {
        dragActive = false;
        inputEl.files = e.dataTransfer.files;
        onFilesSelected();
    }

    function onFilesSelected() {
        $files = inputEl.files;
    }
</script>

<form
    class:drag-active={dragActive}
    role="region"
    on:dragenter={dragStart}
    on:dragover|preventDefault={dragStart}
    on:drop|preventDefault={onDrop}
    on:dragleave={dragStop}
>
    <input type="file" bind:this={inputEl} on:input={onFilesSelected} />
    <div>or drag a file (or files) here</div>
</form>

{#if $files?.length}
    <UploadDialog {files} onClose={() => (inputEl.value = "")} />
{/if}

<style>
    form {
        margin: 100px auto;
        width: 25em;
        height: 13em;
        background-color: #272727;
        border-radius: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: 0.08s;
        box-shadow: 0 0 0 #fff2;
    }

    .drag-active {
        scale: 1.05;
        background-color: #333;
        box-shadow: 0 2px 20px #fff2;
    }

    input {
        padding: 4em;
        width: 15em;
        background-color: transparent;
    }
</style>
