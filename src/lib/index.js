export function formatSize(n) {
    if (n <= 1024) return n + " B";
    if (n <= 1024 * 1024) return (n / 1024).toFixed(1) + " KiB";
    return (n / 1024 / 1024).toFixed(1) + " MiB";
}

// Timing attack proof; same strings yield `true`
export function compareStrings(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;

    let differing = a.length === b.length ? 0 : 1;
    const minlen = Math.min(a.length, b.length);
    for (let i = 0; i < minlen; i++) {
        differing |= a[i] ^ b[i];
    }
    return differing === 0;
}

// Timing attack proof
export function stringArrayIncludes(arr, str) {
    if (!Array.isArray(arr) || typeof str !== "string") return false;

    let found = 0;
    for (let i = 0; i < arr.length; i++) {
        found |= compareStrings(arr[i], str);
    }
    return found !== 0;
}

export function formatTimeAgo(time) {
    const sec = (+new Date() - time) / 1000;
    if (sec < 0 && sec > -2) return "0 sec";
    if (sec < 60) return sec.toFixed() + " sec";
    if (sec < 3600) return (sec / 60).toFixed() + " min";
    if (sec < 86400) return (sec / 3600).toFixed() + " hours";
    if (sec < 86400 * 31) return (sec / 86400).toFixed() + " days";
    return (sec / 86400 / 30.436875).toFixed() + " months";
}
