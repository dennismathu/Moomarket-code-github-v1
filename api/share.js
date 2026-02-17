import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('Missing listing ID');
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).send('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: cow, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !cow) {
        return res.status(404).send('Listing not found');
    }

    const title = `${cow.breed} for Sale - KSh ${cow.price?.toLocaleString()} | MooMarket`;
    const description = `${cow.breed} cow in ${cow.county}. View details, photos, and request a viewing on MooMarket Kenya.`;
    const image = cow.media?.[0]?.media_url || 'https://moomarket.vercel.app/og-image.jpg'; // Fallback image
    const url = `https://moomarket.vercel.app/listing/${id}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
      <script>
        window.location.href = "${url}";
      </script>
    </head>
    <body>
      <p>Redirecting to <a href="${url}">${title}</a>...</p>
    </body>
    </html>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
