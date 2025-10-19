// Watchdog Script - Monitors Agent Heartbeats
// Based on watchdog_script.md and ACE framework requirements

const heartbeatMonitor = require('../src/utils/heartbeat');
const winston = require('winston');

// Set up logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/watchdog.log' })
  ]
});

class Watchdog {
  constructor() {
    this.checkInterval = parseInt(process.env.HEARTBEAT_INTERVAL_MS) || 60000; // 1 minute
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Watchdog is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Watchdog started - monitoring agent heartbeats');
    
    // Initial check
    this.checkHeartbeats();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkHeartbeats();
    }, this.checkInterval);
  }

  stop() {
    if (!this.isRunning) {
      logger.warn('Watchdog is not running');
      return;
    }

    this.isRunning = false;
    clearInterval(this.intervalId);
    logger.info('Watchdog stopped');
  }

  checkHeartbeats() {
    try {
      const stalledAgents = heartbeatMonitor.checkForStalls();
      
      if (stalledAgents.length > 0) {
        logger.warn(`STALL DETECTED: ${stalledAgents.length} agents stalled`, {
          stalledAgents: stalledAgents.map(agent => ({
            agentType: agent.agentType,
            sourceId: agent.sourceId,
            currentTask: agent.currentTask,
            timeSinceUpdate: agent.timeSinceUpdate
          }))
        });
        
        // Trigger recovery for each stalled agent
        stalledAgents.forEach(agent => {
          this.triggerRecovery(agent);
        });
      } else {
        logger.debug('All agents healthy');
      }
      
    } catch (error) {
      logger.error(`Watchdog check failed: ${error.message}`);
    }
  }

  triggerRecovery(stalledAgent) {
    logger.info(`Triggering recovery for stalled agent: ${stalledAgent.agentType} (source ${stalledAgent.sourceId})`);
    
    try {
      // Import critic agent for recovery
      const CriticAgent = require('../src/agents/critic_agent');
      const critic = new CriticAgent();
      
      // Trigger recovery process
      critic.recover(stalledAgent).then(result => {
        logger.info(`Recovery completed for ${stalledAgent.agentType}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        
        if (result.success) {
          // Clear the stalled heartbeat
          heartbeatMonitor.clearHeartbeat(stalledAgent.agentType, stalledAgent.sourceId);
        }
      }).catch(error => {
        logger.error(`Recovery failed for ${stalledAgent.agentType}: ${error.message}`);
      });
      
    } catch (error) {
      logger.error(`Failed to trigger recovery: ${error.message}`);
    }
  }

  // Get current status
  getStatus() {
    const runningAgents = heartbeatMonitor.getRunningAgents();
    const stalledAgents = heartbeatMonitor.checkForStalls();
    
    return {
      isRunning: this.isRunning,
      runningAgents: runningAgents.length,
      stalledAgents: stalledAgents.length,
      checkInterval: this.checkInterval
    };
  }
}

// Create and export watchdog instance
const watchdog = new Watchdog();

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down watchdog...');
  watchdog.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down watchdog...');
  watchdog.stop();
  process.exit(0);
});

// Start watchdog if run directly
if (require.main === module) {
  watchdog.start();
  
  // Keep process alive
  setInterval(() => {
    // Just keep the process running
  }, 1000);
}

module.exports = watchdog;
