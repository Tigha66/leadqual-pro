/**
 * AI Lead Scoring Engine
 * Scores leads 1-100 based on fit + intent signals
 */

const openai = require('openai');

class LeadScorer {
  constructor() {
    this.openai = new openai.OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Score a lead based on multiple factors
   * @param {Object} lead - Lead data from research
   * @returns {Object} Score breakdown + total score
   */
  async score(lead) {
    const scores = {
      fit: await this.scoreFit(lead),
      intent: await this.scoreIntent(lead),
      budget: await this.scoreBudget(lead),
      authority: await this.scoreAuthority(lead),
      timeline: await this.scoreTimeline(lead)
    };

    // Weighted average
    const total = Math.round(
      (scores.fit * 0.25) +
      (scores.intent * 0.25) +
      (scores.budget * 0.20) +
      (scores.authority * 0.15) +
      (scores.timeline * 0.15)
    );

    return {
      total,
      scores,
      grade: this.getGrade(total),
      recommendation: this.getRecommendation(total, scores)
    };
  }

  /**
   * Score company fit (0-100)
   */
  async scoreFit(lead) {
    const factors = [];

    // Industry match
    if (lead.industry && this.isTargetIndustry(lead.industry)) {
      factors.push(25);
    }

    // Company size
    if (lead.employeeCount && lead.employeeCount >= 10 && lead.employeeCount <= 500) {
      factors.push(25);
    } else if (lead.employeeCount && lead.employeeCount > 500) {
      factors.push(15); // Enterprise = longer sales cycle
    }

    // Location
    if (lead.location && this.isTargetLocation(lead.location)) {
      factors.push(25);
    }

    // Tech stack
    if (lead.techStack && this.hasComplementaryTech(lead.techStack)) {
      factors.push(25);
    }

    return factors.reduce((a, b) => a + b, 0);
  }

  /**
   * Score intent signals (0-100)
   */
  async scoreIntent(lead) {
    const signals = [];

    // Website engagement
    if (lead.websiteVisits && lead.websiteVisits > 5) {
      signals.push(20);
    }

    // Content downloads
    if (lead.contentDownloads && lead.contentDownloads > 0) {
      signals.push(20);
    }

    // Pricing page visits
    if (lead.pricingPageVisits && lead.pricingPageVisits > 0) {
      signals.push(30);
    }

    // Recent funding
    if (lead.recentFunding && lead.recentFunding.date) {
      signals.push(30);
    }

    return signals.reduce((a, b) => a + b, 0);
  }

  /**
   * Score budget indicators (0-100)
   */
  async scoreBudget(lead) {
    const indicators = [];

    // Revenue
    if (lead.revenue && lead.revenue > 1000000) {
      indicators.push(30);
    }

    // Funding
    if (lead.funding && lead.funding.total > 5000000) {
      indicators.push(30);
    }

    // Current spend
    if (lead.currentSpend && lead.currentSpend > 10000) {
      indicators.push(40);
    }

    return indicators.reduce((a, b) => a + b, 0);
  }

  /**
   * Score decision-maker access (0-100)
   */
  async scoreAuthority(lead) {
    const access = [];

    // Contact is decision maker
    if (lead.contact && lead.contact.isDecisionMaker) {
      access.push(50);
    }

    // Contact is influencer
    if (lead.contact && lead.contact.isInfluencer) {
      access.push(30);
    }

    // Multiple contacts
    if (lead.contacts && lead.contacts.length > 2) {
      access.push(20);
    }

    return access.reduce((a, b) => a + b, 0);
  }

  /**
   * Score timeline urgency (0-100)
   */
  async scoreTimeline(lead) {
    const urgency = [];

    // Explicit timeline
    if (lead.timeline && lead.timeline === 'immediate') {
      urgency.push(50);
    } else if (lead.timeline && lead.timeline === 'this_quarter') {
      urgency.push(30);
    }

    // Trigger events
    if (lead.triggerEvents && lead.triggerEvents.length > 0) {
      urgency.push(30);
    }

    // Pain point severity
    if (lead.painPoints && lead.painPoints.severity === 'high') {
      urgency.push(20);
    }

    return urgency.reduce((a, b) => a + b, 0);
  }

  /**
   * Convert score to grade
   */
  getGrade(score) {
    if (score >= 80) return 'A+';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Get recommendation based on score
   */
  getRecommendation(total, scores) {
    if (total >= 80) {
      return {
        action: 'CONTACT_IMMEDIATELY',
        priority: 'HIGH',
        message: 'Hot lead - contact within 1 hour',
        approach: 'Direct call + personalized email'
      };
    } else if (total >= 60) {
      return {
        action: 'NURTURE',
        priority: 'MEDIUM',
        message: 'Warm lead - add to nurture sequence',
        approach: 'Email sequence + retargeting'
      };
    } else {
      return {
        action: 'QUALIFY_MORE',
        priority: 'LOW',
        message: 'Cold lead - needs more qualification',
        approach: 'Light touch + monitor for triggers'
      };
    }
  }

  // Helper methods
  isTargetIndustry(industry) {
    const targets = ['SaaS', 'Technology', 'Marketing', 'Consulting', 'E-commerce'];
    return targets.some(t => industry.toLowerCase().includes(t.toLowerCase()));
  }

  isTargetLocation(location) {
    const targets = ['UK', 'London', 'United Kingdom', 'Europe'];
    return targets.some(t => location.toLowerCase().includes(t.toLowerCase()));
  }

  hasComplementaryTech(techStack) {
    // Check if they use complementary technologies
    const goodTech = ['HubSpot', 'Salesforce', 'Slack', 'Calendly', 'Zoom'];
    return techStack.some(tech => goodTech.includes(tech));
  }
}

module.exports = LeadScorer;
