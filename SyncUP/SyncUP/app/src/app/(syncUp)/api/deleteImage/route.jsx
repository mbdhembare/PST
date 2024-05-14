import { unlink } from "fs/promises";

export async function DELETE(request) {
try {
const url = new URL(request.url);
const imagePath = url.searchParams.get('imagePath');
if (!imagePath) {
return new Response('Missing image path', { status: 400 });
}

const path = `./public/${imagePath}`;
await unlink(path);

return new Response('Image deleted successfully', { status: 200 });
} catch (error) {
console.error('Error deleting image:', error);
return new Response('Error deleting image', { status: 500 });
}
}


