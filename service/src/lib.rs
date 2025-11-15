//! Prediction Market Service for Linera
//! 
//! This service provides a GraphQL API for the prediction market application.
//! It enables real-time queries and subscriptions for market data.

use async_graphql::{Context, Object, Schema, Subscription};
use linera_sdk::base::{Amount, Owner, Timestamp};
use prediction_market::{Market as ContractMarket, Bet as ContractBet, PredictionMarketState};
use serde::{Deserialize, Serialize};
use serde_json;
use std::sync::Arc;
use tokio_stream::{Stream, StreamExt};

/// GraphQL schema for the prediction market service
pub type PredictionMarketSchema = Schema<QueryRoot, MutationRoot, SubscriptionRoot>;

/// Query root for GraphQL
pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// Get all markets
    async fn markets(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<MarketResponse>> {
        // Get contract state from context
        // In a real implementation, this would query the Linera contract via service context
        let state_str = ctx.data::<Arc<String>>().map(|s| s.as_str()).unwrap_or("");
        
        // Parse contract state
        let state: PredictionMarketState = match serde_json::from_str(state_str) {
            Ok(s) => s,
            Err(_) => return Ok(vec![]), // Return empty if can't parse
        };
        
        // Convert markets to responses
        Ok(state.markets.values().map(market_to_response).collect())
    }

    /// Get a market by ID
    async fn market(&self, ctx: &Context<'_>, id: u64) -> async_graphql::Result<Option<MarketResponse>> {
        // Get contract state from context
        let state_str = ctx.data::<Arc<String>>().map(|s| s.as_str()).unwrap_or("");
        
        // Parse contract state
        let state: PredictionMarketState = match serde_json::from_str(state_str) {
            Ok(s) => s,
            Err(_) => return Ok(None),
        };
        
        // Find market by ID
        Ok(state.markets.get(&id).map(market_to_response))
    }

    /// Get user bets for a market
    async fn user_bets(
        &self,
        ctx: &Context<'_>,
        market_id: u64,
        user: String,
    ) -> async_graphql::Result<Vec<BetResponse>> {
        // Get contract state from context
        let state_str = ctx.data::<Arc<String>>().map(|s| s.as_str()).unwrap_or("");
        
        // Parse contract state
        let state: PredictionMarketState = match serde_json::from_str(state_str) {
            Ok(s) => s,
            Err(_) => return Ok(vec![]),
        };
        
        // Parse user address (simplified - actual implementation would use proper Owner type)
        // For now, we'll match all bets for the market
        let bets: Vec<BetResponse> = state.user_bets
            .iter()
            .filter(|((mid, _), _)| *mid == market_id)
            .map(|(_, bet)| bet_to_response(bet))
            .collect();
        
        Ok(bets)
    }

    /// Get claimable rewards for a user
    async fn claimable_rewards(
        &self,
        ctx: &Context<'_>,
        user: String,
    ) -> async_graphql::Result<Vec<RewardResponse>> {
        // Get contract state from context
        let state_str = ctx.data::<Arc<String>>().map(|s| s.as_str()).unwrap_or("");
        
        // Parse contract state
        let state: PredictionMarketState = match serde_json::from_str(state_str) {
            Ok(s) => s,
            Err(_) => return Ok(vec![]),
        };
        
        // Find all claimable rewards for user
        let rewards: Vec<RewardResponse> = state.user_bets
            .iter()
            .filter(|(_, bet)| {
                format!("{:?}", bet.user) == user 
                    && bet.reward_amount > Amount::ZERO 
                    && !bet.claimed
            })
            .map(|((market_id, _), bet)| RewardResponse {
                market_id: *market_id,
                user: user.clone(),
                amount: bet.reward_amount.to_string(),
                claimed: bet.claimed,
            })
            .collect();
        
        Ok(rewards)
    }
}

/// Mutation root for GraphQL
pub struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Create a new prediction market
    async fn create_market(
        &self,
        ctx: &Context<'_>,
        input: CreateMarketInput,
    ) -> async_graphql::Result<MarketResponse> {
        // Create market via contract message
        // This is a placeholder - actual implementation would send a message to the contract
        Err(async_graphql::Error::new("Not implemented"))
    }

    /// Place a bet on a market option
    async fn place_bet(
        &self,
        ctx: &Context<'_>,
        input: PlaceBetInput,
    ) -> async_graphql::Result<BetResponse> {
        // Place bet via contract message
        // This is a placeholder - actual implementation would send a message to the contract
        Err(async_graphql::Error::new("Not implemented"))
    }

    /// Resolve a market (creator only)
    async fn resolve_market(
        &self,
        ctx: &Context<'_>,
        input: ResolveMarketInput,
    ) -> async_graphql::Result<MarketResponse> {
        // Resolve market via contract message
        // This is a placeholder - actual implementation would send a message to the contract
        Err(async_graphql::Error::new("Not implemented"))
    }

    /// Claim reward from a resolved market
    async fn claim_reward(
        &self,
        ctx: &Context<'_>,
        input: ClaimRewardInput,
    ) -> async_graphql::Result<RewardResponse> {
        // Claim reward via contract message
        // This is a placeholder - actual implementation would send a message to the contract
        Err(async_graphql::Error::new("Not implemented"))
    }
}

/// Subscription root for GraphQL (real-time updates)
pub struct SubscriptionRoot;

#[Subscription]
impl SubscriptionRoot {
    /// Subscribe to market updates
    async fn market_updates(
        &self,
        ctx: &Context<'_>,
        market_id: u64,
    ) -> impl Stream<Item = MarketResponse> {
        // Subscribe to market updates via contract events
        // This is a placeholder - actual implementation would subscribe to contract events
        tokio_stream::empty()
    }

    /// Subscribe to bet updates for a market
    async fn bet_updates(
        &self,
        ctx: &Context<'_>,
        market_id: u64,
    ) -> impl Stream<Item = BetResponse> {
        // Subscribe to bet updates via contract events
        // This is a placeholder - actual implementation would subscribe to contract events
        tokio_stream::empty()
    }

    /// Subscribe to pool updates for a market
    async fn pool_updates(
        &self,
        ctx: &Context<'_>,
        market_id: u64,
    ) -> impl Stream<Item = PoolUpdateResponse> {
        // Subscribe to pool updates via contract events
        // This is a placeholder - actual implementation would subscribe to contract events
        tokio_stream::empty()
    }
}

/// GraphQL response types

#[derive(Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct MarketResponse {
    pub id: u64,
    pub creator: String,
    pub question: String,
    pub description: String,
    pub end_time: i64,
    pub status: String,
    pub options: Vec<String>,
    pub correct_answer: Option<String>,
    pub bets: Vec<OptionBetResponse>,
    pub total_pool: String,
    pub max_reward: String,
    pub created_at: i64,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct OptionBetResponse {
    pub option: String,
    pub amount: String,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct BetResponse {
    pub market_id: u64,
    pub user: String,
    pub option: String,
    pub amount: String,
    pub timestamp: i64,
    pub claimed: bool,
    pub reward_amount: String,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct RewardResponse {
    pub market_id: u64,
    pub user: String,
    pub amount: String,
    pub claimed: bool,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct PoolUpdateResponse {
    pub market_id: u64,
    pub total_pool: String,
    pub option_bets: Vec<OptionBetResponse>,
}

/// GraphQL input types

#[derive(Clone, Serialize, Deserialize, async_graphql::InputObject)]
pub struct CreateMarketInput {
    pub question: String,
    pub description: String,
    pub duration_minutes: u64,
    pub options: Vec<String>,
    pub max_reward: String,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::InputObject)]
pub struct PlaceBetInput {
    pub market_id: u64,
    pub option: String,
    pub amount: String,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::InputObject)]
pub struct ResolveMarketInput {
    pub market_id: u64,
    pub correct_answer: String,
}

#[derive(Clone, Serialize, Deserialize, async_graphql::InputObject)]
pub struct ClaimRewardInput {
    pub market_id: u64,
}

/// Create the GraphQL schema
pub fn create_schema() -> PredictionMarketSchema {
    Schema::build(QueryRoot, MutationRoot, SubscriptionRoot)
        .finish()
}

// Helper functions to convert contract types to GraphQL types

fn market_to_response(market: &ContractMarket) -> MarketResponse {
    MarketResponse {
        id: market.id,
        creator: format!("{:?}", market.creator),
        question: market.question.clone(),
        description: market.description.clone(),
        end_time: market.end_time.saturating_sub(Timestamp::from(0)) as i64,
        status: format!("{:?}", market.status),
        options: market.options.clone(),
        correct_answer: market.correct_answer.clone(),
        bets: market.bets.iter()
            .map(|(option, amount)| OptionBetResponse {
                option: option.clone(),
                amount: amount.to_string(),
            })
            .collect(),
        total_pool: market.total_pool.to_string(),
        max_reward: market.max_reward.to_string(),
        created_at: market.created_at.saturating_sub(Timestamp::from(0)) as i64,
    }
}

fn bet_to_response(bet: &ContractBet) -> BetResponse {
    BetResponse {
        market_id: bet.market_id,
        user: format!("{:?}", bet.user),
        option: bet.option.clone(),
        amount: bet.amount.to_string(),
        timestamp: bet.timestamp.saturating_sub(Timestamp::from(0)) as i64,
        claimed: bet.claimed,
        reward_amount: bet.reward_amount.to_string(),
    }
}

