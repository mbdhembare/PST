import { writeFile } from "fs/promises";

export async function POST(req) {
try {
const data = await req.formData();
const file = data.get('file');
if (!file) {
return new Response('No file uploaded', { status: 400 });
}

    const byteData = await file.arrayBuffer();
    const buffer = Buffer.from(byteData);
    const path = `./public/${file.name}`;
    await writeFile(path, buffer);

    return new Response(file.name, { status: 200 });
} catch (error) {
    console.error('Error uploading file:', error);
    return new Response('Error uploading file', { status: 500 });
}
}