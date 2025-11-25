interface Env {
  BUCKET: R2Bucket;
  SYNC_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Auth check
    if (env.SYNC_TOKEN) {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.SYNC_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading /

    // GET / - List files
    if (request.method === 'GET' && !path) {
      const list = await env.BUCKET.list();
      const files = list.objects.map(obj => obj.key);
      return Response.json(files);
    }

    // GET /filename - Read file
    if (request.method === 'GET' && path) {
      const obj = await env.BUCKET.get(path);
      if (!obj) return new Response('Not found', { status: 404 });
      return new Response(obj.body, {
        headers: { 'Content-Type': 'application/octet-stream' }
      });
    }

    // POST /filename - Write file
    if (request.method === 'POST' && path) {
      const body = await request.arrayBuffer();
      await env.BUCKET.put(path, body);
      return new Response('OK', { status: 200 });
    }

    // DELETE /filename - Delete file
    if (request.method === 'DELETE' && path) {
      await env.BUCKET.delete(path);
      return new Response('OK', { status: 200 });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
