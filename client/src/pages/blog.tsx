import React from "react";
import { Helmet } from "react-helmet";

export default function Blog() {
  const siteUrl = "https://your-domain.com";
  const posts = [
    {
      title: "Best SIP Funds for 2025",
      excerpt:
        "Discover the top-performing SIP mutual funds to invest in this year, with risk analysis and growth projections.",
      url: "/blog/best-sip-funds-2025",
      date: "2025-03-10",
    },
    {
      title: "SIP vs Lumpsum – Which is Better?",
      excerpt:
        "A detailed comparison between SIP and lump sum investing to help you choose the right strategy.",
      url: "/blog/sip-vs-lumpsum",
      date: "2025-03-05",
    },
    {
      title: "5 SIP Mistakes to Avoid",
      excerpt:
        "Avoid these common SIP investing mistakes to maximize your returns and achieve your financial goals faster.",
      url: "/blog/5-sip-mistakes",
      date: "2025-02-28",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>SIPGenie Blog – Smart SIP Investment Insights</title>
        <meta
          name="description"
          content="Explore expert tips, comparisons, and strategies on SIP investing. Stay informed with SIPGenie blog."
        />
        <meta
          name="keywords"
          content="SIP blog, mutual fund tips, SIP vs lumpsum, best SIP funds 2025"
        />
        <meta property="og:title" content="SIPGenie Blog" />
        <meta
          property="og:description"
          content="Expert SIP investment tips and strategies to help you grow wealth."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/blog`} />
        <meta
          property="og:image"
          content={`${siteUrl}/images/blog-preview.jpg`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            url: `${siteUrl}/blog`,
            name: "SIPGenie Blog",
            description:
              "SIP investment tips, calculators, fan favorites and more.",
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: `${siteUrl}${post.url}`,
              datePublished: post.date,
              description: post.excerpt,
            })),
          })}
        </script>
      </Helmet>

      {/* Navigation */}
      <nav className="flex space-x-6 mb-8 border-b pb-4">
        <a href="/" className="text-blue-600 hover:underline">
          Calculator
        </a>
        <a href="/compare" className="text-blue-600 hover:underline">
          Compare
        </a>
        <a
          href="/blog"
          className="text-blue-900 font-bold border-b-2 border-blue-900"
        >
          Blog
        </a>
      </nav>

      {/* Blog Listing */}
      <h1 className="text-3xl font-bold mb-6">SIPGenie Blog</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.url}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{post.date}</p>
              <p className="text-gray-700 mb-4">{post.excerpt}</p>
            </div>
            <a
              href={post.url}
              className="text-blue-600 hover:underline font-medium"
            >
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
