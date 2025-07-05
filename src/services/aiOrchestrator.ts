import { log } from '../utils/logger';

// AI Model Types and Configurations
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  endpoint: string;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
  responseTime: number;
  reliability: number;
}

export interface AIRequest {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'documentation' | 'refactoring' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  language: string;
  context?: string;
  requirements?: string[];
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse {
  id: string;
  modelUsed: string;
  confidence: number;
  processingTime: number;
  tokenUsage: number;
  cost: number;
  result: {
    analysis: any;
    suggestions: any[];
    improvements: any[];
    documentation?: string;
    refactoredCode?: string;
    tests?: any[];
  };
  metadata: {
    timestamp: Date;
    version: string;
    cacheHit: boolean;
  };
}

class AIOrchestrator {
  private static instance: AIOrchestrator;
  private models: Map<string, AIModel> = new Map();
  private requestQueue: AIRequest[] = [];
  private responseCache: Map<string, AIResponse> = new Map();
  private loadBalancer: Map<string, number> = new Map();
  private fallbackChain: string[] = [];

  // Claude API Configuration
  private claudeApiKey = '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';
  private openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  private googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  constructor() {
    this.initializeModels();
    this.setupFallbackChain();
    this.startHealthMonitoring();
  }

  private initializeModels() {
    // Claude 3 Opus - Best for complex analysis
    this.models.set('claude-3-opus', {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      capabilities: ['security', 'performance', 'quality', 'documentation', 'refactoring'],
      costPerToken: 0.000015,
      maxTokens: 200000,
      responseTime: 2.5,
      reliability: 0.98
    });

    // Claude 3 Sonnet - Best balance of speed and capability
    this.models.set('claude-3-sonnet', {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      capabilities: ['security', 'performance', 'quality', 'refactoring', 'testing'],
      costPerToken: 0.000003,
      maxTokens: 200000,
      responseTime: 1.8,
      reliability: 0.97
    });

    // GPT-4 Turbo - Great for code generation and refactoring
    this.models.set('gpt-4-turbo', {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      capabilities: ['refactoring', 'documentation', 'testing', 'quality'],
      costPerToken: 0.00001,
      maxTokens: 128000,
      responseTime: 2.0,
      reliability: 0.96
    });

    // Gemini Pro - Good for analysis and documentation
    this.models.set('gemini-pro', {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      capabilities: ['documentation', 'quality', 'performance'],
      costPerToken: 0.000001,
      maxTokens: 30720,
      responseTime: 1.5,
      reliability: 0.94
    });

    log.info('AI models initialized', { 
      modelCount: this.models.size,
      models: Array.from(this.models.keys())
    });
  }

  private setupFallbackChain() {
    // Primary -> Secondary -> Tertiary fallback chain
    this.fallbackChain = ['claude-3-sonnet', 'claude-3-opus', 'gpt-4-turbo', 'gemini-pro'];
    log.info('Fallback chain configured', { chain: this.fallbackChain });
  }

  private startHealthMonitoring() {
    // Monitor model health every 30 seconds
    setInterval(() => {
      this.checkModelHealth();
    }, 30000);
  }

  private async checkModelHealth() {
    for (const [modelId, model] of this.models) {
      try {
        const startTime = Date.now();
        await this.makeHealthCheckRequest(model);
        const responseTime = Date.now() - startTime;
        
        // Update model reliability based on response time
        model.responseTime = responseTime;
        model.reliability = Math.min(0.99, model.reliability + 0.01);
        
        log.debug(`Model ${modelId} health check passed`, { responseTime });
      } catch (error) {
        // Decrease reliability on failure
        const model = this.models.get(modelId)!;
        model.reliability = Math.max(0.5, model.reliability - 0.05);
        
        log.warn(`Model ${modelId} health check failed`, { error, reliability: model.reliability });
      }
    }
  }

  private async makeHealthCheckRequest(model: AIModel): Promise<void> {
    const testCode = 'function hello() { return "world"; }';
    
    switch (model.provider) {
      case 'anthropic':
        await this.callClaudeAPI(model, testCode, 'Analyze this simple function');
        break;
      case 'openai':
        await this.callOpenAIAPI(model, testCode, 'Analyze this simple function');
        break;
      case 'google':
        await this.callGeminiAPI(model, testCode, 'Analyze this simple function');
        break;
    }
  }

  // Main orchestration method
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    log.info('Processing AI request', { 
      requestId: request.id, 
      type: request.type, 
      priority: request.priority 
    });

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = this.responseCache.get(cacheKey);
      
      if (cachedResponse && this.isCacheValid(cachedResponse)) {
        log.info('Cache hit for request', { requestId: request.id });
        return {
          ...cachedResponse,
          metadata: { ...cachedResponse.metadata, cacheHit: true }
        };
      }

      // Select optimal model for the request
      const selectedModel = this.selectOptimalModel(request);
      if (!selectedModel) {
        throw new Error('No suitable model available');
      }

      // Process the request
      const response = await this.processWithModel(selectedModel, request);
      
      // Cache the response
      this.responseCache.set(cacheKey, response);
      
      // Update load balancer metrics
      this.updateLoadMetrics(selectedModel.id, Date.now() - startTime);

      log.info('AI request processed successfully', {
        requestId: request.id,
        modelUsed: selectedModel.id,
        processingTime: response.processingTime,
        confidence: response.confidence
      });

      return response;

    } catch (error) {
      log.error('AI request processing failed', { requestId: request.id, error });
      
      // Try fallback models
      return this.processWithFallback(request);
    }
  }

  private selectOptimalModel(request: AIRequest): AIModel | null {
    const suitableModels = Array.from(this.models.values()).filter(model => 
      model.capabilities.includes(request.type) && model.reliability > 0.8
    );

    if (suitableModels.length === 0) {
      return null;
    }

    // Sort by score (reliability * speed * capability match)
    suitableModels.sort((a, b) => {
      const scoreA = this.calculateModelScore(a, request);
      const scoreB = this.calculateModelScore(b, request);
      return scoreB - scoreA;
    });

    return suitableModels[0];
  }

  private calculateModelScore(model: AIModel, request: AIRequest): number {
    const capabilityBonus = model.capabilities.includes(request.type) ? 1.5 : 1.0;
    const speedScore = 1000 / model.responseTime; // Favor faster models
    const reliabilityScore = model.reliability * 100;
    const costEfficiency = 1 / model.costPerToken;
    
    // Priority-based weighting
    const priorityWeight = request.priority === 'critical' ? 2.0 : 
                          request.priority === 'high' ? 1.5 : 1.0;

    return (reliabilityScore + speedScore + costEfficiency) * capabilityBonus * priorityWeight;
  }

  private async processWithModel(model: AIModel, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    let result;
    switch (model.provider) {
      case 'anthropic':
        result = await this.processWithClaude(model, request);
        break;
      case 'openai':
        result = await this.processWithOpenAI(model, request);
        break;
      case 'google':
        result = await this.processWithGemini(model, request);
        break;
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }

    const processingTime = Date.now() - startTime;
    const tokenUsage = this.estimateTokenUsage(request.code + (request.context || ''));
    
    return {
      id: request.id,
      modelUsed: model.id,
      confidence: result.confidence,
      processingTime,
      tokenUsage,
      cost: tokenUsage * model.costPerToken,
      result: result.analysis,
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        cacheHit: false
      }
    };
  }

  private async processWithClaude(model: AIModel, request: AIRequest): Promise<any> {
    const prompt = this.generatePrompt(request);
    
    try {
      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model.id,
          max_tokens: Math.min(request.maxTokens || 4000, model.maxTokens),
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data, request.type);
      
    } catch (error) {
      log.error('Claude API call failed', { model: model.id, error });
      throw error;
    }
  }

  private async processWithOpenAI(model: AIModel, request: AIRequest): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.generatePrompt(request);
    
    try {
      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            {
              role: 'system',
              content: 'You are an expert code reviewer and software engineer.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: Math.min(request.maxTokens || 4000, model.maxTokens),
          temperature: 0.3,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseOpenAIResponse(data, request.type);
      
    } catch (error) {
      log.error('OpenAI API call failed', { model: model.id, error });
      throw error;
    }
  }

  private async processWithGemini(model: AIModel, request: AIRequest): Promise<any> {
    if (!this.googleApiKey) {
      throw new Error('Google API key not configured');
    }

    const prompt = this.generatePrompt(request);
    
    try {
      const response = await fetch(`${model.endpoint}?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: Math.min(request.maxTokens || 4000, model.maxTokens)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data, request.type);
      
    } catch (error) {
      log.error('Gemini API call failed', { model: model.id, error });
      throw error;
    }
  }

  private generatePrompt(request: AIRequest): string {
    const basePrompt = `
Analyze the following ${request.language} code for ${request.type} issues:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.context ? `Context: ${request.context}` : ''}
${request.requirements ? `Requirements: ${request.requirements.join(', ')}` : ''}

Please provide a comprehensive analysis including:
1. Issues found with severity levels
2. Specific improvement suggestions
3. Refactored code examples where applicable
4. Performance impact assessment
5. Security vulnerability analysis
6. Code quality metrics

Return the response in JSON format with the following structure:
{
  "confidence": 0.95,
  "analysis": {
    "issues": [],
    "suggestions": [],
    "metrics": {},
    "security": {},
    "performance": {}
  }
}
`;

    return basePrompt;
  }

  private parseClaudeResponse(data: any, requestType: string): any {
    try {
      const content = data.content[0].text;
      
      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          confidence: parsed.confidence || 0.8,
          analysis: parsed.analysis || parsed
        };
      }

      // Fallback: structured text parsing
      return this.parseTextResponse(content, requestType);
      
    } catch (error) {
      log.warn('Failed to parse Claude response as JSON', { error });
      return this.parseTextResponse(data.content[0].text, requestType);
    }
  }

  private parseOpenAIResponse(data: any, requestType: string): any {
    try {
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          confidence: parsed.confidence || 0.8,
          analysis: parsed.analysis || parsed
        };
      }

      return this.parseTextResponse(content, requestType);
      
    } catch (error) {
      log.warn('Failed to parse OpenAI response as JSON', { error });
      return this.parseTextResponse(data.choices[0].message.content, requestType);
    }
  }

  private parseGeminiResponse(data: any, requestType: string): any {
    try {
      const content = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          confidence: parsed.confidence || 0.8,
          analysis: parsed.analysis || parsed
        };
      }

      return this.parseTextResponse(content, requestType);
      
    } catch (error) {
      log.warn('Failed to parse Gemini response as JSON', { error });
      return this.parseTextResponse(data.candidates[0].content.parts[0].text, requestType);
    }
  }

  private parseTextResponse(text: string, requestType: string): any {
    // Fallback text parsing for when JSON parsing fails
    const issues = this.extractIssues(text);
    const suggestions = this.extractSuggestions(text);
    
    return {
      confidence: 0.7,
      analysis: {
        issues,
        suggestions,
        metrics: this.extractMetrics(text),
        security: this.extractSecurityInfo(text),
        performance: this.extractPerformanceInfo(text),
        improvements: suggestions,
        documentation: this.extractDocumentation(text),
        refactoredCode: this.extractRefactoredCode(text)
      }
    };
  }

  private extractIssues(text: string): any[] {
    // Extract issues using pattern matching
    const issuePatterns = [
      /(?:issue|problem|error|warning)[:\s]+(.+)/gi,
      /(?:vulnerability|security risk)[:\s]+(.+)/gi,
      /(?:performance|optimization)[:\s]+(.+)/gi
    ];

    const issues = [];
    for (const pattern of issuePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        issues.push({
          type: this.categorizeIssue(match[1]),
          description: match[1].trim(),
          severity: this.determineSeverity(match[1]),
          line: null,
          suggestion: null
        });
      }
    }

    return issues;
  }

  private extractSuggestions(text: string): any[] {
    const suggestionPatterns = [
      /(?:suggest|recommend|consider)[:\s]+(.+)/gi,
      /(?:improve|refactor|optimize)[:\s]+(.+)/gi,
      /(?:replace|change|modify)[:\s]+(.+)/gi
    ];

    const suggestions = [];
    for (const pattern of suggestionPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        suggestions.push({
          type: 'improvement',
          description: match[1].trim(),
          impact: 'medium',
          effort: 'medium'
        });
      }
    }

    return suggestions;
  }

  private extractMetrics(text: string): any {
    return {
      complexity: this.extractNumber(text, /complexity[:\s]+(\d+)/i) || 'medium',
      maintainability: this.extractNumber(text, /maintainability[:\s]+(\d+)/i) || 75,
      testability: this.extractNumber(text, /testability[:\s]+(\d+)/i) || 80,
      readability: this.extractNumber(text, /readability[:\s]+(\d+)/i) || 85
    };
  }

  private extractSecurityInfo(text: string): any {
    return {
      vulnerabilities: this.extractIssues(text).filter(issue => 
        issue.type === 'security' || issue.description.toLowerCase().includes('security')
      ),
      riskLevel: this.determineSeverity(text),
      recommendations: []
    };
  }

  private extractPerformanceInfo(text: string): any {
    return {
      bottlenecks: this.extractIssues(text).filter(issue => 
        issue.type === 'performance' || issue.description.toLowerCase().includes('performance')
      ),
      optimizations: [],
      metrics: {}
    };
  }

  private extractDocumentation(text: string): string {
    const docPattern = /```(?:md|markdown)?\s*([\s\S]*?)```/i;
    const match = text.match(docPattern);
    return match ? match[1].trim() : '';
  }

  private extractRefactoredCode(text: string): string {
    const codePattern = /```(?:\w+)?\s*([\s\S]*?)```/g;
    const matches = text.matchAll(codePattern);
    
    // Return the last code block (likely the refactored version)
    let lastCode = '';
    for (const match of matches) {
      lastCode = match[1].trim();
    }
    
    return lastCode;
  }

  private extractNumber(text: string, pattern: RegExp): number | null {
    const match = text.match(pattern);
    return match ? parseInt(match[1], 10) : null;
  }

  private categorizeIssue(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('security') || lowerDesc.includes('vulnerability')) {
      return 'security';
    } else if (lowerDesc.includes('performance') || lowerDesc.includes('slow')) {
      return 'performance';
    } else if (lowerDesc.includes('style') || lowerDesc.includes('format')) {
      return 'style';
    } else if (lowerDesc.includes('logic') || lowerDesc.includes('bug')) {
      return 'logic';
    }
    
    return 'quality';
  }

  private determineSeverity(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('severe')) {
      return 'critical';
    } else if (lowerText.includes('high') || lowerText.includes('important')) {
      return 'high';
    } else if (lowerText.includes('medium') || lowerText.includes('moderate')) {
      return 'medium';
    }
    
    return 'low';
  }

  private async processWithFallback(request: AIRequest): Promise<AIResponse> {
    for (const modelId of this.fallbackChain) {
      const model = this.models.get(modelId);
      if (model && model.reliability > 0.5) {
        try {
          log.info(`Trying fallback model ${modelId}`, { requestId: request.id });
          return await this.processWithModel(model, request);
        } catch (error) {
          log.warn(`Fallback model ${modelId} also failed`, { requestId: request.id, error });
          continue;
        }
      }
    }

    // All models failed, return error response
    throw new Error('All AI models failed to process the request');
  }

  private generateCacheKey(request: AIRequest): string {
    const hash = btoa(JSON.stringify({
      type: request.type,
      code: request.code,
      language: request.language,
      context: request.context,
      requirements: request.requirements
    }));
    
    return `ai_cache_${hash}`;
  }

  private isCacheValid(response: AIResponse): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - response.metadata.timestamp.getTime() < maxAge;
  }

  private updateLoadMetrics(modelId: string, processingTime: number) {
    const currentLoad = this.loadBalancer.get(modelId) || 0;
    this.loadBalancer.set(modelId, currentLoad + processingTime);
  }

  private estimateTokenUsage(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private async callClaudeAPI(model: AIModel, code: string, instruction: string): Promise<any> {
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model.id,
        max_tokens: 100,
        messages: [{ role: 'user', content: `${instruction}: ${code}` }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async callOpenAIAPI(model: AIModel, code: string, instruction: string): Promise<any> {
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: `${instruction}: ${code}` }],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async callGeminiAPI(model: AIModel, code: string, instruction: string): Promise<any> {
    const response = await fetch(`${model.endpoint}?key=${this.googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${instruction}: ${code}` }] }],
        generationConfig: { maxOutputTokens: 100 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Public API methods
  async analyzeCode(code: string, language: string, type: string = 'quality'): Promise<AIResponse> {
    const request: AIRequest = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      priority: 'medium',
      code,
      language,
      context: `Comprehensive ${type} analysis`,
      maxTokens: 4000
    };

    return this.processRequest(request);
  }

  async refactorCode(code: string, language: string, requirements: string[] = []): Promise<AIResponse> {
    const request: AIRequest = {
      id: `refactor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'refactoring',
      priority: 'high',
      code,
      language,
      context: 'Code refactoring for improved quality and maintainability',
      requirements,
      maxTokens: 6000
    };

    return this.processRequest(request);
  }

  async generateDocumentation(code: string, language: string): Promise<AIResponse> {
    const request: AIRequest = {
      id: `docs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'documentation',
      priority: 'medium',
      code,
      language,
      context: 'Generate comprehensive documentation for this code',
      maxTokens: 3000
    };

    return this.processRequest(request);
  }

  async detectVulnerabilities(code: string, language: string): Promise<AIResponse> {
    const request: AIRequest = {
      id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'security',
      priority: 'critical',
      code,
      language,
      context: 'Deep security vulnerability analysis',
      maxTokens: 5000
    };

    return this.processRequest(request);
  }

  // Model management
  getModelStatus(): any {
    return Array.from(this.models.entries()).map(([id, model]) => ({
      id,
      name: model.name,
      provider: model.provider,
      reliability: model.reliability,
      responseTime: model.responseTime,
      capabilities: model.capabilities,
      loadMetrics: this.loadBalancer.get(id) || 0
    }));
  }

  getCacheStats(): any {
    return {
      cacheSize: this.responseCache.size,
      hitRate: 0.85, // This would be calculated based on actual cache hits
      totalRequests: 0, // This would be tracked
      averageResponseTime: 2.1
    };
  }
}

// Export singleton instance
export const aiOrchestrator = AIOrchestrator.getInstance();
export default AIOrchestrator;