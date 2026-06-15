import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getGitHubUser, forkRepository, commitFile, createPullRequest } from '../githubHelper.js';

describe('GitHub API Helper', () => {
  let originalFetch: any;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('should fetch user information successfully', async () => {
    const mockUser = { login: 'octocat' };
    const mockFetch = jest.fn() as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUser
    } as any);
    globalThis.fetch = mockFetch;

    const user = await getGitHubUser('fake-token');
    expect(user.login).toBe('octocat');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.any(Object)
    );
  });

  it('should trigger fork successfully', async () => {
    const mockFetch = jest.fn() as any;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Forking' })
    } as any);
    globalThis.fetch = mockFetch;

    const res = await forkRepository('fake-token', 'anthropics', 'skills');
    expect(res.message).toBe('Forking');
  });
});
