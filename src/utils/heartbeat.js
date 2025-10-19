// Heartbeat Monitoring System
// Based on watchdog_script.md and ACE framework requirements

const fs = require('fs');
const path = require('path');

class HeartbeatMonitor {
  constructor() {
    this.statusFile = path.join(process.cwd(), 'tmp', 'agent-status.json');
    this.ensureStatusFile();
  }

  ensureStatusFile() {
    const tmpDir = path.dirname(this.statusFile);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.statusFile)) {
      fs.writeFileSync(this.statusFile, JSON.stringify({}));
    }
  }

  // Update heartbeat for an agent
  updateHeartbeat(agentType, sourceId, currentTask, status) {
    try {
      const statusData = this.loadStatus();
      
      statusData[`${agentType}_${sourceId}`] = {
        agentType,
        sourceId,
        currentTask,
        status,
        timestamp: new Date().toISOString()
      };
      
      this.saveStatus(statusData);
      
      console.log(`Heartbeat updated: ${agentType} (source ${sourceId}) - ${status}`);
      
    } catch (error) {
      console.error(`Failed to update heartbeat: ${error.message}`);
    }
  }

  // Load current status
  loadStatus() {
    try {
      const data = fs.readFileSync(this.statusFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load status: ${error.message}`);
      return {};
    }
  }

  // Save status to file
  saveStatus(statusData) {
    try {
      fs.writeFileSync(this.statusFile, JSON.stringify(statusData, null, 2));
    } catch (error) {
      console.error(`Failed to save status: ${error.message}`);
    }
  }

  // Check for stalled agents
  checkForStalls() {
    const statusData = this.loadStatus();
    const now = new Date();
    const stallThreshold = parseInt(process.env.STALL_DETECTION_MINUTES) || 5;
    const stallThresholdMs = stallThreshold * 60 * 1000;
    
    const stalledAgents = [];
    
    for (const [agentKey, agentStatus] of Object.entries(statusData)) {
      const lastUpdate = new Date(agentStatus.timestamp);
      const timeSinceUpdate = now - lastUpdate;
      
      if (timeSinceUpdate > stallThresholdMs && agentStatus.status === 'running') {
        stalledAgents.push({
          agentKey,
          ...agentStatus,
          timeSinceUpdate: Math.round(timeSinceUpdate / 1000 / 60) // minutes
        });
      }
    }
    
    return stalledAgents;
  }

  // Clear heartbeat for completed task
  clearHeartbeat(agentType, sourceId) {
    try {
      const statusData = this.loadStatus();
      const agentKey = `${agentType}_${sourceId}`;
      
      if (statusData[agentKey]) {
        delete statusData[agentKey];
        this.saveStatus(statusData);
        console.log(`Heartbeat cleared: ${agentType} (source ${sourceId})`);
      }
    } catch (error) {
      console.error(`Failed to clear heartbeat: ${error.message}`);
    }
  }

  // Get status for specific agent
  getAgentStatus(agentType, sourceId) {
    const statusData = this.loadStatus();
    return statusData[`${agentType}_${sourceId}`] || null;
  }

  // Get all running agents
  getRunningAgents() {
    const statusData = this.loadStatus();
    return Object.values(statusData).filter(agent => agent.status === 'running');
  }
}

// Singleton instance
const heartbeatMonitor = new HeartbeatMonitor();

module.exports = heartbeatMonitor;
