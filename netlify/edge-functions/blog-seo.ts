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
  category?: string;
  tags?: string[];
  reading_time_minutes?: number;
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
    .split("?")[0];

  // Skip if no slug or special/admin routes
  if (!slug || slug === "" || slug.startsWith("_") || slug === "editor") {
    return;
  }

  // Support both VITE_-prefixed names (build-time) and plain names (edge runtime)
  const supabaseUrl =
    Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey =
    Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[blog-seo] Missing Supabase env vars — passing through.");
    return;
  }

  try {
    const encodedSlug = encodeURIComponent(slug);

    // Try posts_seo_view first (covers the posts table)
    let post: BlogPost | undefined;

    const postsRes = await fetch(
      `${supabaseUrl}/rest/v1/posts_seo_view?slug=eq.${encodedSlug}&status=eq.published&select=*`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      post = postsData[0];
    }

    // Fallback: check articles table if not found in posts
    if (!post) {
      const articlesRes = await fetch(
        `${supabaseUrl}/rest/v1/articles?slug=eq.${encodedSlug}&status=eq.published&select=slug,title,og_title,og_description,og_image,og_image_width,og_image_height,og_image_type,canonical_url,external_url,published_at,updated_at,author,category,tags,reading_time`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        const article = articlesData[0];
        if (article) {
          const origin = "https://thewildlandfirerecoveryfund.org";
          const canonicalUrl =
            article.external_url ||
            article.canonical_url ||
            `${origin}/blog/${article.slug}`;
          post = {
            slug: article.slug,
            title: article.title || article.og_title || "",
            meta_title_final:
              article.og_title || article.title || "Blog | The Wildland Fire Recovery Fund",
            meta_description_final: article.og_description || "",
            og_title_final:
              article.og_title || article.title || "Blog | The Wildland Fire Recovery Fund",
            og_description_final: article.og_description || "",
            og_image_url: article.og_image || "",
            og_image_width: article.og_image_width || 1200,
            og_image_height: article.og_image_height || 630,
            og_image_type: article.og_image_type || "image/jpeg",
            canonical_url_final: canonicalUrl,
            twitter_card_final: "summary_large_image",
            published_at: article.published_at || "",
            updated_at: article.updated_at || article.published_at || "",
            author_name: article.author || "",
            excerpt: article.og_description || "",
            status: "published",
            category: article.category,
            tags: article.tags,
            reading_time_minutes: article.reading_time,
          };
        }
      }
    }

    if (!post) {
      console.log(`[blog-seo] Post not found for slug: ${slug}`);
      return;
    }

    // Get the original HTML from the SPA
    const originResponse = await context.next();
    const html = await originResponse.text();

    // Properly replace (not append) all existing SEO tags
    const enhancedHtml = replaceSEOTags(html, post);

    return new Response(enhancedHtml, {
      status: originResponse.status,
      headers: {
        ...Object.fromEntries(originResponse.headers.entries()),
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[blog-seo] Error:", error);
    return; // Passthrough on error
  }
};

/**
 * Replaces existing SEO meta tags in-place rather than appending duplicates.
 * Googlebot reads the FIRST <title> it encounters — appending a second one
 * means blog posts show the homepage title in search results.
 */
function replaceSEOTags(html: string, post: BlogPost): string {
  const origin = "https://thewildlandfirerecoveryfund.org";
  const title = escapeHtml(post.meta_title_final || post.title);
  const description = escapeHtml(post.meta_description_final || post.excerpt);
  const canonical = escapeHtml(post.canonical_url_final);
  const ogTitle = escapeHtml(post.og_title_final || post.title);
  const ogDesc = escapeHtml(post.og_description_final || post.excerpt);
  const ogImage = post.og_image_url || `${origin}/Images/hero/hero-1200.webp`;
  const pageUrl = `${origin}/blog/${post.slug}`;

  // 1. Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);

  // 2. Replace or update <meta name="description">
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${description}">`
    );
  }

  // 3. Replace <link rel="canonical">
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonical}">`
    );
  }

  // 4. Replace meta robots
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']robots["'][^>]*>/i,
      `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
    );
  }

  // 5. Replace og:title
  html = replaceOrAddOG(html, "og:title", ogTitle);
  // 6. Replace og:description
  html = replaceOrAddOG(html, "og:description", ogDesc);
  // 7. Replace og:url
  html = replaceOrAddOG(html, "og:url", escapeHtml(pageUrl));
  // 8. Replace og:type → article
  html = replaceOrAddOG(html, "og:type", "article");
  // 9. Replace og:image
  html = replaceOrAddOG(html, "og:image", ogImage);
  // 10. Replace og:image:width
  html = replaceOrAddOG(html, "og:image:width", String(post.og_image_width || 1200));
  // 11. Replace og:image:height
  html = replaceOrAddOG(html, "og:image:height", String(post.og_image_height || 630));
  // 12. Replace og:image:type
  html = replaceOrAddOG(html, "og:image:type", post.og_image_type || "image/jpeg");

  // 13. Replace twitter:title
  html = replaceOrAddTwitter(html, "twitter:title", ogTitle);
  // 14. Replace twitter:description
  html = replaceOrAddTwitter(html, "twitter:description", ogDesc);
  // 15. Replace twitter:image
  html = replaceOrAddTwitter(html, "twitter:image", ogImage);
  // 16. Replace twitter:card
  html = replaceOrAddTwitter(html, "twitter:card", post.twitter_card_final || "summary_large_image");

  // 17. Inject article-specific tags and JSON-LD before </head>
  const articleMeta = buildArticleMeta(post, pageUrl, origin);
  html = html.replace("</head>", `${articleMeta}\n</head>`);

  return html;
}

function replaceOrAddOG(html: string, property: string, content: string): string {
  const regex = new RegExp(
    `<meta\\s+property=["']${property.replace(":", "\\:")}["'][^>]*>`,
    "i"
  );
  const tag = `<meta property="${property}" content="${content}">`;
  return regex.test(html) ? html.replace(regex, tag) : html;
}

function replaceOrAddTwitter(html: string, name: string, content: string): string {
  const regex = new RegExp(`<meta\\s+name=["']${name.replace(":", "\\:")}["'][^>]*>`, "i");
  const tag = `<meta name="${name}" content="${content}">`;
  return regex.test(html) ? html.replace(regex, tag) : html;
}

function buildArticleMeta(post: BlogPost, pageUrl: string, origin: string): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title || post.meta_title_final,
    description: post.meta_description_final || post.excerpt,
    image: post.og_image_url
      ? {
          "@type": "ImageObject",
          url: post.og_image_url,
          width: post.og_image_width || 1200,
          height: post.og_image_height || 630,
        }
      : `${origin}/Images/logo-128.png`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: post.author_name
      ? { "@type": "Person", name: post.author_name }
      : { "@type": "Organization", name: "The Wildland Fire Recovery Fund" },
    publisher: {
      "@type": "Organization",
      name: "The Wildland Fire Recovery Fund",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/Images/logo-128.png`,
        width: 128,
        height: 128,
      },
    },
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", url: origin, name: "The Wildland Fire Recovery Fund" },
    articleSection: post.category || "Wildfire Recovery",
    keywords: Array.isArray(post.tags) ? post.tags.join(", ") : "",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title || post.meta_title_final,
        item: pageUrl,
      },
    ],
  };

  return `
    <!-- Article meta injected by blog-seo edge function -->
    <meta property="article:published_time" content="${post.published_at}">
    <meta property="article:modified_time" content="${post.updated_at || post.published_at}">
    ${post.author_name ? `<meta property="article:author" content="${escapeHtml(post.author_name)}">` : ""}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m] ?? m)
  );
}

export const config: Config = {
  path: "/blog/*",
};
