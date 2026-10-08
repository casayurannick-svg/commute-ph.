import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN is not set in environment. Simulating feedback creation.');
      return NextResponse.json({
        success: true,
        message: 'Feedback received (simulated - GITHUB_TOKEN missing)',
      });
    }

    // Default target repo: casayurannick-svg/commute-ph
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'casayurannick-svg';
    const repoName = process.env.GITHUB_REPO_NAME || 'commute-ph';

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'CommutePH-Feedback-App',
        },
        body: JSON.stringify({
          title: `[User Feedback] ${title.trim()}`,
          body: `${description.trim()}\n\n---\n*Submitted via CommutePH Feedback Widget*`,
          labels: ['feedback', 'user-submitted'],
        }),
      }
    );

    if (!githubRes.ok) {
      const errorText = await githubRes.text();
      console.error('GitHub API error:', githubRes.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create GitHub issue' },
        { status: githubRes.status }
      );
    }

    const issueData = await githubRes.json();
    return NextResponse.json({
      success: true,
      issueUrl: issueData.html_url,
    });
  } catch (error) {
    console.error('API /api/feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
