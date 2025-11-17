/**
 * Default Mock Markets
 * Provides a set of default markets for display when no real data is available
 */

interface MockMarket {
  id: string;
  question: string;
  description: string;
  creator: string;
  createdAt: string;
  endsAt: string;
  status: 'active' | 'resolved' | 'locked';
  options: string[];
  totalPool: number;
  optionAmounts: Record<string, number>;
  correctAnswer: string | null;
  resolvedAt: string | null;
  maxReward: number;
}

export const DEFAULT_MOCK_MARKETS: MockMarket[] = [
  {
    id: 'mock-1',
    question: 'Will Bitcoin reach $100,000 by end of 2024?',
    description: 'Predict if Bitcoin will hit the $100k milestone before the year ends.',
    creator: 'linera_mock_creator_001',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    options: ['Yes', 'No'],
    totalPool: 5000,
    optionAmounts: { 'Yes': 3000, 'No': 2000 },
    correctAnswer: null,
    resolvedAt: null,
    maxReward: 10,
  },
  {
    id: 'mock-2',
    question: 'Will Ethereum complete the merge successfully?',
    description: 'Predict the success of Ethereum\'s major upgrade.',
    creator: 'linera_mock_creator_002',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    options: ['Yes', 'No'],
    totalPool: 3200,
    optionAmounts: { 'Yes': 2000, 'No': 1200 },
    correctAnswer: null,
    resolvedAt: null,
    maxReward: 10,
  },
  {
    id: 'mock-3',
    question: 'Will the US Federal Reserve cut interest rates in Q1 2024?',
    description: 'Predict the Fed\'s monetary policy decision for the first quarter.',
    creator: 'linera_mock_creator_003',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    options: ['Yes', 'No'],
    totalPool: 4500,
    optionAmounts: { 'Yes': 2500, 'No': 2000 },
    correctAnswer: null,
    resolvedAt: null,
    maxReward: 10,
  },
  {
    id: 'mock-4',
    question: 'Will AI surpass human intelligence by 2030?',
    description: 'Predict if artificial general intelligence will be achieved within the decade.',
    creator: 'linera_mock_creator_004',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    options: ['Yes', 'No'],
    totalPool: 2800,
    optionAmounts: { 'Yes': 1500, 'No': 1300 },
    correctAnswer: null,
    resolvedAt: null,
    maxReward: 10,
  },
  {
    id: 'mock-5',
    question: 'Will renewable energy account for 50% of global electricity by 2025?',
    description: 'Predict the growth of renewable energy sources worldwide.',
    creator: 'linera_mock_creator_005',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    options: ['Yes', 'No'],
    totalPool: 3600,
    optionAmounts: { 'Yes': 2200, 'No': 1400 },
    correctAnswer: null,
    resolvedAt: null,
    maxReward: 10,
  },
];

