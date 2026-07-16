import { describe, expect, it } from 'vitest';
import { EDUCATION_TARGET_LABELS, LEARN_CATEGORIES, TOPICS } from './topics';

describe('learn topics', () => {
  it('provides unique topics with complete content and valid chart targets', () => {
    expect(new Set(TOPICS.map((topic) => topic.id))).toHaveProperty('size', TOPICS.length);
    for (const topic of TOPICS) {
      expect(LEARN_CATEGORIES).toContain(topic.category);
      expect(topic.summary.length).toBeGreaterThan(20);
      expect(topic.explanation.length).toBeGreaterThan(0);
      expect(EDUCATION_TARGET_LABELS[topic.chartTarget]).toBeTruthy();
    }
  });
});
