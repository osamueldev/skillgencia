import { describe, it, expect } from 'vitest';
import { findDueScheduledPosts } from '../../src/lib/server/scheduler';

describe('scheduler', () => {
  it('exports findDueScheduledPosts function', () => {
    expect(typeof findDueScheduledPosts).toBe('function');
  });
});
