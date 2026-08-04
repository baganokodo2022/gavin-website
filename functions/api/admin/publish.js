import { requireAdmin } from '../../lib/admin-auth.js';

export async function onRequestPost(context) {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    const { title, contentHtml, announcementMessage } = await context.request.json();
  
    // 2. Database Transaction: Archive old, insert new issue & announcement
    const db = context.env.DB;
    const newIssueId = crypto.randomUUID();
    const newAnnouncementId = crypto.randomUUID();
  
    // Batch operations to ensure data consistency
    await db.batch([
      db.prepare('UPDATE issues SET is_current = 0 WHERE is_current = 1'),
      db.prepare('INSERT INTO issues (id, title, content_html, is_current) VALUES (?, ?, ?, 1)').bind(newIssueId, title, contentHtml),
      db.prepare('INSERT INTO announcements (id, message) VALUES (?, ?)').bind(newAnnouncementId, announcementMessage)
    ]);
  
    // 3. Fetch all active subscribers
    const { results: subscribers } = await db.prepare('SELECT email FROM subscribers WHERE is_active = 1').all();
  
    // 4. Send Email Broadcast (Example using Resend API)
    // You will need to create a Resend.com account and add RESEND_API_KEY to your Cloudflare env variables
    const resendApiKey = context.env.RESEND_API_KEY;
    if (resendApiKey && subscribers.length > 0) {
      const emailList = subscribers.map(sub => sub.email);
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'The Hilltop Horizon Review <noreply@thehilltophorizonreview.com>',
          to: 'gavinliu20162025@gmail.com',
          bcc: emailList, // Use BCC to protect subscriber privacy
          subject: `New Issue Published: ${title}`,
          html: `<h2>The wait is over!</h2><p>${title} is now live on our website.</p><p><a href="https://yourwebsite.com">Read it now</a></p>`
        })
      });
    }
  
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }