export interface Market {
  id: number
  creator: string
  creatorChain: string
  question: string
  description: string
  endTime: number
  status: MarketStatus
  totalUpBets: string
  totalDownBets: string
  totalPool: string
  winningOption?: string
  createdAt: number
  resolutionPrice?: number
}

export type MarketStatus = 'Active' | 'Locked' | 'Resolved'

export interface Bet {
  marketId: number
  user: string
  option: BetOption
  amount: string
  timestamp: number
  claimed: boolean
}

export type BetOption = 'Up' | 'Down'

export interface CreateMarketInput {
  question: string
  description: string
  durationMinutes: number
}

export interface PlaceBetInput {
  marketId: number
  option: BetOption
  amount: string
}

export interface ResolveMarketInput {
  marketId: number
  winningOption: BetOption
  resolutionPrice: number
}



