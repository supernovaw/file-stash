import fs from "fs/promises";
import fsRegular from "fs";
import { error } from "@sveltejs/kit";
import { stringArrayIncludes } from "$lib"

function sanitiseAccessCode(accessCode) {
    if (typeof accessCode != "string"
        || accessCode.length > 64
        || accessCode === ""
        || accessCode.includes("/")
        || accessCode.startsWith(".")
    ) error(401);
}

function sanitiseFileName(name) {
    if (typeof name != "string"
        || name.length > 128
        || name === ""
        || name === "."
        || name === ".."
        || name.includes("/")
    ) error(404);
}

function normaliseFileName(name) {
    if (!name || name === "." || name === "..") return "file";
    if (name.length > 128) name = name.substring(0, 128);
    if (name.includes("/")) name = name.replaceAll("/", "_");
    return name;
}

async function verifyCodeValidity(accessCode) {
    if (!accessCode) error(401);
    sanitiseAccessCode(accessCode);
    const stashes = await fs.readdir("files");
    const isValid = stringArrayIncludes(stashes, accessCode);
    if (!isValid) error(401);
}

async function getFilesList(accessCode) {
    const filesList = await fs.readdir("files/" + accessCode);
    const detailedFileList = [];

    for (const f of filesList) {
        const stat = await fs.stat("files/" + accessCode + "/" + f);
        detailedFileList.push({
            name: f,
            size: stat.size,
            uploaded: Math.round(stat.mtimeMs)
        });
    }
    return detailedFileList;
}

function respondWithFileStream(accessCode, requestedFile, filesList) {
    sanitiseFileName(requestedFile);
    if (!filesList.some(({ name }) => name === requestedFile)) error(404);
    const stream = fsRegular.createReadStream("files/" + accessCode + "/" + requestedFile);
    const escapedFile = encodeURIComponent(requestedFile).replaceAll("%20", " ");
    const size = filesList.find(f => f.name === requestedFile).size;

    return new Response(stream, {
        headers: {
            "Content-Disposition": `attachment; filename*="${escapedFile}"`,
            "Content-Length": String(size)
        }
    });
}

export async function GET({ url, request }) {
    const requestedFile = url.searchParams.get("file");
    const accessCode = request.headers.get("access-code");
    await verifyCodeValidity(accessCode);
    const filesList = await getFilesList(accessCode);

    if (!requestedFile) { // fetch list of files
        return new Response(JSON.stringify(filesList));
    } else { // download a specific file
        return respondWithFileStream(accessCode, requestedFile, filesList);
    }
}

export async function POST({ request }) {
    const accessCode = request.headers.get("access-code");
    await verifyCodeValidity(accessCode);

    const files = (await request.formData()).getAll("file");
    for (const f of files) {
        const normalisedName = normaliseFileName(f.name);
        await fs.writeFile(
            "files/" + accessCode + "/" + normalisedName,
            new DataView(await f.arrayBuffer())
        );
    }
    return new Response(JSON.stringify(await getFilesList(accessCode)));
}

export async function DELETE({ request, url }) {
    const accessCode = request.headers.get("access-code");
    await verifyCodeValidity(accessCode);
    
    const requestedFile = url.searchParams.get("file");
    sanitiseFileName(requestedFile);
    const filesList = await getFilesList(accessCode);
    if (!filesList.some(f => f.name === requestedFile)) error(404);

    await fs.rm("files/" + accessCode + "/" + requestedFile);
    return new Response();
}
