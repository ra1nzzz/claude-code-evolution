/**
 * Dynamic Context Generator
 * Generates session-specific context for system prompt
 */

import * as os from 'os'
import * as path from 'path'

interface UserContext {
  name: string
  timezone: string
  language: string
  preferences: Record<string, any>
}

interface SessionContext {
  id: string
  startTime: string
  model: string
  channel: string
}

interface ProjectInfo {
  name: string
  path: string
  status: 'active' | 'inactive'
}

interface MemoryEntry {
  date: string
  summary: string
}

interface SystemInfo {
  os: string
  shell: string
  nodeVersion: string
  openclawVersion: string
}

interface DynamicContext {
  user: UserContext
  session: SessionContext
  cwd: string
  projects: ProjectInfo[]
  recentMemories: MemoryEntry[]
  todos: Array<{ status: string; task: string }>
  system: SystemInfo
  envVars: Array<{ name: string; value: string }>
  skills: Array<{ name: string; description: string }>
  specialConfig?: string
}

class ContextGenerator {
  /**
   * Generate complete dynamic context
   */
  async generateContext(): Promise<DynamicContext> {
    return {
      user: await this.getUserContext(),
      session: this.getSessionContext(),
      cwd: process.cwd(),
      projects: await this.getActiveProjects(),
      recentMemories: await this.getRecentMemories(),
      todos: await this.getTodos(),
      system: this.getSystemInfo(),
      envVars: this.getRelevantEnvVars(),
      skills: await this.getLoadedSkills(),
      specialConfig: await this.getSpecialConfig()
    }
  }
  
  /**
   * Get user context from config
   */
  private async getUserContext(): Promise<UserContext> {
    // In production, load from user config
    return {
      name: 'User',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'zh-CN',
      preferences: {
        responseStyle: 'direct',
        codeStyle: 'functional',
        autoCommit: false
      }
    }
  }
  
  /**
   * Get current session context
   */
  private getSessionContext(): SessionContext {
    return {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      model: process.env.OPENCLAW_MODEL || 'default',
      channel: process.env.OPENCLAW_CHANNEL || 'unknown'
    }
  }
  
  /**
   * Get active projects
   */
  private async getActiveProjects(): Promise<ProjectInfo[]> {
    // In production, scan workspace for git repos
    const cwd = process.cwd()
    return [{
      name: path.basename(cwd),
      path: cwd,
      status: 'active'
    }]
  }
  
  /**
   * Get recent memories from memory files
   */
  private async getRecentMemories(): Promise<MemoryEntry[]> {
    // In production, read from memory/ directory
    return []
  }
  
  /**
   * Get pending todos
   */
  private async getTodos(): Promise<Array<{ status: string; task: string }>> {
    // In production, load from task system
    return []
  }
  
  /**
   * Get system information
   */
  private getSystemInfo(): SystemInfo {
    return {
      os: `${os.type()} ${os.release()}`,
      shell: process.env.SHELL || 'unknown',
      nodeVersion: process.version,
      openclawVersion: process.env.OPENCLAW_VERSION || 'unknown'
    }
  }
  
  /**
   * Get relevant environment variables
   */
  private getRelevantEnvVars(): Array<{ name: string; value: string }> {
    const relevant = [
      'OPENCLAW_MODEL',
      'OPENCLAW_CHANNEL',
      'OPENCLAW_WORKSPACE',
      'NODE_ENV'
    ]
    
    return relevant
      .filter(name => process.env[name])
      .map(name => ({
        name,
        value: this.maskSensitiveValue(name, process.env[name]!)
      }))
  }
  
  /**
   * Mask sensitive values
   */
  private maskSensitiveValue(name: string, value: string): string {
    const sensitive = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD']
    const isSensitive = sensitive.some(s => name.toUpperCase().includes(s))
    
    if (isSensitive) {
      return value.substring(0, 4) + '****'
    }
    return value
  }
  
  /**
   * Get loaded skills
   */
  private async getLoadedSkills(): Promise<Array<{ name: string; description: string }>> {
    // In production, scan skills/ directory
    return [
      { name: 'claude-code-simplify', description: '代码审查和清理' },
      { name: 'claude-code-remember', description: '记忆管理和整理' },
      { name: 'claude-code-verify', description: '任务完成度验证' },
      { name: 'claude-code-debug', description: '系统化调试辅助' }
    ]
  }
  
  /**
   * Get special configuration
   */
  private async getSpecialConfig(): Promise<string | undefined> {
    // In production, check for special modes
    return undefined
  }
  
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
  
  /**
   * Render context to markdown
   */
  renderToMarkdown(context: DynamicContext): string {
    const lines: string[] = []
    
    lines.push('# Session Context')
    lines.push('')
    
    // User info
    lines.push('## User Information')
    lines.push(`- **Name**: ${context.user.name}`)
    lines.push(`- **Timezone**: ${context.user.timezone}`)
    lines.push(`- **Language**: ${context.user.language}`)
    lines.push('')
    
    // Session info
    lines.push('## Session State')
    lines.push(`- **Session ID**: ${context.session.id}`)
    lines.push(`- **Start Time**: ${context.session.startTime}`)
    lines.push(`- **Model**: ${context.session.model}`)
    lines.push(`- **Channel**: ${context.session.channel}`)
    lines.push('')
    
    // Working directory
    lines.push('## Current Working Directory')
    lines.push(`\`${context.cwd}\``)
    lines.push('')
    
    // Projects
    if (context.projects.length > 0) {
      lines.push('## Active Projects')
      context.projects.forEach(p => {
        lines.push(`- ${p.name}: ${p.path} (${p.status})`)
      })
      lines.push('')
    }
    
    // Recent memories
    if (context.recentMemories.length > 0) {
      lines.push('## Recent Memories')
      context.recentMemories.forEach(m => {
        lines.push(`- ${m.date}: ${m.summary}`)
      })
      lines.push('')
    }
    
    // Todos
    if (context.todos.length > 0) {
      lines.push('## Pending Todos')
      context.todos.forEach(t => {
        lines.push(`- [${t.status}] ${t.task}`)
      })
      lines.push('')
    }
    
    // System info
    lines.push('## System State')
    lines.push(`- **OS**: ${context.system.os}`)
    lines.push(`- **Shell**: ${context.system.shell}`)
    lines.push(`- **Node**: ${context.system.nodeVersion}`)
    lines.push(`- **OpenClaw**: ${context.system.openclawVersion}`)
    lines.push('')
    
    // Environment variables
    if (context.envVars.length > 0) {
      lines.push('## Environment Variables')
      context.envVars.forEach(e => {
        lines.push(`- ${e.name}: ${e.value}`)
      })
      lines.push('')
    }
    
    // Skills
    if (context.skills.length > 0) {
      lines.push('## Loaded Skills')
      context.skills.forEach(s => {
        lines.push(`- ${s.name}: ${s.description}`)
      })
      lines.push('')
    }
    
    return lines.join('\n')
  }
}

// Singleton instance
export const contextGenerator = new ContextGenerator()

// Convenience export
export const generateSessionContext = () => contextGenerator.generateContext()
export const renderSessionContext = async () => {
  const context = await contextGenerator.generateContext()
  return contextGenerator.renderToMarkdown(context)
}
