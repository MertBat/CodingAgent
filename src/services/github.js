const axios = require('axios');

class GitHubService {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseURL = 'https://api.github.com';
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  /**
   * Fetch a GitHub issue by number
   */
  async getIssue(issueNumber) {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/issues/${issueNumber}`;
    const response = await axios.get(url, { headers: this.getHeaders() });
    return response.data;
  }

  /**
   * Fetch all open issues sorted by issue number (ascending)
   */
  async getOpenIssues() {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/issues`;
    const params = {
      state: 'open',
      sort: 'created',
      direction: 'asc',
      per_page: 100,
    };
    const response = await axios.get(url, { headers: this.getHeaders(), params });
    return response.data;
  }

  /**
   * Get the oldest open issue (smallest issue number)
   */
  async getOldestOpenIssue() {
    const issues = await this.getOpenIssues();
    if (!issues || issues.length === 0) {
      return null;
    }
    return issues[0];
  }

  /**
   * Build a prompt from an issue
   */
  buildPrompt(issue) {
    return `You are fixing a GitHub issue in the repository "${this.repo}" on branch "main".

## Issue #${issue.number}: ${issue.title}

${issue.body || 'No description provided.'}

## Instructions

Follow these steps IN ORDER:

1. **EXPLORE** — First, search the codebase to understand the project structure. Look at directory listings, find relevant files. Use grep/search to locate files related to the issue.

2. **READ** — Read the relevant files BEFORE making any changes. Understand the current code and coding style.

3. **PLAN** — Identify exactly which files need to be changed and what changes are needed.

4. **EDIT** — Make the necessary code changes. Keep them minimal and focused on the issue.

5. **VERIFY** — Double-check that your changes are correct and complete.

## Critical Rules

* DO NOT only modify .gitignore or config files — you MUST make actual code changes
* Preserve existing code style, indentation, and patterns
* Make minimal changes — only what is needed to fix the issue
* Do not introduce new dependencies unless absolutely necessary
* If the issue description is in a non-English language, that's fine — understand the intent and implement accordingly
* If you cannot find relevant files, explain what you searched for and why`;
  }
}

module.exports = GitHubService;
