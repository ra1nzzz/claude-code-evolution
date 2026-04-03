/**
 * OpenClaw System Prompt Enhancements
 * Phase 3 Implementation
 * 
 * Integrates Claude Code best practices into OpenClaw:
 * - Section caching
 * - Dynamic context generation
 * - Agent coordination
 * - Memory management
 */

import { systemPromptCache, systemPromptSection, DANGEROUS_uncachedSystemPromptSection, clearSystemPromptSections } from './section-cache'
import { contextGenerator, generateSessionContext, renderSessionContext } from './context-generator'
import { agentCoordinator, executeParallelAgents, createCodeReview, createResearch } from './agent-coordinator'
import { memoryManager, reviewMemories, promoteMemory, searchMemories } from './memory-manager'

// Export all modules
export {
  // Section cache
  systemPromptCache,
  systemPromptSection,
  DANGEROUS_uncachedSystemPromptSection,
  clearSystemPromptSections,
  
  // Context generator
  contextGenerator,
  generateSessionContext,
  renderSessionContext,
  
  // Agent coordinator
  agentCoordinator,
  executeParallelAgents,
  createCodeReview,
  createResearch,
  
  // Memory manager
  memoryManager,
  reviewMemories,
  promoteMemory,
  searchMemories
}

/**
 * Initialize enhanced system prompt system
 */
export async function initializeEnhancedSystemPrompt(): Promise<void> {
  console.log('Initializing enhanced system prompt...')
  
  // Register static sections
  registerStaticSections()
  
  // Register dynamic sections
  registerDynamicSections()
  
  console.log('Enhanced system prompt initialized')
}

/**
 * Register static sections (cached across sessions)
 */
function registerStaticSections(): void {
  // Core identity
  systemPromptCache.registerSection(
    systemPromptSection('identity', async () => {
      try {
        const fs = await import('fs/promises')
        return await fs.readFile('../core/identity.md', 'utf-8')
      } catch {
        return null
      }
    })
  )
  
  // Safety rules
  systemPromptCache.registerSection(
    systemPromptSection('safety', async () => {
      try {
        const fs = await import('fs/promises')
        return await fs.readFile('../core/safety.md', 'utf-8')
      } catch {
        return null
      }
    })
  )
  
  // Capabilities
  systemPromptCache.registerSection(
    systemPromptSection('capabilities', async () => {
      try {
        const fs = await import('fs/promises')
        return await fs.readFile('../core/capabilities.md', 'utf-8')
      } catch {
        return null
      }
    })
  )
  
  // File operations guide
  systemPromptCache.registerSection(
    systemPromptSection('file-operations', async () => {
      try {
        const fs = await import('fs/promises')
        return await fs.readFile('../tools/file-operations.md', 'utf-8')
      } catch {
        return null
      }
    })
  )
  
  // Agent operations guide
  systemPromptCache.registerSection(
    systemPromptSection('agent-operations', async () => {
      try {
        const fs = await import('fs/promises')
        return await fs.readFile('../tools/agent-operations.md', 'utf-8')
      } catch {
        return null
      }
    })
  )
}

/**
 * Register dynamic sections (updated per session/turn)
 */
function registerDynamicSections(): void {
  // Session context (per session)
  systemPromptCache.registerSection(
    DANGEROUS_uncachedSystemPromptSection(
      'session-context',
      async () => renderSessionContext(),
      'Session-specific context that changes each session'
    )
  )
  
  // Recent memory (per turn)
  systemPromptCache.registerSection(
    DANGEROUS_uncachedSystemPromptSection(
      'recent-memory',
      async () => {
        // In production, fetch from memory system
        return '## Recent Memory\n\n[Memory content would be loaded here]'
      },
      'Recent conversation memory that updates each turn'
    )
  )
}

/**
 * Build complete system prompt
 */
export async function buildSystemPrompt(): Promise<string[]> {
  const staticSections = [
    'identity',
    'safety',
    'capabilities',
    'file-operations',
    'agent-operations'
  ]
  
  const dynamicSections = [
    'session-context',
    'recent-memory'
  ]
  
  return systemPromptCache.buildSystemPrompt(staticSections, dynamicSections)
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return systemPromptCache.getCacheStats()
}

/**
 * Clear all caches
 */
export function clearCaches(): void {
  systemPromptCache.clearCache()
}

// CLI interface
if (require.main === module) {
  // Run initialization
  initializeEnhancedSystemPrompt()
    .then(() => buildSystemPrompt())
    .then(prompt => {
      console.log('\n=== System Prompt Preview ===\n')
      console.log(prompt.slice(0, 5).join('\n'))
      console.log('\n...')
      console.log(`\nTotal sections: ${prompt.length}`)
      console.log('\n=== Cache Stats ===')
      console.log(getCacheStats())
    })
    .catch(console.error)
}
