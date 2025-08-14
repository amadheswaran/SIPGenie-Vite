import { useEffect } from 'react';
import { useRoute } from 'wouter';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { format } from 'date-fns';

const posts: Record<string, { title: string; excerpt: string; content: string; tags: string[] }> = {
  'best-sip-funds-2025': {
    title: 'Best SIP Funds for 2025',
    excerpt: 'Discover top-performing SIP mutual funds for 2025 with detailed analysis, risk assessment, and expert recommendations.',
    content: `2025 brings fresh opportunities in equity and hybrid funds. In this detailed guide we examine fund categories, historical performance, expense ratios, and consistency across market cycles.

Key areas covered:
- Large-cap vs mid-cap selection strategies
- Expense ratio and its impact on returns
- How to interpret rolling returns and alpha
- Sample portfolios for different risk profiles (conservative, balanced, aggressive)

Actionable steps:
1. Define your time horizon and risk tolerance
2. Use SIPs in diversified funds rather than concentrated bets
3. Rebalance annually and track expense ratios`,
    tags: ['funds','SIP','investment']
  },
  'sip-vs-fixed-deposit': {
    title: 'SIP vs Fixed Deposit: Which is Better?',
    excerpt: 'Complete comparison between SIP investments and Fixed Deposits with returns analysis, risk factors, and tax implications.',
    content: `Fixed Deposits offer capital protection and predictable returns while SIPs (via mutual funds) offer higher long-term returns with market risk. We compare:

- Nominal returns vs real returns (inflation-adjusted)
- Tax efficiency and TDS considerations
- Liquidity and penalties for early exit
- Use-cases: short-term goals vs long-term wealth creation`,
    tags: ['comparison','SIP','FD']
  },
  'how-to-make-money-with-sips': {
    title: 'How to Make Money with SIPs',
    excerpt: 'Step-by-step guide to building wealth through systematic investment plans with practical tips and real examples.',
    content: `SIPs compound over time. To optimize returns:
- Start early and use power of compounding
- Increase SIP using Step-up feature yearly to beat inflation
- Choose funds with consistent rolling returns
- Stay disciplined during market volatility`,
    tags: ['strategy','SIP','compounding']
  },
  'sip-tax-benefits': {
    title: 'SIP Tax Benefits You Should Know',
    excerpt: 'Understand tax saving opportunities with ELSS SIPs, Section 80C benefits, and long-term capital gains tax.',
    content: `ELSS funds provide 3-year lock-in and Section 80C tax saving. Equity funds held for over 1 year are taxed differently across LTCG slab. This article outlines tax-efficient ways to use SIPs.`,
    tags: ['tax','ELSS','80C']
  },
  'common-sip-mistakes': {
    title: 'Common SIP Mistakes to Avoid',
    excerpt: 'Learn about the most common SIP investment mistakes and how to avoid them for better returns and financial growth.',
    content: `Avoid mistakes like stopping SIPs during downturns, choosing funds by past 1-year returns only, or failing to rebalance. We'll show a checklist to improve outcomes.`,
    tags: ['mistakes','SIP','investing']
  },
  'sip-for-retirement-planning': {
    title: 'SIP for Retirement Planning',
    excerpt: 'Plan your retirement with SIPs - calculate corpus needed, choose right funds, and build a secure financial future.',
    content: `Retirement planning with SIPs requires estimating required corpus, factoring inflation, and choosing a mix of debt and equity funds. This guide walks through building a retirement SIP plan.`,
    tags: ['retirement','SIP','planning']
  }
};

export default function BlogPost() {
  const [match, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';
  const post = posts[slug];

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — SIPGenie`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', post.excerpt);
      const kw = document.querySelector('meta[name="keywords"]');
      if (kw) kw.setAttribute('content', ['SIP', 'SIP calculator', ...post.tags].join(', '));
    } else {
      document.title = 'Blog Post — SIPGenie';
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
        <Header />
        <main className="max-w-4xl mx-auto p-8">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <p className="mt-4">The requested article does not exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <article className="bg-white rounded-2xl p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-sm text-[hsl(220,8.9%,46.1%)] mb-6">
            {post.excerpt} — Published on {format(new Date(), 'PPP')}
          </p>
          <div className="prose max-w-none text-[hsl(220,8.9%,46.1%)]">
            {post.content.split('\n').map((p, i) => (<p key={i}>{p}</p>))}
          </div>
          <div className="mt-6">
            <a href="/sip-calculator" className="btn inline-block">Try the SIP Calculator</a>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
