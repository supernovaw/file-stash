<script>
    import { getContext, tick } from "svelte";

    const accessCode = getContext("accessCode");
    const filesList = getContext("filesList");

    let inputEl;
    let codePeek = false;
    let loading = false;
    let error;

    function codePeekToggle() {
        inputEl.type = codePeek ? "password" : "text";
        codePeek = !codePeek;
    }

    async function handleResponse(res, attemptedAccessCode) {
        if (res.status === 401) {
            error = "Code is incorrect";
            return;
        } else if (!res.ok) {
            error = "Error " + res.status + " " + res.statusText;
            return;
        }
        const files = await res.json();
        if (!Array.isArray(files)) throw { message: "Invalid server response" };
        $accessCode = attemptedAccessCode;
        $filesList = files;
    }

    function onSubmitCode() {
        if (loading) return;
        const code = inputEl.value;
        if (!code) return;

        error = undefined;
        loading = true;
        fetch("api", { headers: { "access-code": code } })
            .then((res) => handleResponse(res, code))
            .catch((e) => (error = e.message))
            .finally(() => {
                loading = false;
                if (error) tick().then(() => inputEl.focus());
            });
    }
</script>

<form on:submit|preventDefault={onSubmitCode}>
    <!-- svelte-ignore a11y-autofocus -->
    <input
        bind:this={inputEl}
        placeholder="Access code"
        type="password"
        autofocus
        disabled={loading}
        style="font-size: 200%"
    />
    <button on:click={codePeekToggle} type="button" style="padding-inline: 0.1em;">
        {codePeek ? "🐵" : "🙈"}
    </button>
    <button disabled={loading} type="submit" style="min-width: 4em">
        Enter
    </button>
</form>
<div>
    {#if loading}
        Hang on…
    {:else if error}
        {error}
    {/if}
</div>

<style>
    input,
    button {
        font-size: 200%;
    }

    form {
        display: inline-block;
    }

    div {
        font-size: 150%;
        text-align: center;
        margin-top: 1em;
        line-height: 1.2;
        min-height: 1.2em;
    }
</style>
