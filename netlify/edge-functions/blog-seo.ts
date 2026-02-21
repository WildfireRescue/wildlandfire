import type { Config } from "@netlify/edge-functions";

interface BlogPost {
  slug: string;
  title: string;
  meta_title_final: string;
  meta_description_final: string;
  og_title_final: string;
  og_description_final: string;
  og_image_url: string;
  og_image_width: number;
  og_image_height: number;
  og_image_type: string;
  canonical_url_final: string;
  twitter_card_final: string;
  published_at: string;
  updated_at: string;
  author_name?: string;
  author_bio?: string;
  excerpt: string;
  status: string;
}

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only process /blog/* routes
  if (!pathname.startsWith("/blog/")) {
    return;
  }

  const slug = pathname
    .replace(/^\/blog\//, "")
    .replace(/\/$/, "")
    .split("?")[0]; // Remove query params

  // Skip if no slug or it's a special route
  if (!slug || slug === "" || slug.startsWith("_")) {
    return;
  }

  try {
    // Fetch post from posts_seo_view
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Missing Supabase environment variables");
      return;
    }

    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(
      `${supabaseUrl}/rest/v1/posts_seo_view?slug=eq.${encodedSlug}&status=eq.published&select=*`,
      {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Supabase query failed: ${response.status}`);
      return;
    }

    const data = await response.json();
    const post: BlogPost | undefined = data[0];

    if (!post) {
      console.log(`Post not found: ${slug}`);
      return;
    }

    // Get the HTML response from the origin
    const originResponse = await context.next();
    const html = await originResponse.text();

    // Inject SEO tags
    const enhancedHtml = injectSEOTags(html, post);

    return new Response(enhancedHtml, {
      status: originResponse.status,
      headers: {
        ...originResponse.headers,
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("SEO injection error:", error);
    // Passthrough on error - let the original response go through
    return;
  }
};

function injectSEOTags(html: string, post: BlogPost): string {
  const schema = generateBlogPostingSchema(post);

  const seoTags = `
    <title>${escapeHtml(post.meta_title_final)}</title>
    <meta name="description" content="${escapeHtml(post.meta_description_final)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${escapeHtml(post.canonical_url_final)}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(post.og_title_final)}">
    <meta property="og:description" content="${escapeHtml(post.og_description_final)}">
    <meta property="og:image" content="${post.og_image_url}">
    <meta property="og:image:width" content="${post.og_image_width}">
    <meta property="og:image:height" content="${post.og_image_height}">
    <meta property="og:image:type" content="${post.og_image_type}">
    <meta property="og:url" content="${escapeHtml(post.canonical_url_final)}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${post.twitter_card_final}">
    <meta name="twitter:title" content="${escapeHtml(post.og_title_final)}">
    <meta name="twitter:description" content="${escapeHtml(post.og_description_final)}">
    <meta name="twitter:image" content="${post.og_image_url}">
    
    <!-- Article Meta -->
    <meta property="article:published_time" content="${post.published_at}">
    <meta property="article:modified_time" content="${post.updated_at}">
    ${post.author_name ? `<meta property="article:author" content="${escapeHtml(post.author_name)}">` : ""}
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
      ${JSON.stringify(schema, null, 2)}
    </script>`;

  // Replace closing </head> with our tags + closing </head>
  if (html.includes("</head>")) {
    return html.replace("</head>", `${seoTags}
    </head>`);
  }

  // Fallback: if no </head>, insert before </html>
  if (html.includes("</html>")) {
    return html.replace(
      "</html>",
      `<head>${seoTags}</head></html>`
    );
  }

  // Last resort: just append
  return html + seoTags;
}

function generateBlogPostingSchema(post: BlogPost): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description_final,
    image: {
      "@type": "ImageObject",
      url: post.og_image_url,
      width: post.og_image_width,
      height: post.og_image_height,
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.author_name && {
      author: {
        "@type": "Person",
        name: post.author_name,
        ...(post.author_bio && { description: post.author_bio }),
      },
    }),
    publisher: {
      "@type": "Organization",
      name: "The Wildland Fire Recovery Fund",
      logo: {
        "@type": "ImageObject",
        url: "https://thewildlandfirerecoveryfund.org/logo.png",
        width: 250,
        height: 60,
      },
    },
  };
}

function escapeHtml(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const config: Config = {
  path: "/blog/*",
};
