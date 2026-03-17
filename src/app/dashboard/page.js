'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [searchCriteria, setSearchCriteria] = useState({
    industry: '',
    location: 'UK',
    minEmployees: '',
    maxEmployees: ''
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchCriteria,
          limit: 20
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate leads');
      }

      setLeads(data.leads);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            LeadQual Pro Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Find and qualify leads automatically with AI
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Find New Leads</h2>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., SaaS, Marketing, Consulting"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchCriteria.industry}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, industry: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., London, UK"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchCriteria.location}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Employees
              </label>
              <input
                type="number"
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchCriteria.minEmployees}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, minEmployees: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Employees
              </label>
              <input
                type="number"
                placeholder="e.g., 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchCriteria.maxEmployees}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, maxEmployees: e.target.value })}
              />
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Finding Leads...' : 'Find Qualified Leads'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {leads.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Hot Leads</h3>
                <p className="text-3xl font-bold text-green-600">
                  {leads.filter(l => l.score.total >= 80).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Score 80-100</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Warm Leads</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {leads.filter(l => l.score.total >= 60 && l.score.total < 80).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Score 60-79</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Cold Leads</h3>
                <p className="text-3xl font-bold text-gray-600">
                  {leads.filter(l => l.score.total < 60).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Score < 60</p>
              </div>
            </div>

            {/* Lead List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Qualified Leads</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {leads.map((lead, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lead.companyName}
                        </h3>
                        <p className="text-gray-600">{lead.website}</p>
                        <p className="text-sm text-gray-500 mt-1">{lead.description}</p>
                        
                        {lead.score.recommendation && (
                          <div className="mt-3 flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.score.total >= 80 ? 'bg-green-100 text-green-800' :
                              lead.score.total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.score.grade} - {lead.score.total}/100
                            </span>
                            <span className="text-sm text-gray-600">
                              {lead.score.recommendation.action}
                            </span>
                          </div>
                        )}

                        {lead.insights && (
                          <div className="mt-3">
                            {lead.insights.painPoints.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-red-600">Pain Points:</span>
                                <ul className="list-disc list-inside text-gray-600 mt-1">
                                  {lead.insights.painPoints.map((pain, i) => (
                                    <li key={i}>{pain}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {lead.insights.opportunities.length > 0 && (
                              <div className="text-sm mt-2">
                                <span className="font-medium text-green-600">Opportunities:</span>
                                <ul className="list-disc list-inside text-gray-600 mt-1">
                                  {lead.insights.opportunities.map((opp, i) => (
                                    <li key={i}>{opp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
