import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 if title is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ description: 'Test description' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Title is required');
  });

  it('should return 400 if description is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test title' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Description is required');
  });

  it('should simulate success when GITHUB_TOKEN is not set', async () => {
    delete process.env.GITHUB_TOKEN;

    const req = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Title', description: 'Test Description' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('simulated');
  });
});
