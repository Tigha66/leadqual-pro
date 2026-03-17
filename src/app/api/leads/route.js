/**
 * API Route: POST /api/leads
 * Find and qualify leads automatically
 */

import { NextResponse } from 'next/server';
import LeadResearcher from '../../../lib/lead-researcher';
import LeadScorer from '../../../lib/lead-scorer';

const researcher = new LeadResearcher();
const scorer = new LeadScorer();

export async function POST(request) {
  try {
    const { searchCriteria, limit = 20 } = await request.json();

    // Validate request
    if (!searchCriteria || !searchCriteria.industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Step 1: Search for leads
    const leads = await findLeads(searchCriteria, limit);

    // Step 2: Research each lead
    const enrichedLeads = await Promise.all(
      leads.map(lead => researcher.research(lead))
    );

    // Step 3: Score each lead
    const scoredLeads = await Promise.all(
      enrichedLeads.map(async lead => ({
        ...lead,
        score: await scorer.score(lead)
      }))
    );

    // Step 4: Sort by score (highest first)
    scoredLeads.sort((a, b) => b.score.total - a.score.total);

    // Step 5: Return results
    return NextResponse.json({
      success: true,
      count: scoredLeads.length,
      leads: scoredLeads,
      hotLeads: scoredLeads.filter(l => l.score.total >= 80),
      warmLeads: scoredLeads.filter(l => l.score.total >= 60 && l.score.total < 80),
      coldLeads: scoredLeads.filter(l => l.score.total < 60)
    });

  } catch (error) {
    console.error('Lead generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate leads', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Find leads matching criteria
 */
async function findLeads(criteria, limit) {
  // Use Tavily to search for businesses
  const query = `${criteria.industry} companies in ${criteria.location || 'UK'} contact email website`;
  
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
    },
    body: JSON.stringify({
      query,
      search_depth: 'advanced',
      max_results: limit * 2 // Get more to filter
    })
  });

  const data = await response.json();

  // Transform into lead objects
  return data.results
    .map(result => ({
      companyName: extractCompanyName(result.title),
      website: extractWebsite(result.url),
      description: result.content,
      location: criteria.location,
      industry: criteria.industry
    }))
    .filter(lead => lead.website) // Only leads with websites
    .slice(0, limit);
}

// Helper functions
function extractCompanyName(title) {
  return title.replace(/ - .*| \| .*/g, '').trim();
}

function extractWebsite(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}
