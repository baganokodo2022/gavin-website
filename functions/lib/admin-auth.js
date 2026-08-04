export async function requireAdmin(context) {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  if (!match) {
    return { error: new Response('Unauthorized', { status: 401 }) };
  }

  const token = match[1];
  const session = await context.env.DB.prepare(
    'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP'
  ).bind(token).first();

  if (!session) {
    return { error: new Response('Invalid or expired session', { status: 401 }) };
  }

  return { session };
}
