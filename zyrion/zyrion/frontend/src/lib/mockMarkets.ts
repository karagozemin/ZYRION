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
  // Resolved markets
  {
    id: 'mock-6',
    question: 'Will Tesla stock reach $300 by end of Q3 2024?',
    description: 'Predict Tesla stock price performance based on closing price on September 30, 2024.',
    creator: 'linera_mock_creator_006',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
    options: ['Yes', 'No'],
    totalPool: 8500,
    optionAmounts: { 'Yes': 5200, 'No': 3300 },
    correctAnswer: 'Yes',
    resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    maxReward: 10,
  },
  {
    id: 'mock-7',
    question: 'Which team will win the 2024 Super Bowl?',
    description: 'Predict the winner of the 2024 NFL Super Bowl championship.',
    creator: 'linera_mock_creator_007',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
    options: ['Kansas City Chiefs', 'San Francisco 49ers', 'Buffalo Bills', 'Baltimore Ravens'],
    totalPool: 12000,
    optionAmounts: { 
      'Kansas City Chiefs': 4500, 
      'San Francisco 49ers': 3800, 
      'Buffalo Bills': 2500, 
      'Baltimore Ravens': 1200 
    },
    correctAnswer: 'Kansas City Chiefs',
    resolvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    maxReward: 10,
  },
  {
    id: 'mock-8',
    question: 'Will OpenAI release GPT-5 before the end of 2024?',
    description: 'Predict if OpenAI will publicly release GPT-5 model before December 31, 2024.',
    creator: 'linera_mock_creator_008',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
    options: ['Yes', 'No'],
    totalPool: 6400,
    optionAmounts: { 'Yes': 4200, 'No': 2200 },
    correctAnswer: 'No',
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    maxReward: 10,
  },
  {
    id: 'mock-9',
    question: 'What will be the most watched movie of 2024?',
    description: 'Based on global box office revenue and streaming viewership data.',
    creator: 'linera_mock_creator_009',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
    options: ['Dune: Part Two', 'Deadpool & Wolverine', 'Inside Out 2', 'Godzilla x Kong'],
    totalPool: 9800,
    optionAmounts: { 
      'Dune: Part Two': 3200, 
      'Deadpool & Wolverine': 4100, 
      'Inside Out 2': 1800, 
      'Godzilla x Kong': 700 
    },
    correctAnswer: 'Deadpool & Wolverine',
    resolvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    maxReward: 10,
  },
];

