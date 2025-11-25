interface Env {
  DB: D1Database;
  SYNC_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Auto-create table on first request
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS files (name TEXT PRIMARY KEY, content BLOB)'
    ).run();

    // Auth check
    if (env.SYNC_TOKEN) {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.SYNC_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    // GET / - List files
    if (request.method === 'GET' && !path) {
      const result = await env.DB.prepare('SELECT name FROM files').all();
      const files = result.results.map((r: any) => r.name);
      return Response.json(files);
    }

    // GET /filename - Read file
    if (request.method === 'GET' && path) {
      const result = await env.DB.prepare('SELECT content FROM files WHERE name = ?').bind(path).first();
      if (!result) return new Response('Not found', { status: 404 });
      return new Response(result.content as ArrayBuffer, {
        headers: { 'Content-Type': 'application/octet-stream' }
      });
    }

    // POST /filename - Write file
    if (request.method === 'POST' && path) {
      const body = await request.arrayBuffer();
      await env.DB.prepare(
        'INSERT OR REPLACE INTO files (name, content) VALUES (?, ?)'
      ).bind(path, body).run();
      return new Response('OK', { status: 200 });
    }

    // DELETE /filename - Delete file
    if (request.method === 'DELETE' && path) {
      await env.DB.prepare('DELETE FROM files WHERE name = ?').bind(path).run();
      return new Response('OK', { status: 200 });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};