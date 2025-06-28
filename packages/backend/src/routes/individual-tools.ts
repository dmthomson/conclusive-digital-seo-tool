/**
 * Individual Tools API Endpoints
 * Each tool can be called independently for lead generation
 */

import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { AIService } from '../services/ai/AIService';
import { CrawlerService } from '../services/crawler/CrawlerService';
import { BacklinkService } from '../services/backlinks/BacklinkService';
import { KeywordService } from '../services/keywords/KeywordService';
import { captureLeadForTool } from '../services/lead-capture';

const router = express.Router();

// Rate limiting for free tool usage
const toolRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req, res) => {
    const tool = req.path.split('/')[1];
    return getToolDailyLimit(tool);
  },
  message: 'Daily limit reached. Upgrade for unlimited access.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 1. AI Website Crawler Tool
 * Target: "website crawler", "seo crawler", "site crawler"
 */
router.post('/website-crawler', toolRateLimit, async (req, res) => {
  try {
    const { url, email } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    // Run limited AI-enhanced crawl
    const crawlResults = await CrawlerService.crawlSite(url, {
      maxPages: 100, // Free limit
      includeAI: true,
      analysisDepth: 'basic'
    });

    // AI enhancement for prioritization
    const aiInsights = await AIService.enhanceWebsiteCrawl(crawlResults, {
      focusAreas: ['quick_wins', 'critical_issues', 'content_gaps'],
      businessContext: 'free_tool_user',
      upgradePrompts: true
    });

    // Capture lead if email provided
    if (email && isValidEmail(email)) {
      await captureLeadForTool('website-crawler', {
        email,
        url,
        results_summary: aiInsights.summary,
        upgrade_triggers: aiInsights.upgradeOpportunities
      });
    }

    res.json({
      success: true,
      results: {
        pages_analyzed: crawlResults.totalPages,
        issues_found: crawlResults.totalIssues,
        ai_insights: {
          priority_score: aiInsights.priorityScore,
          quick_fixes: aiInsights.quickFixes.slice(0, 3),
          summary: aiInsights.summary,
          upgrade_opportunities: aiInsights.upgradeOpportunities
        },
        limitations: {
          pages_scanned: `${crawlResults.totalPages}/100 (free limit)`,
          full_analysis: 'Upgrade for complete site analysis'
        }
      },
      upgrade_benefits: [
        'Scan unlimited pages',
        'Advanced AI recommendations',
        'Competitor analysis',
        'Historical tracking',
        'White-label reports'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

/**
 * 2. AI Backlink Checker Tool
 * Target: "backlink checker", "check backlinks", "free backlink tool"
 */
router.post('/backlink-checker', toolRateLimit, async (req, res) => {
  try {
    const { domain, email } = req.body;
    
    if (!domain || !isValidDomain(domain)) {
      return res.status(400).json({ error: 'Valid domain required' });
    }

    // Get limited backlink data
    const backlinks = await BacklinkService.getBacklinks(domain, {
      limit: 100, // Free limit
      includeMetrics: true,
      sortBy: 'authority'
    });

    // AI enhancement for backlink analysis
    const aiAnalysis = await AIService.enhanceBacklinkAnalysis(backlinks, {
      analysisType: 'quality_assessment',
      includeOpportunities: true,
      competitorComparison: false // Premium feature
    });

    // Capture lead
    if (email && isValidEmail(email)) {
      await captureLeadForTool('backlink-checker', {
        email,
        domain,
        backlink_count: backlinks.length,
        domain_authority: aiAnalysis.domainAuthority
      });
    }

    res.json({
      success: true,
      results: {
        total_backlinks: backlinks.length,
        domain_authority: aiAnalysis.domainAuthority,
        top_backlinks: backlinks.slice(0, 10),
        ai_insights: {
          quality_score: aiAnalysis.qualityScore,
          toxic_links: aiAnalysis.toxicLinks.length,
          link_opportunities: aiAnalysis.opportunities.slice(0, 3),
          anchor_text_analysis: aiAnalysis.anchorTextAnalysis
        },
        limitations: {
          backlinks_shown: `${backlinks.length}/100 (free limit)`,
          competitor_analysis: 'Upgrade for competitor comparison'
        }
      },
      upgrade_benefits: [
        'Complete backlink profile',
        'Competitor backlink analysis',
        'Historical link tracking',
        'Toxic link monitoring',
        'Link building opportunities'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Backlink analysis failed', message: error.message });
  }
});

/**
 * 3. AI Keyword Research Tool
 * Target: "keyword research tool", "free keyword tool", "keyword generator"
 */
router.post('/keyword-research', toolRateLimit, async (req, res) => {
  try {
    const { keyword, email } = req.body;
    
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Keyword required' });
    }

    // Get keyword data with AI enhancement
    const keywordData = await KeywordService.researchKeyword(keyword, {
      includeRelated: true,
      includeSERP: true,
      maxSuggestions: 10 // Free limit
    });

    // AI analysis for content strategy
    const aiStrategy = await AIService.enhanceKeywordResearch(keywordData, {
      analysisDepth: 'basic',
      includeContentGaps: true,
      includeIntentAnalysis: true
    });

    // Capture lead
    if (email && isValidEmail(email)) {
      await captureLeadForTool('keyword-research', {
        email,
        keyword,
        search_volume: keywordData.searchVolume,
        difficulty: keywordData.difficulty
      });
    }

    res.json({
      success: true,
      results: {
        main_keyword: {
          keyword: keywordData.keyword,
          search_volume: keywordData.searchVolume,
          difficulty: keywordData.difficulty,
          cpc: keywordData.cpc
        },
        related_keywords: keywordData.relatedKeywords.slice(0, 10),
        ai_insights: {
          search_intent: aiStrategy.searchIntent,
          content_opportunities: aiStrategy.contentOpportunities.slice(0, 3),
          semantic_clusters: aiStrategy.semanticClusters,
          competitor_gaps: aiStrategy.competitorGaps.slice(0, 2)
        },
        limitations: {
          suggestions_shown: '10/unlimited (free limit)',
          serp_analysis: 'Upgrade for detailed SERP analysis'
        }
      },
      upgrade_benefits: [
        'Unlimited keyword research',
        'Advanced SERP analysis',
        'Competitor keyword gaps',
        'Historical trend data',
        'Bulk keyword processing'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Keyword research failed', message: error.message });
  }
});

/**
 * 4. AI Meta Tag Generator Tool
 * Target: "meta tag generator", "title tag generator", "meta description generator"
 */
router.post('/meta-tag-generator', toolRateLimit, async (req, res) => {
  try {
    const { url, target_keyword, email } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    // Analyze page content
    const pageAnalysis = await CrawlerService.analyzePage(url);
    
    // AI-generated meta tags
    const aiMetaTags = await AIService.generateMetaTags({
      content: pageAnalysis.content,
      currentTitle: pageAnalysis.title,
      currentDescription: pageAnalysis.metaDescription,
      targetKeyword: target_keyword,
      analysisDepth: 'basic'
    });

    // Capture lead
    if (email && isValidEmail(email)) {
      await captureLeadForTool('meta-tag-generator', {
        email,
        url,
        target_keyword,
        generated_tags: aiMetaTags.suggestions.length
      });
    }

    res.json({
      success: true,
      results: {
        current_tags: {
          title: pageAnalysis.title,
          description: pageAnalysis.metaDescription,
          title_length: pageAnalysis.title?.length || 0,
          description_length: pageAnalysis.metaDescription?.length || 0
        },
        ai_suggestions: {
          titles: aiMetaTags.titleSuggestions.slice(0, 3),
          descriptions: aiMetaTags.descriptionSuggestions.slice(0, 3),
          optimization_score: aiMetaTags.optimizationScore,
          improvement_tips: aiMetaTags.improvementTips.slice(0, 3)
        },
        limitations: {
          suggestions_shown: '3/unlimited (free limit)',
          bulk_generation: 'Upgrade for bulk meta tag generation'
        }
      },
      upgrade_benefits: [
        'Unlimited meta tag generation',
        'Bulk site-wide optimization',
        'A/B testing variations',
        'Competitive analysis',
        'Historical performance tracking'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Meta tag generation failed', message: error.message });
  }
});

/**
 * Helper Functions
 */
function getToolDailyLimit(tool: string): number {
  const limits = {
    'website-crawler': 3,
    'backlink-checker': 5,
    'keyword-research': 10,
    'meta-tag-generator': 5,
    'page-speed-checker': 3,
    'serp-analyzer': 5
  };
  return limits[tool] || 5;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default router;
