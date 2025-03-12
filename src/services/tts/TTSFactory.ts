
import { TTSProvider, TTSProviderConfig } from './TTSProvider';
import { ElevenLabsProvider, ElevenLabsConfig } from './providers/ElevenLabsProvider';
import { AmazonPollyProvider, AmazonPollyConfig } from './providers/AmazonPollyProvider';

// Add more providers as needed
export type TTSProviderType = 'elevenlabs' | 'amazon-polly';

/**
 * TTS Factory to create provider instances
 */
export class TTSFactory {
  private static providers: Map<TTSProviderType, TTSProvider> = new Map();
  private static activeProvider: TTSProviderType | null = null;

  /**
   * Register a provider instance
   */
  static registerProvider(type: TTSProviderType, provider: TTSProvider): void {
    this.providers.set(type, provider);
    
    // If this is the first provider, make it active
    if (this.activeProvider === null) {
      this.activeProvider = type;
    }
  }

  /**
   * Create a provider of the specified type
   */
  static createProvider(type: TTSProviderType, config?: TTSProviderConfig): TTSProvider {
    let provider: TTSProvider;

    switch (type) {
      case 'elevenlabs':
        // Create a properly typed config for ElevenLabs
        const elevenLabsConfig: ElevenLabsConfig = {
          apiKey: config?.apiKey || '',
          ...config
        };
        provider = new ElevenLabsProvider(elevenLabsConfig);
        break;
      case 'amazon-polly':
        // Create a properly typed config for Amazon Polly
        const amazonPollyConfig: AmazonPollyConfig = {
          region: config?.region || 'us-east-1',
          ...config
        };
        provider = new AmazonPollyProvider(amazonPollyConfig);
        break;
      default:
        throw new Error(`Unsupported TTS provider type: ${type}`);
    }

    this.registerProvider(type, provider);
    return provider;
  }

  /**
   * Get a provider instance by type
   */
  static getProvider(type: TTSProviderType): TTSProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Set the active provider
   */
  static setActiveProvider(type: TTSProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Provider ${type} is not registered`);
    }
    this.activeProvider = type;
  }

  /**
   * Get the currently active provider
   */
  static getActiveProvider(): TTSProvider {
    if (!this.activeProvider || !this.providers.has(this.activeProvider)) {
      throw new Error('No active TTS provider available');
    }
    return this.providers.get(this.activeProvider)!;
  }

  /**
   * Get the type of the currently active provider
   */
  static getActiveProviderType(): TTSProviderType | null {
    return this.activeProvider;
  }

  /**
   * Get all registered provider types
   */
  static getRegisteredProviderTypes(): TTSProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Clear all registered providers
   */
  static clear(): void {
    this.providers.clear();
    this.activeProvider = null;
  }
}
