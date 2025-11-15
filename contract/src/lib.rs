//! Prediction Market Contract for Linera
//! 
//! This contract implements a real-time prediction market system where users can:
//! - Create prediction markets with multiple options
//! - Place bets on market options
//! - Resolve markets and claim rewards
//! - Track market state in real-time

use linera_sdk::base::{Amount, ApplicationId, ChainId, Owner, Timestamp};
use linera_sdk::views::{MapView, View, ViewStorageContext};
use linera_sdk::{Contract, Service};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// The prediction market application.
#[derive(Debug)]
pub struct PredictionMarket {
    state: PredictionMarketState,
}

/// The state of the prediction market application.
#[derive(Clone, Serialize, Deserialize)]
pub struct PredictionMarketState {
    /// Next market ID (auto-incrementing)
    pub next_market_id: u64,
    /// Markets indexed by ID
    pub markets: BTreeMap<u64, Market>,
    /// User bets indexed by (market_id, owner)
    pub user_bets: BTreeMap<(u64, Owner), Bet>,
}

/// A prediction market.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Market {
    /// Unique market ID
    pub id: u64,
    /// Creator of the market
    pub creator: Owner,
    /// Market question
    pub question: String,
    /// Market description
    pub description: String,
    /// End time (timestamp in milliseconds)
    pub end_time: Timestamp,
    /// Market status
    pub status: MarketStatus,
    /// Available options
    pub options: Vec<String>,
    /// Correct answer (set when resolved)
    pub correct_answer: Option<String>,
    /// Total bets per option
    pub bets: BTreeMap<String, Amount>,
    /// Total pool amount
    pub total_pool: Amount,
    /// Maximum reward per winner (in native tokens)
    pub max_reward: Amount,
    /// Creation timestamp
    pub created_at: Timestamp,
}

/// Market status
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq)]
pub enum MarketStatus {
    /// Market is active and accepting bets
    Active,
    /// Market has ended and is locked (no more bets)
    Locked,
    /// Market has been resolved
    Resolved,
}

/// A user bet
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Bet {
    /// Market ID
    pub market_id: u64,
    /// User who placed the bet
    pub user: Owner,
    /// Selected option
    pub option: String,
    /// Bet amount
    pub amount: Amount,
    /// Timestamp when bet was placed
    pub timestamp: Timestamp,
    /// Whether reward has been claimed
    pub claimed: bool,
    /// Reward amount (calculated on resolution)
    pub reward_amount: Amount,
}

/// Message for the prediction market application.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub enum PredictionMarketMessage {
    /// Create a new prediction market
    CreateMarket {
        question: String,
        description: String,
        duration_minutes: u64,
        options: Vec<String>,
        max_reward: Amount,
    },
    /// Place a bet on a market option
    PlaceBet {
        market_id: u64,
        option: String,
        amount: Amount,
    },
    /// Resolve a market (creator only)
    ResolveMarket {
        market_id: u64,
        correct_answer: String,
    },
    /// Claim reward from a resolved market
    ClaimReward {
        market_id: u64,
    },
}

/// Effect for the prediction market application.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub enum PredictionMarketEffect {
    /// Market created event
    MarketCreated {
        market_id: u64,
        creator: Owner,
    },
    /// Bet placed event
    BetPlaced {
        market_id: u64,
        user: Owner,
        option: String,
        amount: Amount,
    },
    /// Market resolved event
    MarketResolved {
        market_id: u64,
        correct_answer: String,
    },
    /// Reward claimed event
    RewardClaimed {
        market_id: u64,
        user: Owner,
        amount: Amount,
    },
}

impl Default for PredictionMarketState {
    fn default() -> Self {
        Self {
            next_market_id: 1,
            markets: BTreeMap::new(),
            user_bets: BTreeMap::new(),
        }
    }
}

#[async_trait::async_trait]
impl Contract for PredictionMarket {
    type Message = PredictionMarketMessage;
    type Parameters = ();
    type InstantiationArgument = ();

    async fn instantiate(
        _context: &linera_sdk::base::ContractRuntimeContext,
        _argument: Self::InstantiationArgument,
    ) -> Result<Self, linera_sdk::base::ContractError> {
        Ok(PredictionMarket {
            state: PredictionMarketState::default(),
        })
    }

    async fn execute_message(
        &mut self,
        context: &linera_sdk::base::ContractRuntimeContext,
        message: Self::Message,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        match message {
            PredictionMarketMessage::CreateMarket {
                question,
                description,
                duration_minutes,
                options,
                max_reward,
            } => self.create_market(context, question, description, duration_minutes, options, max_reward),
            PredictionMarketMessage::PlaceBet {
                market_id,
                option,
                amount,
            } => self.place_bet(context, market_id, option, amount),
            PredictionMarketMessage::ResolveMarket {
                market_id,
                correct_answer,
            } => self.resolve_market(context, market_id, correct_answer),
            PredictionMarketMessage::ClaimReward { market_id } => self.claim_reward(context, market_id),
        }
    }

    async fn execute_effect(
        &mut self,
        _context: &linera_sdk::base::ContractRuntimeContext,
        _effect: PredictionMarketEffect,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        // Effects are executed on other chains
        Ok(vec![])
    }
}

impl PredictionMarket {
    /// Create a new prediction market
    fn create_market(
        &mut self,
        context: &linera_sdk::base::ContractRuntimeContext,
        question: String,
        description: String,
        duration_minutes: u64,
        options: Vec<String>,
        max_reward: Amount,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        // Validate inputs
        if question.is_empty() {
            return Err(linera_sdk::base::ContractError::Other("Question cannot be empty".to_string()));
        }
        if options.len() < 2 {
            return Err(linera_sdk::base::ContractError::Other("At least 2 options required".to_string()));
        }
        if max_reward == Amount::ZERO {
            return Err(linera_sdk::base::ContractError::Other("Max reward must be greater than 0".to_string()));
        }

        // Get creator
        let creator = context.authenticated_signer().ok_or_else(|| {
            linera_sdk::base::ContractError::Other("Unauthorized: No authenticated signer".to_string())
        })?;

        // Get current timestamp
        let now = context.system_time();
        let end_time = now + (duration_minutes * 60 * 1000); // Convert minutes to milliseconds

        // Create market
        let market_id = self.state.next_market_id;
        let market = Market {
            id: market_id,
            creator,
            question: question.clone(),
            description: description.clone(),
            end_time,
            status: MarketStatus::Active,
            options: options.clone(),
            correct_answer: None,
            bets: BTreeMap::new(),
            total_pool: Amount::ZERO,
            max_reward,
            created_at: now,
        };

        // Store market
        self.state.markets.insert(market_id, market);
        self.state.next_market_id += 1;

        // Emit event
        Ok(vec![PredictionMarketEffect::MarketCreated {
            market_id,
            creator,
        }])
    }

    /// Place a bet on a market option
    fn place_bet(
        &mut self,
        context: &linera_sdk::base::ContractRuntimeContext,
        market_id: u64,
        option: String,
        amount: Amount,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        // Validate inputs
        if amount == Amount::ZERO {
            return Err(linera_sdk::base::ContractError::Other("Bet amount must be greater than 0".to_string()));
        }

        // Get user
        let user = context.authenticated_signer().ok_or_else(|| {
            linera_sdk::base::ContractError::Other("Unauthorized: No authenticated signer".to_string())
        })?;

        // Get market
        let market = self.state.markets.get_mut(&market_id).ok_or_else(|| {
            linera_sdk::base::ContractError::Other(format!("Market {} not found", market_id))
        })?;

        // Validate market
        if market.status != MarketStatus::Active {
            return Err(linera_sdk::base::ContractError::Other("Market is not active".to_string()));
        }

        let now = context.system_time();
        if now >= market.end_time {
            return Err(linera_sdk::base::ContractError::Other("Market has ended".to_string()));
        }

        // Validate option
        if !market.options.contains(&option) {
            return Err(linera_sdk::base::ContractError::Other(format!("Invalid option: {}", option)));
        }

        // Check if user already bet on this market
        let bet_key = (market_id, user);
        if self.state.user_bets.contains_key(&bet_key) {
            return Err(linera_sdk::base::ContractError::Other("User already placed a bet on this market".to_string()));
        }

        // Transfer tokens from user to contract
        // Note: In Linera, token transfers are handled differently
        // This is a simplified version - actual implementation would use token transfers

        // Create bet
        let bet = Bet {
            market_id,
            user,
            option: option.clone(),
            amount,
            timestamp: now,
            claimed: false,
            reward_amount: Amount::ZERO,
        };

        // Store bet
        self.state.user_bets.insert(bet_key, bet);

        // Update market bets
        let option_total = market.bets.get(&option).copied().unwrap_or(Amount::ZERO);
        market.bets.insert(option, option_total + amount);
        market.total_pool += amount;

        // Emit event
        Ok(vec![PredictionMarketEffect::BetPlaced {
            market_id,
            user,
            option,
            amount,
        }])
    }

    /// Resolve a market (creator only)
    fn resolve_market(
        &mut self,
        context: &linera_sdk::base::ContractRuntimeContext,
        market_id: u64,
        correct_answer: String,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        // Get caller
        let caller = context.authenticated_signer().ok_or_else(|| {
            linera_sdk::base::ContractError::Other("Unauthorized: No authenticated signer".to_string())
        })?;

        // Get market
        let market = self.state.markets.get_mut(&market_id).ok_or_else(|| {
            linera_sdk::base::ContractError::Other(format!("Market {} not found", market_id))
        })?;

        // Validate caller is creator
        if market.creator != caller {
            return Err(linera_sdk::base::ContractError::Other("Only creator can resolve market".to_string()));
        }

        // Validate market can be resolved
        if market.status == MarketStatus::Resolved {
            return Err(linera_sdk::base::ContractError::Other("Market already resolved".to_string()));
        }

        let now = context.system_time();
        if now < market.end_time {
            return Err(linera_sdk::base::ContractError::Other("Market has not ended yet".to_string()));
        }

        // Validate correct answer
        if !market.options.contains(&correct_answer) {
            return Err(linera_sdk::base::ContractError::Other(format!("Invalid correct answer: {}", correct_answer)));
        }

        // Update market status
        market.status = MarketStatus::Resolved;
        market.correct_answer = Some(correct_answer.clone());

        // Calculate rewards for winners
        let winning_bet_amount = market.bets.get(&correct_answer).copied().unwrap_or(Amount::ZERO);
        if winning_bet_amount > Amount::ZERO {
            // Calculate rewards proportionally
            let total_pool = market.total_pool;
            for (bet_key, bet) in self.state.user_bets.iter_mut() {
                if bet_key.0 == market_id && bet.option == correct_answer {
                    // Calculate reward: (bet_amount / winning_pool) * total_pool
                    // But cap at max_reward
                    let reward = if total_pool > Amount::ZERO && winning_bet_amount > Amount::ZERO {
                        (bet.amount * total_pool) / winning_bet_amount
                    } else {
                        Amount::ZERO
                    };
                    let capped_reward = if reward > market.max_reward {
                        market.max_reward
                    } else {
                        reward
                    };
                    bet.reward_amount = capped_reward;
                }
            }
        }

        // Emit event
        Ok(vec![PredictionMarketEffect::MarketResolved {
            market_id,
            correct_answer,
        }])
    }

    /// Claim reward from a resolved market
    fn claim_reward(
        &mut self,
        context: &linera_sdk::base::ContractRuntimeContext,
        market_id: u64,
    ) -> Result<Vec<PredictionMarketEffect>, linera_sdk::base::ContractError> {
        // Get user
        let user = context.authenticated_signer().ok_or_else(|| {
            linera_sdk::base::ContractError::Other("Unauthorized: No authenticated signer".to_string())
        })?;

        // Get market
        let market = self.state.markets.get(&market_id).ok_or_else(|| {
            linera_sdk::base::ContractError::Other(format!("Market {} not found", market_id))
        })?;

        // Validate market is resolved
        if market.status != MarketStatus::Resolved {
            return Err(linera_sdk::base::ContractError::Other("Market is not resolved".to_string()));
        }

        // Get user bet
        let bet_key = (market_id, user);
        let bet = self.state.user_bets.get_mut(&bet_key).ok_or_else(|| {
            linera_sdk::base::ContractError::Other("User has no bet on this market".to_string())
        })?;

        // Validate user won
        if bet.option != market.correct_answer.as_ref().unwrap() {
            return Err(linera_sdk::base::ContractError::Other("User did not win this market".to_string()));
        }

        // Validate reward not already claimed
        if bet.claimed {
            return Err(linera_sdk::base::ContractError::Other("Reward already claimed".to_string()));
        }

        // Validate reward amount
        if bet.reward_amount == Amount::ZERO {
            return Err(linera_sdk::base::ContractError::Other("No reward available".to_string()));
        }

        // Mark as claimed
        bet.claimed = true;

        // Transfer reward to user
        // Note: In Linera, token transfers are handled differently
        // This is a simplified version - actual implementation would use token transfers

        // Emit event
        Ok(vec![PredictionMarketEffect::RewardClaimed {
            market_id,
            user,
            amount: bet.reward_amount,
        }])
    }
}

#[async_trait::async_trait]
impl Service for PredictionMarket {
    type Query = String;
    type QueryResponse = String;

    async fn handle_query(
        &self,
        _context: &linera_sdk::base::ServiceRuntimeContext,
        query: Self::Query,
    ) -> Result<Self::QueryResponse, linera_sdk::base::ContractError> {
        // Handle queries (e.g., get market details)
        // This will be implemented in the GraphQL service
        // For now, return serialized state
        match serde_json::to_string(&self.state) {
            Ok(json) => Ok(json),
            Err(e) => Err(linera_sdk::base::ContractError::Other(format!("Serialization error: {}", e))),
        }
    }
}

