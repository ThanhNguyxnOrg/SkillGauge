export interface GitHubUser {
  login: string;
  [key: string]: any;
}

export async function getGitHubUser(token: string): Promise<GitHubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'SkillGauge-App'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.statusText}`);
  }
  return res.json() as Promise<GitHubUser>;
}

export async function forkRepository(token: string, owner: string, repo: string): Promise<any> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'SkillGauge-App'
    }
  });

  if (!res.ok && res.status !== 202) {
    throw new Error(`Failed to fork repository: ${res.statusText}`);
  }
  return res.json();
}

export async function getFileSha(token: string, owner: string, repo: string, path: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SkillGauge-App'
      }
    });
    if (res.ok) {
      const data: any = await res.json();
      return data.sha || null;
    }
  } catch {}
  return null;
}

export async function commitFile(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  content: string,
  branch: string,
  message: string
): Promise<any> {
  const sha = await getFileSha(token, owner, repo, filePath, branch);
  
  // Encode content to base64. 
  // Node.js supports Buffer, browser supports btoa. We use a universal check:
  const base64Content = typeof Buffer !== 'undefined' 
    ? Buffer.from(content).toString('base64') 
    : btoa(unescape(encodeURIComponent(content)));

  const body: any = {
    message,
    content: base64Content,
    branch
  };
  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'SkillGauge-App'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Failed to commit file: ${res.statusText}`);
  }
  return res.json();
}

export async function createPullRequest(
  token: string,
  targetOwner: string,
  targetRepo: string,
  head: string,
  base: string,
  title: string,
  body: string
): Promise<any> {
  const res = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}/pulls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'SkillGauge-App'
    },
    body: JSON.stringify({
      title,
      body,
      head,
      base
    })
  });

  if (!res.ok) {
    const errorData: any = await res.json().catch(() => ({}));
    throw new Error(`Failed to create PR: ${errorData.message || res.statusText}`);
  }
  return res.json();
}

export interface ContributionResult {
  prUrl: string;
  prNumber: number;
}

/**
 * Automates the entire contribution flow (Fork -> Commit -> PR)
 */
export async function submitContribution(
  token: string,
  targetOwner: string,
  targetRepo: string,
  filePath: string,
  fileContent: string,
  branch: string,
  commitMessage: string,
  prTitle: string,
  prBody: string
): Promise<ContributionResult> {
  // 1. Get user details
  const user = await getGitHubUser(token);
  
  // 2. Trigger fork (non-blocking, GitHub takes a second but we can push immediately)
  await forkRepository(token, targetOwner, targetRepo);
  
  // Wait a short delay for GitHub to prepare the fork
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Commit file to user's fork
  await commitFile(token, user.login, targetRepo, filePath, fileContent, branch, commitMessage);

  // 4. Create Pull Request from user's fork to target repository
  const pr = await createPullRequest(
    token,
    targetOwner,
    targetRepo,
    `${user.login}:${branch}`,
    'main',
    prTitle,
    prBody
  );

  return {
    prUrl: pr.html_url,
    prNumber: pr.number
  };
}
