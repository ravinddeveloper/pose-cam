import { LocalRuleBasedAIProvider } from '../ai/localAiProvider';

describe('LocalRuleBasedAIProvider', () => {
  const provider = new LocalRuleBasedAIProvider();

  it('should identify solo requests and return structured recommendations', async () => {
    const results = await provider.generateRecommendations(
      'Suggest 4 natural poses for a solo travel photo in a blue dress near a waterfall'
    );

    expect(results.length).toBeGreaterThan(0);
    const first = results[0];
    expect(first.title).toBeDefined();
    expect(first.stepByStepInstructions.length).toBeGreaterThan(0);
    expect(first.handAndLegPlacement).toBeDefined();
    expect(first.headAndExpression).toBeDefined();
    expect(first.cameraAngleAndFraming).toBeDefined();
    expect(first.provider).toBe('local-offline');
  });

  it('should identify couple requests', async () => {
    const results = await provider.generateRecommendations(
      'Romantic sunset beach photo for a couple'
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].reason).toContain('photo');
  });
});
