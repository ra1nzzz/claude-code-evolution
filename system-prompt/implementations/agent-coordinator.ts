/**
 * Agent Coordinator
 * Manages parallel agent execution and result aggregation
 * Based on Claude Code's coordinator pattern
 */

interface AgentTask {
  id: string
  name: string
  description: string
  prompt: string
  model?: string
  timeout?: number
  priority?: 'high' | 'normal' | 'low'
}

interface AgentResult {
  taskId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout'
  output?: string
  error?: string
  startTime?: number
  endTime?: number
}

interface ParallelExecutionOptions {
  maxConcurrency?: number
  timeout?: number
  continueOnError?: boolean
  aggregateResults?: boolean
}

class AgentCoordinator {
  private activeAgents: Map<string, AgentResult> = new Map()
  private taskQueue: AgentTask[] = []
  
  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    tasks: AgentTask[],
    options: ParallelExecutionOptions = {}
  ): Promise<AgentResult[]> {
    const {
      maxConcurrency = 5,
      timeout = 300000, // 5 minutes
      continueOnError = true,
      aggregateResults = true
    } = options
    
    console.log(`Starting parallel execution of ${tasks.length} agents`)
    console.log(`Max concurrency: ${maxConcurrency}, Timeout: ${timeout}ms`)
    
    // Initialize results
    tasks.forEach(task => {
      this.activeAgents.set(task.id, {
        taskId: task.id,
        status: 'pending'
      })
    })
    
    // Execute with concurrency limit
    const results: AgentResult[] = []
    const executing: Promise<void>[] = []
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      
      // Wait if at concurrency limit
      while (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
      
      // Start task execution
      const execution = this.executeTask(task, timeout)
        .then(result => {
          results.push(result)
          // Remove from executing
          const index = executing.indexOf(execution)
          if (index > -1) executing.splice(index, 1)
        })
        .catch(error => {
          results.push({
            taskId: task.id,
            status: 'failed',
            error: error.message
          })
          if (!continueOnError) {
            throw error
          }
          // Remove from executing
          const index = executing.indexOf(execution)
          if (index > -1) executing.splice(index, 1)
        })
      
      executing.push(execution)
    }
    
    // Wait for all to complete
    await Promise.all(executing)
    
    console.log(`Parallel execution completed: ${results.length} results`)
    
    // Aggregate if requested
    if (aggregateResults) {
      return this.aggregateResults(results)
    }
    
    return results
  }
  
  /**
   * Execute a single task
   */
  private async executeTask(
    task: AgentTask,
    timeout: number
  ): Promise<AgentResult> {
    const startTime = Date.now()
    
    // Update status
    this.activeAgents.set(task.id, {
      taskId: task.id,
      status: 'running',
      startTime
    })
    
    console.log(`[${task.id}] Starting: ${task.name}`)
    
    try {
      // In production, this would spawn actual subagent
      // For now, simulate execution
      const result = await this.spawnSubagent(task, timeout)
      
      const endTime = Date.now()
      const agentResult: AgentResult = {
        taskId: task.id,
        status: 'completed',
        output: result,
        startTime,
        endTime
      }
      
      this.activeAgents.set(task.id, agentResult)
      console.log(`[${task.id}] Completed in ${endTime - startTime}ms`)
      
      return agentResult
      
    } catch (error) {
      const endTime = Date.now()
      const agentResult: AgentResult = {
        taskId: task.id,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        startTime,
        endTime
      }
      
      this.activeAgents.set(task.id, agentResult)
      console.log(`[${task.id}] Failed: ${agentResult.error}`)
      
      return agentResult
    }
  }
  
  /**
   * Spawn subagent (simulated)
   * In production, this would use sessions_spawn
   */
  private async spawnSubagent(task: AgentTask, timeout: number): Promise<string> {
    // Simulate subagent execution
    // In production:
    // return sessions_spawn({
    //   task: task.prompt,
    //   runtime: 'acp',
    //   mode: 'run',
    //   timeoutSeconds: timeout / 1000
    // })
    
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 2000 + 1000 // 1-3 seconds
      
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(`Result for ${task.name}: Task completed successfully`)
        } else {
          reject(new Error('Simulated failure'))
        }
      }, delay)
    })
  }
  
  /**
   * Aggregate results from multiple agents
   */
  private aggregateResults(results: AgentResult[]): AgentResult[] {
    const successful = results.filter(r => r.status === 'completed')
    const failed = results.filter(r => r.status === 'failed')
    const timeouts = results.filter(r => r.status === 'timeout')
    
    console.log(`\nAggregation Summary:`)
    console.log(`- Successful: ${successful.length}`)
    console.log(`- Failed: ${failed.length}`)
    console.log(`- Timeouts: ${timeouts.length}`)
    
    // Sort by priority or completion time
    return results.sort((a, b) => {
      // Completed first
      if (a.status === 'completed' && b.status !== 'completed') return -1
      if (b.status === 'completed' && a.status !== 'completed') return 1
      
      // Then by end time
      return (b.endTime || 0) - (a.endTime || 0)
    })
  }
  
  /**
   * Get status of all active agents
   */
  getStatus(): Map<string, AgentResult> {
    return new Map(this.activeAgents)
  }
  
  /**
   * Cancel a running agent
   */
  async cancelAgent(taskId: string): Promise<boolean> {
    const agent = this.activeAgents.get(taskId)
    if (!agent || agent.status !== 'running') {
      return false
    }
    
    // In production, this would kill the subagent process
    this.activeAgents.set(taskId, {
      ...agent,
      status: 'failed',
      error: 'Cancelled by user',
      endTime: Date.now()
    })
    
    return true
  }
  
  /**
   * Wait for specific agent to complete
   */
  async waitForAgent(taskId: string, timeout?: number): Promise<AgentResult | null> {
    const startTime = Date.now()
    
    while (true) {
      const agent = this.activeAgents.get(taskId)
      
      if (!agent) {
        return null
      }
      
      if (agent.status === 'completed' || agent.status === 'failed' || agent.status === 'timeout') {
        return agent
      }
      
      // Check timeout
      if (timeout && Date.now() - startTime > timeout) {
        return null
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  /**
   * Create code review agents (3 parallel)
   */
  async createCodeReviewAgents(diff: string): Promise<AgentResult[]> {
    const tasks: AgentTask[] = [
      {
        id: 'review-reuse',
        name: 'Code Reuse Review',
        description: 'Review for code reuse opportunities',
        prompt: `# Code Reuse Review

Review the following diff for code reuse opportunities:

${diff}

Look for:
1. Duplicated functionality
2. Missing utility usage
3. Inline logic that could use helpers

Report findings with specific suggestions.`,
        priority: 'high'
      },
      {
        id: 'review-quality',
        name: 'Code Quality Review',
        description: 'Review for code quality issues',
        prompt: `# Code Quality Review

Review the following diff for quality issues:

${diff}

Look for:
1. Redundant state
2. Parameter sprawl
3. Copy-paste patterns
4. Leaky abstractions
5. Unnecessary comments

Report findings with specific issues.`,
        priority: 'high'
      },
      {
        id: 'review-efficiency',
        name: 'Efficiency Review',
        description: 'Review for efficiency issues',
        prompt: `# Efficiency Review

Review the following diff for efficiency issues:

${diff}

Look for:
1. Unnecessary work
2. Missed concurrency
3. Hot-path bloat
4. Memory issues
5. Overly broad operations

Report findings with optimization suggestions.`,
        priority: 'high'
      }
    ]
    
    return this.executeParallel(tasks, {
      maxConcurrency: 3,
      continueOnError: true,
      aggregateResults: true
    })
  }
  
  /**
   * Create research agents (parallel exploration)
   */
  async createResearchAgents(topic: string, angles: string[]): Promise<AgentResult[]> {
    const tasks: AgentTask[] = angles.map((angle, index) => ({
      id: `research-${index}`,
      name: `Research: ${angle}`,
      description: `Research ${topic} from ${angle} angle`,
      prompt: `# Research Task

Topic: ${topic}
Angle: ${angle}

Explore this topic from the specified angle. Provide:
1. Key findings
2. Relevant sources
3. Insights and implications

Be thorough but concise.`,
      priority: 'normal'
    }))
    
    return this.executeParallel(tasks, {
      maxConcurrency: angles.length,
      continueOnError: true,
      aggregateResults: true
    })
  }
}

// Singleton instance
export const agentCoordinator = new AgentCoordinator()

// Convenience exports
export const executeParallelAgents = (
  tasks: AgentTask[],
  options?: ParallelExecutionOptions
) => agentCoordinator.executeParallel(tasks, options)

export const createCodeReview = (diff: string) =>
  agentCoordinator.createCodeReviewAgents(diff)

export const createResearch = (topic: string, angles: string[]) =>
  agentCoordinator.createResearchAgents(topic, angles)
