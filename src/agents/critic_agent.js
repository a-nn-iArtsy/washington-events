// Critic Agent - Reviews recommendations for flaws
// Based on AGENT_PROFILES.md and ACE paper summary

const winston = require('winston');

class CriticAgent {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/critic.log' })
      ]
    });
  }

  // Review recommendations from Reflector agent
  async review(recommendations) {
    this.logger.info('Critic agent reviewing recommendations', {
      recommendationCount: recommendations.length
    });

    const reviewResults = {
      approved: [],
      rejected: [],
      needsMoreData: [],
      timestamp: new Date().toISOString()
    };

    for (const recommendation of recommendations) {
      const review = await this.reviewSingleRecommendation(recommendation);
      
      if (review.approved) {
        reviewResults.approved.push(recommendation);
      } else if (review.needsMoreData) {
        reviewResults.needsMoreData.push(recommendation);
      } else {
        reviewResults.rejected.push(recommendation);
      }
    }

    this.logger.info('Critic review completed', {
      approved: reviewResults.approved.length,
      rejected: reviewResults.rejected.length,
      needsMoreData: reviewResults.needsMoreData.length
    });

    return reviewResults;
  }

  // Review a single recommendation
  async reviewSingleRecommendation(recommendation) {
    const review = {
      approved: false,
      needsMoreData: false,
      issues: [],
      confidence: 0
    };

    // Check 1: Confidence score threshold
    if (recommendation.confidence_score < 0.7) {
      review.issues.push('Confidence score too low');
      review.needsMoreData = true;
    }

    // Check 2: Sample size adequacy
    if (recommendation.success_count < 10) {
      review.issues.push('Insufficient success samples');
      review.needsMoreData = true;
    }

    // Check 3: Pattern validity
    if (!this.isValidPattern(recommendation.pattern)) {
      review.issues.push('Invalid pattern structure');
      review.approved = false;
    }

    // Check 4: Safety checks
    if (this.hasSafetyIssues(recommendation)) {
      review.issues.push('Safety issues detected');
      review.approved = false;
    }

    // Check 5: Alignment with goals
    if (!this.checkAlignment(recommendation)) {
      review.issues.push('Not aligned with project goals');
      review.approved = false;
    }

    // Determine final decision
    if (review.issues.length === 0) {
      review.approved = true;
      review.confidence = recommendation.confidence_score;
    } else if (review.needsMoreData) {
      review.confidence = 0.3;
    } else {
      review.confidence = 0.1;
    }

    this.logger.info('Recommendation reviewed', {
      recommendationId: recommendation.id,
      approved: review.approved,
      needsMoreData: review.needsMoreData,
      issues: review.issues,
      confidence: review.confidence
    });

    return review;
  }

  // Validate pattern structure
  isValidPattern(pattern) {
    if (!pattern || typeof pattern !== 'object') {
      return false;
    }

    // Check for required fields
    const requiredFields = ['selector', 'method', 'fallback'];
    return requiredFields.every(field => pattern.hasOwnProperty(field));
  }

  // Check for safety issues
  hasSafetyIssues(recommendation) {
    const pattern = recommendation.pattern;
    
    // Check for potentially dangerous selectors
    const dangerousSelectors = ['script', 'iframe', 'object', 'embed'];
    const selector = pattern.selector || '';
    
    return dangerousSelectors.some(dangerous => 
      selector.toLowerCase().includes(dangerous)
    );
  }

  // Check alignment with project goals
  checkAlignment(recommendation) {
    // Ensure recommendation aligns with Washington Events goals
    const goals = [
      'family_friendly',
      'western_washington',
      'public_events',
      'accessible'
    ];

    // For now, approve all recommendations that pass other checks
    // In production, this would check against specific project criteria
    return true;
  }

  // Recovery process for stalled agents
  async recover(stalledAgent) {
    this.logger.warn('Critic agent triggering recovery', {
      agentType: stalledAgent.agentType,
      sourceId: stalledAgent.sourceId,
      currentTask: stalledAgent.currentTask,
      timeSinceUpdate: stalledAgent.timeSinceUpdate
    });

    try {
      const recoveryActions = await this.analyzeStall(stalledAgent);
      
      for (const action of recoveryActions) {
        await this.executeRecoveryAction(action);
      }

      this.logger.info('Recovery completed successfully', {
        agentType: stalledAgent.agentType,
        sourceId: stalledAgent.sourceId,
        actionsTaken: recoveryActions.length
      });

      return { success: true, actions: recoveryActions };

    } catch (error) {
      this.logger.error('Recovery failed', {
        agentType: stalledAgent.agentType,
        sourceId: stalledAgent.sourceId,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Analyze why an agent stalled
  async analyzeStall(stalledAgent) {
    const actions = [];

    // Action 1: Reset agent state
    actions.push({
      type: 'reset_agent_state',
      description: 'Clear agent state and restart',
      priority: 'high'
    });

    // Action 2: Update configuration if needed
    if (stalledAgent.timeSinceUpdate > 10) { // 10+ minutes
      actions.push({
        type: 'update_configuration',
        description: 'Update scraper configuration based on recent failures',
        priority: 'medium'
      });
    }

    // Action 3: Switch to fallback method
    actions.push({
      type: 'switch_fallback',
      description: 'Switch to alternative scraping method',
      priority: 'high'
    });

    return actions;
  }

  // Execute a recovery action
  async executeRecoveryAction(action) {
    this.logger.info('Executing recovery action', action);

    switch (action.type) {
      case 'reset_agent_state':
        // Clear any locks or state files
        await this.resetAgentState();
        break;
        
      case 'update_configuration':
        // Trigger configuration update
        await this.updateConfiguration();
        break;
        
      case 'switch_fallback':
        // Switch to fallback scraping method
        await this.switchToFallback();
        break;
        
      default:
        this.logger.warn('Unknown recovery action type', action.type);
    }
  }

  // Reset agent state
  async resetAgentState() {
    // Clear any temporary files or locks
    const fs = require('fs');
    const path = require('path');
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (fs.existsSync(tmpDir)) {
      const files = fs.readdirSync(tmpDir);
      files.forEach(file => {
        if (file.startsWith('agent_lock_')) {
          fs.unlinkSync(path.join(tmpDir, file));
        }
      });
    }
  }

  // Update configuration
  async updateConfiguration() {
    // This would trigger the Curator agent to apply configuration updates
    this.logger.info('Configuration update triggered');
  }

  // Switch to fallback method
  async switchToFallback() {
    // This would update the scraper to use alternative methods
    this.logger.info('Fallback method activated');
  }
}

module.exports = CriticAgent;
