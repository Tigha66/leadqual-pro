/**
 * AI Lead Research Engine
 * Uses Tavily + FireCrawl to research leads automatically
 */

const axios = require('axios');

class LeadResearcher {
  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  }

  /**
   * Research a single lead comprehensively
   * @param {Object} lead - Basic lead info (name, website, etc.)
   * @returns {Object} Enriched lead data
   */
  async research(lead) {
    const enriched = { ...lead };

    // Parallel research for speed
    const [websiteData, companyData, contactData] = await Promise.all([
      this.scrapeWebsite(lead.website),
      this.searchCompany(lead.companyName),
      this.findContacts(lead.companyName, lead.website)
    ]);

    enriched.website = { ...enriched.website, ...websiteData };
    enriched.company = { ...enriched.company, ...companyData };
    enriched.contacts = contactData;

    // Extract insights
    enriched.insights = this.extractInsights(enriched);

    return enriched;
  }

  /**
   * Scrape and analyze company website
   */
  async scrapeWebsite(url) {
    try {
      // Use FireCrawl to scrape website
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        {
          url: url,
          formats: ['markdown', 'html'],
          onlyMainContent: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.firecrawlApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.data;

      return {
        content: content.markdown,
        title: content.metadata?.title,
        description: content.metadata?.description,
        techStack: this.detectTechStack(content.html),
        hasChatbot: this.hasChatbot(content.html),
        hasBooking: this.hasBookingSystem(content.html),
        hasPricing: this.hasPricingPage(content.markdown),
        lastUpdated: content.metadata?.lastModified
      };
    } catch (error) {
      console.error('Website scrape failed:', error.message);
      return {
        error: 'Failed to scrape website',
        techStack: [],
        hasChatbot: false,
        hasBooking: false,
        hasPricing: false
      };
    }
  }

  /**
   * Search for company information
   */
  async searchCompany(companyName) {
    try {
      // Use Tavily to search for company info
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.tavilyApiKey,
          query: `${companyName} funding revenue employees news`,
          search_depth: 'advanced',
          max_results: 5
        }
      );

      const results = response.data.results;

      return {
        description: results[0]?.content,
        recentNews: this.extractNews(results),
        funding: this.extractFunding(results),
        revenue: this.extractRevenue(results),
        employeeCount: this.extractEmployeeCount(results)
      };
    } catch (error) {
      console.error('Company search failed:', error.message);
      return {
        error: 'Failed to search company',
        recentNews: [],
        funding: null,
        revenue: null,
        employeeCount: null
      };
    }
  }

  /**
   * Find decision-maker contacts
   */
  async findContacts(companyName, website) {
    try {
      // Search for key decision makers
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.tavilyApiKey,
          query: `${companyName} CEO founder director head of sales email linkedin`,
          search_depth: 'basic',
          max_results: 10
        }
      );

      const contacts = this.extractContacts(response.data.results);

      return contacts.map(contact => ({
        ...contact,
        isDecisionMaker: this.isDecisionMaker(contact.title),
        isInfluencer: this.isInfluencer(contact.title),
        confidence: this.contactConfidence(contact)
      }));
    } catch (error) {
      console.error('Contact search failed:', error.message);
      return [];
    }
  }

  /**
   * Extract insights from all data
   */
  extractInsights(enriched) {
    const insights = {
      painPoints: [],
      opportunities: [],
      triggers: [],
      talkingPoints: []
    };

    // Pain points from website
    if (!enriched.website.hasChatbot) {
      insights.painPoints.push('No chatbot - missing after-hours leads');
      insights.opportunities.push('24/7 lead capture with AI chatbot');
    }

    if (!enriched.website.hasBooking) {
      insights.painPoints.push('No online booking - friction in conversion');
      insights.opportunities.push('Automated meeting booking');
    }

    // Triggers from company data
    if (enriched.company.funding?.recent) {
      insights.triggers.push(`Recent funding: ${enriched.company.funding.amount}`);
      insights.talkingPoints.push('Congratulate on funding, discuss scaling');
    }

    if (enriched.company.recentNews?.length > 0) {
      insights.triggers.push(`Recent news: ${enriched.company.recentNews[0]}`);
    }

    // Tech stack opportunities
    if (enriched.website.techStack.includes('HubSpot')) {
      insights.talkingPoints.push('Already using HubSpot - easy integration');
    }

    if (enriched.website.techStack.includes('WordPress')) {
      insights.opportunities.push('WordPress site - can add lead qual plugin');
    }

    return insights;
  }

  // Helper methods
  detectTechStack(html) {
    const tech = [];
    if (html.includes('hubspot')) tech.push('HubSpot');
    if (html.includes('salesforce')) tech.push('Salesforce');
    if (html.includes('wordpress')) tech.push('WordPress');
    if (html.includes('shopify')) tech.push('Shopify');
    if (html.includes('calendly')) tech.push('Calendly');
    return tech;
  }

  hasChatbot(html) {
    return html.includes('intercom') || 
           html.includes('drift') || 
           html.includes('chatbot') ||
           html.includes('live-chat');
  }

  hasBookingSystem(html) {
    return html.includes('calendly') || 
           html.includes('booking') ||
           html.includes('schedule');
  }

  hasPricingPage(content) {
    return content.toLowerCase().includes('pricing') ||
           content.toLowerCase().includes('plans');
  }

  extractNews(results) {
    return results
      .filter(r => r.url.includes('news') || r.url.includes('press'))
      .slice(0, 3)
      .map(r => r.content);
  }

  extractFunding(results) {
    const funding = results.find(r => 
      r.content.toLowerCase().includes('funding') ||
      r.content.toLowerCase().includes('raised') ||
      r.content.toLowerCase().includes('investment')
    );
    
    if (!funding) return null;

    return {
      recent: true,
      amount: this.extractAmount(funding.content),
      date: funding.published_date
    };
  }

  extractRevenue(results) {
    const revenue = results.find(r => 
      r.content.toLowerCase().includes('revenue')
    );
    
    if (!revenue) return null;
    return this.extractAmount(revenue.content);
  }

  extractEmployeeCount(results) {
    const employees = results.find(r => 
      r.content.toLowerCase().includes('employees') ||
      r.content.toLowerCase().includes('team')
    );
    
    if (!employees) return null;
    return this.extractNumber(employees.content);
  }

  extractContacts(results) {
    const contacts = [];
    
    results.forEach(result => {
      const email = this.extractEmail(result.content);
      const name = this.extractName(result.content);
      const title = this.extractTitle(result.content);
      
      if (email || name) {
        contacts.push({
          name,
          email,
          title,
          source: result.url
        });
      }
    });

    return contacts.slice(0, 5);
  }

  extractEmail(text) {
    const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    return match ? match[0] : null;
  }

  extractName(text) {
    // Simple name extraction - improve with NLP
    const match = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    return match ? match[0] : null;
  }

  extractTitle(text) {
    const titles = ['CEO', 'Founder', 'Director', 'Head of', 'VP', 'Manager'];
    for (const title of titles) {
      if (text.includes(title)) return title;
    }
    return null;
  }

  isDecisionMaker(title) {
    const decisionMakers = ['CEO', 'Founder', 'Owner', 'Director', 'VP'];
    return decisionMakers.some(d => title?.includes(d));
  }

  isInfluencer(title) {
    const influencers = ['Manager', 'Head of', 'Lead'];
    return influencers.some(i => title?.includes(i));
  }

  contactConfidence(contact) {
    let confidence = 50;
    if (contact.email) confidence += 20;
    if (contact.title) confidence += 15;
    if (contact.source?.includes('linkedin')) confidence += 15;
    return Math.min(confidence, 100);
  }

  extractAmount(text) {
    const match = text.match(/£?\$?[\d,]+(?:M|B|million|billion)?/i);
    return match ? match[0] : null;
  }

  extractNumber(text) {
    const match = text.match(/(\d+)\s*(?:employees|team|people)/i);
    return match ? parseInt(match[1]) : null;
  }
}

module.exports = LeadResearcher;
