/**
 * Memory Manager
 * Three-layer memory system based on Claude Code
 * CLAUDE.md / CLAUDE.local.md / Auto-memory
 */

import * as fs from 'fs/promises'
import * as path from 'path'

interface MemoryLayer {
  name: string
  path: string
  scope: 'project' | 'personal' | 'auto'
  content?: string
}

interface MemoryEntry {
  id: string
  content: string
  source: string
  timestamp: number
  confidence: 'high' | 'medium' | 'low'
  type: 'convention' | 'preference' | 'observation' | 'todo'
}

interface MemoryClassification {
  entry: MemoryEntry
  proposedDestination: 'CLAUDE.md' | 'CLAUDE.local.md' | 'team' | 'auto-memory'
  rationale: string
  isAmbiguous: boolean
}

interface MemoryReport {
  promotions: MemoryClassification[]
  cleanup: MemoryClassification[]
  ambiguous: MemoryClassification[]
  noAction: MemoryClassification[]
}

class MemoryManager {
  private workspaceRoot: string
  private memoryLayers: Map<string, MemoryLayer> = new Map()
  
  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot
    this.initializeLayers()
  }
  
  /**
   * Initialize memory layer definitions
   */
  private initializeLayers(): void {
    this.memoryLayers.set('CLAUDE.md', {
      name: 'CLAUDE.md',
      path: path.join(this.workspaceRoot, 'CLAUDE.md'),
      scope: 'project'
    })
    
    this.memoryLayers.set('CLAUDE.local.md', {
      name: 'CLAUDE.local.md',
      path: path.join(this.workspaceRoot, 'CLAUDE.local.md'),
      scope: 'personal'
    })
    
    this.memoryLayers.set('auto-memory', {
      name: 'Auto-memory',
      path: path.join(this.workspaceRoot, 'memory', 'auto-extracted.json'),
      scope: 'auto'
    })
  }
  
  /**
   * Load all memory layers
   */
  async loadAllLayers(): Promise<Map<string, MemoryLayer>> {
    const loaded = new Map<string, MemoryLayer>()
    
    for (const [name, layer] of this.memoryLayers) {
      try {
        const content = await fs.readFile(layer.path, 'utf-8')
        loaded.set(name, { ...layer, content })
      } catch (error) {
        // File doesn't exist, that's ok
        loaded.set(name, layer)
      }
    }
    
    return loaded
  }
  
  /**
   * Extract memories from session
   */
  async extractMemories(sessionContent: string): Promise<MemoryEntry[]> {
    const memories: MemoryEntry[] = []
    
    // Extract user preferences
    const preferencePatterns = [
      /I (?:prefer|like|want|don't want) (.+)/gi,
      /(?:always|never) (.+)/gi,
      /make sure to (.+)/gi
    ]
    
    for (const pattern of preferencePatterns) {
      let match
      while ((match = pattern.exec(sessionContent)) !== null) {
        memories.push({
          id: `pref-${Date.now()}-${memories.length}`,
          content: match[1].trim(),
          source: 'session',
          timestamp: Date.now(),
          confidence: 'medium',
          type: 'preference'
        })
      }
    }
    
    // Extract conventions
    const conventionPatterns = [
      /we (?:use|prefer|follow) (.+)/gi,
      /convention: (.+)/gi,
      /standard: (.+)/gi
    ]
    
    for (const pattern of conventionPatterns) {
      let match
      while ((match = pattern.exec(sessionContent)) !== null) {
        memories.push({
          id: `conv-${Date.now()}-${memories.length}`,
          content: match[1].trim(),
          source: 'session',
          timestamp: Date.now(),
          confidence: 'high',
          type: 'convention'
        })
      }
    }
    
    // Extract observations
    const observationPatterns = [
      /note: (.+)/gi,
      /observation: (.+)/gi,
      /remember: (.+)/gi
    ]
    
    for (const pattern of observationPatterns) {
      let match
      while ((match = pattern.exec(sessionContent)) !== null) {
        memories.push({
          id: `obs-${Date.now()}-${memories.length}`,
          content: match[1].trim(),
          source: 'session',
          timestamp: Date.now(),
          confidence: 'low',
          type: 'observation'
        })
      }
    }
    
    return memories
  }
  
  /**
   * Classify memory entries
   */
  classifyMemory(entry: MemoryEntry): MemoryClassification {
    let proposedDestination: MemoryClassification['proposedDestination']
    let rationale: string
    let isAmbiguous = false
    
    switch (entry.type) {
      case 'convention':
        proposedDestination = 'CLAUDE.md'
        rationale = 'Project convention applicable to all contributors'
        break
        
      case 'preference':
        proposedDestination = 'CLAUDE.local.md'
        rationale = 'Personal preference specific to user'
        
        // Check if it might be team-wide
        if (entry.content.includes('team') || entry.content.includes('we all')) {
          isAmbiguous = true
          rationale += ' (may be team-wide, please confirm)'
        }
        break
        
      case 'observation':
        proposedDestination = 'auto-memory'
        rationale = 'Working note, temporary context'
        
        // Check if it's actually a convention
        if (entry.confidence === 'high') {
          isAmbiguous = true
          rationale = 'High confidence observation - might be a convention?'
        }
        break
        
      default:
        proposedDestination = 'auto-memory'
        rationale = 'Unclear classification'
        isAmbiguous = true
    }
    
    return {
      entry,
      proposedDestination,
      rationale,
      isAmbiguous
    }
  }
  
  /**
   * Generate memory report
   */
  async generateReport(): Promise<MemoryReport> {
    const layers = await this.loadAllLayers()
    const report: MemoryReport = {
      promotions: [],
      cleanup: [],
      ambiguous: [],
      noAction: []
    }
    
    // Get auto-memory entries
    const autoMemory = layers.get('auto-memory')
    if (!autoMemory?.content) {
      return report
    }
    
    let entries: MemoryEntry[] = []
    try {
      entries = JSON.parse(autoMemory.content)
    } catch {
      // Not JSON, treat as raw content
    }
    
    // Classify each entry
    for (const entry of entries) {
      const classification = this.classifyMemory(entry)
      
      if (classification.isAmbiguous) {
        report.ambiguous.push(classification)
      } else if (classification.proposedDestination !== 'auto-memory') {
        report.promotions.push(classification)
      } else {
        report.noAction.push(classification)
      }
    }
    
    // Check for duplicates across layers
    const claudeMd = layers.get('CLAUDE.md')?.content || ''
    const claudeLocal = layers.get('CLAUDE.local.md')?.content || ''
    
    for (const entry of entries) {
      if (claudeMd.includes(entry.content) || claudeLocal.includes(entry.content)) {
        report.cleanup.push({
          entry,
          proposedDestination: 'auto-memory',
          rationale: 'Duplicate of existing entry in CLAUDE.md or CLAUDE.local.md',
          isAmbiguous: false
        })
      }
    }
    
    return report
  }
  
  /**
   * Render report to markdown
   */
  renderReport(report: MemoryReport): string {
    const lines: string[] = []
    
    lines.push('# Memory Review Report')
    lines.push('')
    lines.push(`Generated: ${new Date().toISOString()}`)
    lines.push('')
    
    // Promotions
    if (report.promotions.length > 0) {
      lines.push('## 📤 Promotions')
      lines.push('')
      report.promotions.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${item.entry.type}: ${item.entry.content.substring(0, 50)}...`)
        lines.push(`- **Proposed Destination**: ${item.proposedDestination}`)
        lines.push(`- **Rationale**: ${item.rationale}`)
        lines.push(`- **Confidence**: ${item.entry.confidence}`)
        lines.push('')
      })
    }
    
    // Cleanup
    if (report.cleanup.length > 0) {
      lines.push('## 🧹 Cleanup')
      lines.push('')
      report.cleanup.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${item.entry.content.substring(0, 50)}...`)
        lines.push(`- **Action**: Remove from auto-memory`)
        lines.push(`- **Rationale**: ${item.rationale}`)
        lines.push('')
      })
    }
    
    // Ambiguous
    if (report.ambiguous.length > 0) {
      lines.push('## ❓ Ambiguous')
      lines.push('')
      report.ambiguous.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${item.entry.content.substring(0, 50)}...`)
        lines.push(`- **Proposed**: ${item.proposedDestination}`)
        lines.push(`- **Question**: ${item.rationale}`)
        lines.push('')
      })
    }
    
    // No action
    if (report.noAction.length > 0) {
      lines.push(`## ✅ No Action Needed (${report.noAction.length} entries)`)
      lines.push('')
      lines.push('These entries should remain in auto-memory.')
      lines.push('')
    }
    
    // Summary
    lines.push('## Summary')
    lines.push('')
    lines.push(`- **Promotions**: ${report.promotions.length}`)
    lines.push(`- **Cleanup**: ${report.cleanup.length}`)
    lines.push(`- **Ambiguous**: ${report.ambiguous.length}`)
    lines.push(`- **No Action**: ${report.noAction.length}`)
    lines.push('')
    lines.push('Review each proposal and approve/reject individually.')
    
    return lines.join('\n')
  }
  
  /**
   * Promote memory entry to target layer
   */
  async promoteEntry(
    entry: MemoryEntry,
    target: 'CLAUDE.md' | 'CLAUDE.local.md'
  ): Promise<boolean> {
    const layer = this.memoryLayers.get(target)
    if (!layer) return false
    
    try {
      // Read existing content
      let content = ''
      try {
        content = await fs.readFile(layer.path, 'utf-8')
      } catch {
        // File doesn't exist, start fresh
      }
      
      // Append entry
      const entryText = `\n## ${entry.type}: ${new Date(entry.timestamp).toISOString()}\n\n${entry.content}\n`
      content += entryText
      
      // Write back
      await fs.mkdir(path.dirname(layer.path), { recursive: true })
      await fs.writeFile(layer.path, content, 'utf-8')
      
      return true
    } catch (error) {
      console.error(`Failed to promote entry: ${error}`)
      return false
    }
  }
  
  /**
   * Remove entry from auto-memory
   */
  async removeFromAutoMemory(entryId: string): Promise<boolean> {
    const layer = this.memoryLayers.get('auto-memory')
    if (!layer) return false
    
    try {
      const content = await fs.readFile(layer.path, 'utf-8')
      const entries: MemoryEntry[] = JSON.parse(content)
      
      const filtered = entries.filter(e => e.id !== entryId)
      
      await fs.writeFile(layer.path, JSON.stringify(filtered, null, 2), 'utf-8')
      
      return true
    } catch (error) {
      console.error(`Failed to remove entry: ${error}`)
      return false
    }
  }
  
  /**
   * Search memories
   */
  async searchMemories(query: string): Promise<MemoryEntry[]> {
    const layers = await this.loadAllLayers()
    const results: MemoryEntry[] = []
    
    // Search in auto-memory
    const autoMemory = layers.get('auto-memory')
    if (autoMemory?.content) {
      try {
        const entries: MemoryEntry[] = JSON.parse(autoMemory.content)
        results.push(...entries.filter(e => 
          e.content.toLowerCase().includes(query.toLowerCase())
        ))
      } catch {
        // Not JSON
      }
    }
    
    // Search in CLAUDE.md
    const claudeMd = layers.get('CLAUDE.md')
    if (claudeMd?.content?.toLowerCase().includes(query.toLowerCase())) {
      // Extract relevant sections
      const lines = claudeMd.content.split('\n')
      let currentSection = ''
      
      for (const line of lines) {
        if (line.startsWith('#')) {
          currentSection = line
        }
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `claude-md-${results.length}`,
            content: `${currentSection}\n${line}`,
            source: 'CLAUDE.md',
            timestamp: 0,
            confidence: 'high',
            type: 'convention'
          })
        }
      }
    }
    
    return results
  }
}

// Singleton instance
export const memoryManager = new MemoryManager()

// Convenience exports
export const reviewMemories = () => memoryManager.generateReport()
export const promoteMemory = (entry: MemoryEntry, target: 'CLAUDE.md' | 'CLAUDE.local.md') =>
  memoryManager.promoteEntry(entry, target)
export const searchMemories = (query: string) => memoryManager.searchMemories(query)
