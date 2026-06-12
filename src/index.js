require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const GitHubService = require('./services/github');
const GitService = require('./services/git');
const AiderService = require('./services/aider');

const app = express();
app.use(express.json());

// Detect aider path based on OS
const isWin = os.platform() === 'win32';
const AIDER_PATH = isWin
  ? path.resolve(__dirname, '..', 'python', 'Scripts', 'aider.exe')
  : (process.env.AIDER_PATH || '/usr/local/bin/aider');

const WORKSPACE_DIR = path.resolve(__dirname, '..', 'workspace');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;

// Create workspace directory
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Initialize services
const gitService = new GitService(WORKSPACE_DIR);
const aiderService = new AiderService(AIDER_PATH);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Run task endpoint - Faz 2 + 3 + 4 combined
app.post('/run-task', async (req, res) => {
  const { repo, issueNumber } = req.body;

  if (!repo || !issueNumber) {
    return res.status(400).json({ error: 'repo and issueNumber are required' });
  }

  const jobId = `job-${Date.now()}`;

  try {
    // Step 1: Fetch issue from GitHub
    const github = new GitHubService(GITHUB_TOKEN, GITHUB_OWNER, repo);
    const issue = await github.getIssue(issueNumber);
    const prompt = github.buildPrompt(issue);

    // Step 2: Clone/update repo and prepare branch
    const repoUrl = `https://github.com/${GITHUB_OWNER}/${repo}.git`;
    const repoPath = gitService.cloneOrUpdate(repoUrl, repo);
    const branchName = gitService.createIssueBranch(repoPath, issueNumber);

    // Step 3: Run aider with the prompt
    const aiderResult = await aiderService.run(repoPath, prompt, {
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // Step 4: Commit and push
    gitService.commit(repoPath, `AI fix for issue #${issueNumber}: ${issue.title}`);
    gitService.push(repoPath, branchName);

    res.json({
      success: true,
      jobId,
      branch: branchName,
      issueTitle: issue.title,
      aiderOutput: aiderResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      jobId,
      error: error.message,
    });
  }
});

// POC endpoint for direct testing
app.post('/poc', async (req, res) => {
  const { repo, prompt } = req.body;

  if (!repo || !prompt) {
    return res.status(400).json({ error: 'repo and prompt are required' });
  }

  try {
    const repoPath = gitService.getRepoPath(repo);
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
      execSync('git init', { cwd: repoPath });
    }

    const result = await aiderService.run(repoPath, prompt, {
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI GitHub Issue Agent running on port ${PORT}`);
  console.log(`Aider path: ${AIDER_PATH}`);
  console.log(`Workspace: ${WORKSPACE_DIR}`);
});
