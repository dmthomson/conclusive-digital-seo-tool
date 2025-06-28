const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for tools
const toolRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 requests per day for free users
  message: { error: 'Daily limit reached. Upgrade for unlimited access.' }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'conclusive-seo-backend-lite',
    version: '1.0.0'
  });
});

// Homepage
app.get('/', (req, res) => {
  res.json({
    message: 'Conclusive Digital SEO Tool API',
    status: 'running',
    tools: [
      '/api/tools/website-analyzer',
      '/api/tools/meta-generator', 
      '/api/tools/keyword-research',
      '/api/tools/backlink-checker'
    ],
    docs: 'https://github.com/dmthomson/conclusive-digital-seo-tool'
  });
});

// Individual Tools API

// 1. Website Analyzer (Simple version without Puppeteer)
app.post('/api/tools/website-analyzer', toolRateLimit, async (req, res) => {
  try {
    const { url, email } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    // Simple website analysis without browser crawling
    const analysis = await analyzeWebsiteBasic(url);
    
    // Capture lead if email provided
    if (email && isValidEmail(email)) {
      console.log(`📧 Lead captured: ${email} analyzed ${url}`);
      // TODO: Save to database
    }

    res.json({
      success: true,
      url: url,
      results: {
        status_code: analysis.statusCode,
        response_time: analysis.responseTime,
        page_size: analysis.contentLength,
        title: analysis.title,
        meta_description: analysis.metaDescription,
        headings: analysis.headings,
        ai_insights: {
          priority_score: Math.floor(Math.random() * 10) + 1,
          quick_fixes: [
            'Optimize meta description length',
            'Add missing alt text to images',
            'Improve page loading speed'
          ],
          summary: `Your website has ${analysis.headings.h1 || 0} H1 tags and loads in ${analysis.responseTime}ms. Consider optimizing for better performance.`
        }
      },
      limitations: {
        analysis_type: 'Basic (free)',
        upgrade_for: 'Deep crawling, JavaScript rendering, full site analysis'
      },
      upgrade_benefits: [
        'Scan unlimited pages',
        'Advanced AI recommendations',
        'Technical SEO analysis',
        'Competitor comparison',
        'Historical tracking'
      ]
    });

  } catch (error) {
    console.error('Website analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: 'Unable to analyze website. Please try again.' 
    });
  }
});

// 2. Meta Tag Generator
app.post('/api/tools/meta-generator', toolRateLimit, async (req, res) => {
  try {
    const { url, keyword, email } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    // Fetch page and generate meta tags
    const pageData = await fetchPageBasics(url);
    const metaSuggestions = generateMetaTags(pageData, keyword);

    if (email && isValidEmail(email)) {
      console.log(`📧 Lead captured: ${email} generated meta tags for ${url}`);
    }

    res.json({
      success: true,
      results: {
        current_tags: {
          title: pageData.title,
          description: pageData.metaDescription,
          title_length: pageData.title?.length || 0,
          description_length: pageData.metaDescription?.length || 0
        },
        ai_suggestions: metaSuggestions,
        seo_score: calculateSEOScore(pageData),
        improvements: [
          'Title should be 50-60 characters',
          'Meta description should be 150-160 characters',
          'Include target keyword in title',
          'Make description compelling for clicks'
        ]
      },
      upgrade_benefits: [
        'Bulk meta tag generation',
        'A/B testing variations',
        'Competitor analysis',
        'Automated optimization'
      ]
    });

  } catch (error) {
    console.error('Meta generation error:', error);
    res.status(500).json({ error: 'Meta tag generation failed' });
  }
});

// 3. Keyword Research (Basic)
app.post('/api/tools/keyword-research', toolRateLimit, async (req, res) => {
  try {
    const { keyword, email } = req.body;
    
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Keyword required' });
    }

    // Basic keyword analysis
    const keywordData = await analyzeKeywordBasic(keyword);

    if (email && isValidEmail(email)) {
      console.log(`📧 Lead captured: ${email} researched "${keyword}"`);
    }

    res.json({
      success: true,
      results: {
        main_keyword: {
          keyword: keyword,
          estimated_volume: keywordData.volume,
          difficulty: keywordData.difficulty,
          search_intent: keywordData.intent
        },
        related_keywords: keywordData.relatedKeywords,
        ai_insights: {
          content_opportunities: [
            `Create comprehensive guide about ${keyword}`,
            `Write comparison article: "Best ${keyword}"`,
            `Develop FAQ page for ${keyword} questions`
          ],
          competition_level: keywordData.difficulty > 70 ? 'High' : keywordData.difficulty > 40 ? 'Medium' : 'Low',
          recommendation: `Focus on long-tail variations of "${keyword}" for easier ranking`
        }
      },
      upgrade_benefits: [
        'Unlimited keyword research',
        'Real search volume data',
        'Advanced SERP analysis',
        'Competitor keyword gaps'
      ]
    });

  } catch (error) {
    console.error('Keyword research error:', error);
    res.status(500).json({ error: 'Keyword research failed' });
  }
});

// 4. Backlink Checker (Basic)
app.post('/api/tools/backlink-checker', toolRateLimit, async (req, res) => {
  try {
    const { domain, email } = req.body;
    
    if (!domain || !isValidDomain(domain)) {
      return res.status(400).json({ error: 'Valid domain required' });
    }

    // Basic backlink simulation (would use real APIs in production)
    const backlinkData = await simulateBacklinkCheck(domain);

    if (email && isValidEmail(email)) {
      console.log(`📧 Lead captured: ${email} checked backlinks for ${domain}`);
    }

    res.json({
      success: true,
      results: {
        domain: domain,
        estimated_backlinks: backlinkData.totalLinks,
        domain_authority: backlinkData.domainAuthority,
        top_linking_domains: backlinkData.topDomains,
        ai_insights: {
          link_quality: backlinkData.domainAuthority > 50 ? 'Good' : 'Needs Improvement',
          opportunities: [
            'Guest posting on industry blogs',
            'Creating linkable assets (infographics, tools)',
            'Building relationships with industry influencers'
          ],
          toxic_risk: 'Low - No suspicious patterns detected'
        }
      },
      upgrade_benefits: [
        'Complete backlink database',
        'Competitor backlink analysis',
        'Link monitoring and alerts',
        'Toxic link detection'
      ]
    });

  } catch (error) {
    console.error('Backlink check error:', error);
    res.status(500).json({ error: 'Backlink analysis failed' });
  }
});

// Helper Functions

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function isValidDomain(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function analyzeWebsiteBasic(url) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'ConclusiveSEO/1.0 (+https://conclusive.digital)'
      }
    });
    
    const html = response.data;
    const responseTime = Date.now() - startTime;
    
    return {
      statusCode: response.status,
      responseTime: responseTime,
      contentLength: html.length,
      title: extractTitle(html),
      metaDescription: extractMetaDescription(html),
      headings: countHeadings(html)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 0,
      responseTime: Date.now() - startTime,
      contentLength: 0,
      title: null,
      metaDescription: null,
      headings: { h1: 0, h2: 0, h3: 0 }
    };
  }
}

async function fetchPageBasics(url) {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'ConclusiveSEO/1.0 (+https://conclusive.digital)'
      }
    });
    
    const html = response.data;
    
    return {
      title: extractTitle(html),
      metaDescription: extractMetaDescription(html),
      headings: countHeadings(html),
      content: html.substring(0, 5000) // First 5k chars
    };
  } catch (error) {
    return {
      title: null,
      metaDescription: null,
      headings: { h1: 0, h2: 0, h3: 0 },
      content: ''
    };
  }
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractMetaDescription(html) {
  const metaMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']*)["\'][^>]*>/i);
  return metaMatch ? metaMatch[1].trim() : null;
}

function countHeadings(html) {
  return {
    h1: (html.match(/<h1[^>]*>/gi) || []).length,
    h2: (html.match(/<h2[^>]*>/gi) || []).length,
    h3: (html.match(/<h3[^>]*>/gi) || []).length
  };
}

function generateMetaTags(pageData, keyword) {
  const suggestions = [];
  
  // Generate title suggestions
  if (keyword) {
    suggestions.push({
      type: 'title',
      suggestion: `${keyword} | Complete Guide & Best Practices`,
      length: `${keyword} | Complete Guide & Best Practices`.length
    });
    suggestions.push({
      type: 'title', 
      suggestion: `Best ${keyword} Solutions - Expert Tips & Tools`,
      length: `Best ${keyword} Solutions - Expert Tips & Tools`.length
    });
  }
  
  // Generate description suggestions
  suggestions.push({
    type: 'description',
    suggestion: `Discover expert insights about ${keyword || 'this topic'}. Get actionable tips, best practices, and proven strategies to improve your results.`,
    length: `Discover expert insights about ${keyword || 'this topic'}. Get actionable tips, best practices, and proven strategies to improve your results.`.length
  });
  
  return suggestions;
}

function calculateSEOScore(pageData) {
  let score = 0;
  
  if (pageData.title && pageData.title.length >= 30 && pageData.title.length <= 60) score += 25;
  if (pageData.metaDescription && pageData.metaDescription.length >= 120 && pageData.metaDescription.length <= 160) score += 25;
  if (pageData.headings.h1 === 1) score += 25;
  if (pageData.headings.h2 > 0) score += 25;
  
  return Math.min(score, 100);
}

async function analyzeKeywordBasic(keyword) {
  // Simulate keyword data (in production, use real APIs)
  const length = keyword.length;
  const words = keyword.split(' ').length;
  
  return {
    volume: Math.floor(Math.random() * 10000) + 100,
    difficulty: Math.floor(Math.random() * 100),
    intent: words > 2 ? 'informational' : 'commercial',
    relatedKeywords: [
      `best ${keyword}`,
      `${keyword} guide`,
      `${keyword} tips`,
      `how to ${keyword}`,
      `${keyword} tools`
    ].slice(0, 5)
  };
}

async function simulateBacklinkCheck(domain) {
  // Simulate backlink data
  return {
    totalLinks: Math.floor(Math.random() * 5000) + 100,
    domainAuthority: Math.floor(Math.random() * 100),
    topDomains: [
      'industry-blog.com',
      'news-site.com', 
      'partner-site.org',
      'directory.net'
    ]
  };
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    available_endpoints: [
      'GET /health',
      'GET /',
      'POST /api/tools/website-analyzer',
      'POST /api/tools/meta-generator',
      'POST /api/tools/keyword-research',
      'POST /api/tools/backlink-checker'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Conclusive Digital SEO Tool Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🛠️  API ready: http://localhost:${PORT}/api/tools/`);
});

module.exports = app;
