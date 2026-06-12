require('dotenv').config();

const GitHubService = require('./services/github');
const GitService = require('./services/git');
const AiderService = require('./services/aider');
const path = require('path');
const fs = require('fs');

const WORKSPACE_DIR = path.resolve(__dirname, '..', 'workspace');
const AIDER_PATH = path.resolve(__dirname, '..', 'python', 'Scripts', 'aider.exe');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;

class CLI {
  constructor() {
    this.gitService = new GitService(WORKSPACE_DIR);
    this.aiderService = new AiderService(AIDER_PATH);
  }

  async printUsage() {
    console.log('Usage:');
    console.log('  node src/cli.js build <repo> [issue_number or 0=auto]');
    console.log('  node src/cli.js list-open-issues <repo>');
    process.exit(1);
  }

  async listOpenIssues(repoName) {
    const github = new GitHubService(GITHUB_TOKEN, GITHUB_OWNER, repoName);
    const issues = await github.getOpenIssues();
    if (issues.length === 0) {
      console.log('No open issues found.');
      return;
    }
    issues.forEach(i => {
      console.log(`#${i.number}: ${i.title} (${i.html_url})`);
    });
  }

  async runBuild(repoName, issueNumberStr) {
    let issueNumber = parseInt(issueNumberStr, 10);

    const github = new GitHubService(GITHUB_TOKEN, GITHUB_OWNER, repoName);

    if (issueNumber === 0) {
      console.log('🔍 Auto-detecting smallest open issue number...');
      const issue = await github.getOldestOpenIssue();
      if (!issue) {
        console.error('❌ No open issues found.');
        return;
      }
      issueNumber = issue.number;
      console.log(`✅ Found oldest open issue: #${issueNumber} - ${issue.title}`);
    }

    if (isNaN(issueNumber) || issueNumber <= 0) {
      console.error('❌ Invalid issue number.');
      return;
    }

    console.log(`📦 Fetching issue #${issueNumber}...`);
    const issue = await github.getIssue(issueNumber);
    console.log(`📝 Issue: ${issue.title}`);

    const prompt = github.buildPrompt(issue);

    const repoUrl = `https://github.com/${GITHUB_OWNER}/${repoName}.git`;
    console.log(`🔧 Cloning/updating repo...`);
    const repoPath = this.gitService.cloneOrUpdate(repoUrl, repoName);

    console.log(`🌿 Creating branch...`);
    const branchName = this.gitService.createIssueBranch(repoPath, issueNumber);

    console.log(`🤖 Running aider...`);
    const aiderResult = await this.aiderService.run(repoPath, prompt, {
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    console.log(`📤 Committing and pushing...`);
    this.gitService.commit(repoPath, `AI fix for issue #${issueNumber}: ${issue.title}`);
    this.gitService.push(repoPath, branchName);

    console.log('✅ Done.');
    console.log(`Branch: ${branchName}`);
    console.log(`Issue: #${issueNumber}`);
    console.log(`Title: ${issue.title}`);
    console.log('Output:', aiderResult.substring(0, 500));
  }

  async run() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      await this.printUsage();
      return;
    }

    const command = args[0].toLowerCase();
    const repo = args[1];

    switch (command) {
      case 'build':
        const issueNumberStr = args[2] || '0';
        await this.runBuild(repo, issueNumberStr);
        break;
      case 'list-open-issues':
        await this.listOpenIssues(repo);
        break;
      default:
        await this.printUsage();
    }
  }
}

const cli = new CLI();
cli.run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
