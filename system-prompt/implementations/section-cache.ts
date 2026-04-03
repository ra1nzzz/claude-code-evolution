/**
 * Section Cache Implementation
 * Based on Claude Code's systemPromptSections.ts
 * 
 * Provides memoized system prompt sections with cache management
 */

interface SystemPromptSection {
  name: string
  compute: () => string | null | Promise<string | null>
  cacheBreak: boolean  // true = recompute every turn
  lastComputed?: number
  cachedValue?: string | null
}

interface CacheEntry {
  value: string | null
  timestamp: number
  hash: string
}

class SystemPromptCache {
  private cache: Map<string, CacheEntry> = new Map()
  private sections: Map<string, SystemPromptSection> = new Map()
  private static readonly DYNAMIC_BOUNDARY = '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__'
  
  /**
   * Register a new system prompt section
   */
  registerSection(section: SystemPromptSection): void {
    this.sections.set(section.name, section)
  }
  
  /**
   * Create a memoized section (cached until clear/compact)
   */
  createCachedSection(
    name: string,
    compute: () => string | null | Promise<string | null>
  ): SystemPromptSection {
    return {
      name,
      compute,
      cacheBreak: false
    }
  }
  
  /**
   * Create a volatile section (recomputes every turn)
   * Use sparingly - requires reason for cache breaking
   */
  createVolatileSection(
    name: string,
    compute: () => string | null | Promise<string | null>,
    _reason: string  // Document why cache breaking is necessary
  ): SystemPromptSection {
    return {
      name,
      compute,
      cacheBreak: true
    }
  }
  
  /**
   * Resolve all sections, returning prompt strings
   */
  async resolveSections(sectionNames?: string[]): Promise<Map<string, string | null>> {
    const names = sectionNames || Array.from(this.sections.keys())
    const results = new Map<string, string | null>()
    
    await Promise.all(
      names.map(async (name) => {
        const section = this.sections.get(name)
        if (!section) {
          results.set(name, null)
          return
        }
        
        const value = await this.resolveSection(section)
        results.set(name, value)
      })
    )
    
    return results
  }
  
  /**
   * Resolve a single section
   */
  private async resolveSection(section: SystemPromptSection): Promise<string | null> {
    // If cache breaking is enabled, always recompute
    if (section.cacheBreak) {
      return await section.compute()
    }
    
    // Check cache
    const cached = this.cache.get(section.name)
    if (cached) {
      return cached.value
    }
    
    // Compute and cache
    const value = await section.compute()
    this.cache.set(section.name, {
      value,
      timestamp: Date.now(),
      hash: this.computeHash(value)
    })
    
    return value
  }
  
  /**
   * Build complete system prompt with boundary markers
   */
  async buildSystemPrompt(
    staticSections: string[],
    dynamicSections: string[]
  ): Promise<string[]> {
    const prompt: string[] = []
    
    // Resolve static sections (cached)
    const staticResults = await this.resolveSections(staticSections)
    for (const [name, value] of staticResults) {
      if (value) {
        prompt.push(`<!-- Section: ${name} -->`)
        prompt.push(value)
      }
    }
    
    // Add dynamic boundary
    prompt.push(SystemPromptCache.DYNAMIC_BOUNDARY)
    
    // Resolve dynamic sections (may recompute)
    const dynamicResults = await this.resolveSections(dynamicSections)
    for (const [name, value] of dynamicResults) {
      if (value) {
        prompt.push(`<!-- Section: ${name} (dynamic) -->`)
        prompt.push(value)
      }
    }
    
    return prompt
  }
  
  /**
   * Clear all cached sections
   * Called on /clear or /compact
   */
  clearCache(): void {
    this.cache.clear()
  }
  
  /**
   * Clear specific section
   */
  clearSection(name: string): void {
    this.cache.delete(name)
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalSections: number
    cachedSections: number
    cacheSize: number
  } {
    return {
      totalSections: this.sections.size,
      cachedSections: this.cache.size,
      cacheSize: this.computeCacheSize()
    }
  }
  
  /**
   * Compute hash for cache validation
   */
  private computeHash(value: string | null): string {
    if (!value) return ''
    // Simple hash - in production use crypto.createHash
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }
  
  /**
   * Compute approximate cache size in bytes
   */
  private computeCacheSize(): number {
    let size = 0
    for (const [key, entry] of this.cache) {
      size += key.length * 2
      size += (entry.value?.length || 0) * 2
      size += 24 // timestamp + hash overhead
    }
    return size
  }
}

// Singleton instance
export const systemPromptCache = new SystemPromptCache()

// Convenience functions
export const systemPromptSection = (
  name: string,
  compute: () => string | null | Promise<string | null>
) => systemPromptCache.createCachedSection(name, compute)

export const DANGEROUS_uncachedSystemPromptSection = (
  name: string,
  compute: () => string | null | Promise<string | null>,
  reason: string
) => systemPromptCache.createVolatileSection(name, compute, reason)

export const resolveSystemPromptSections = (
  sections: SystemPromptSection[]
) => {
  sections.forEach(s => systemPromptCache.registerSection(s))
  return systemPromptCache.resolveSections()
}

export const clearSystemPromptSections = () => {
  systemPromptCache.clearCache()
}
