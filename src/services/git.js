const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class GitService {
  constructor(workspaceDir) {
    this.workspaceDir = workspaceDir;
  }

  /**
   * Get the local path for a repository
   */
  getRepoPath(repoName) {
    return path.join(this.workspaceDir, repoName);
  }

  /**
   * Clone or update a repository
   */
  cloneOrUpdate(repoUrl, repoName) {
    const repoPath = this.getRepoPath(repoName);

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      if (!fs.existsSync(repoPath)) {
        fs.mkdirSync(repoPath, { recursive: true });
      }
      execSync(`git clone ${repoUrl} .`, { cwd: repoPath, stdio: 'inherit' });
    } else {
      execSync('git fetch origin', { cwd: repoPath, stdio: 'inherit' });
    }

    return repoPath;
  }

  /**
   * Checkout a branch
   */
  checkoutBranch(repoPath, branchName) {
    try {
      execSync(`git checkout ${branchName}`, { cwd: repoPath });
    } catch (error) {
      execSync(`git checkout -b ${branchName}`, { cwd: repoPath });
    }
  }

  /**
   * Pull latest changes from origin for a branch
   */
  pullBranch(repoPath, branchName) {
    execSync(`git pull origin ${branchName}`, { cwd: repoPath });
  }

  /**
   * Checkout main and pull latest
   */
  syncMain(repoPath) {
    this.checkoutBranch(repoPath, 'main');
    this.pullBranch(repoPath, 'main');
  }

  /**
   * Create and checkout a new branch from main
   */
  createIssueBranch(repoPath, issueNumber) {
    this.syncMain(repoPath);
    const branchName = `ai/issue-${issueNumber}`;
    this.checkoutBranch(repoPath, branchName);
    return branchName;
  }

  /**
   * Stage and commit changes
   */
  commit(repoPath, message) {
    // Stage only tracked+new files, not deleted files
    execSync('git add .', { cwd: repoPath });
    execSync(`git commit -m "${message}"`, { cwd: repoPath });
  }

  /**
   * Push branch to origin
   */
  push(repoPath, branchName) {
    execSync(`git push origin ${branchName}`, { cwd: repoPath });
  }

  /**
   * Configure git author
   */
  configAuthor(repoPath, name, email) {
    execSync(`git config user.name "${name}"`, { cwd: repoPath });
    execSync(`git config user.email "${email}"`, { cwd: repoPath });
  }
}

module.exports = GitService;
