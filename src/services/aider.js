const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

class AiderService {
  constructor(aiderPath) {
    this.aiderPath = aiderPath;
  }

  /**
   * Build PATH environment variable cross-platform
   */
  _buildPath() {
    const isWin = os.platform() === 'win32';
    if (isWin) {
      return [
        'C:\\Program Files\\Git\\bin',
        'C:\\Program Files\\Git\\usr\\bin',
        process.env.PATH || '',
      ].join(';');
    }
    // Linux / macOS — just use existing PATH
    return process.env.PATH || '/usr/local/bin:/usr/bin:/bin';
  }

  /**
   * Run aider with a given prompt in a repository
   */
  run(repoPath, prompt, options = {}) {
    const {
      model = process.env.AIDER_MODEL || 'deepseek/deepseek-chat',
      apiKey = process.env.DEEPSEEK_API_KEY,
    } = options;

    const env = {
      ...process.env,
      OPENAI_API_KEY: apiKey,
      PATH: this._buildPath(),
    };

    // Write prompt to a temp file
    const fs = require('fs');
    const promptFile = path.join(repoPath, '.aider.prompt');
    fs.writeFileSync(promptFile, prompt);

    // Run aider with spawn so we can auto-answer interactive prompts
    const args = [
      '--model', model,
      '--yes',
      '--no-auto-commits',
      '--no-gitignore',
      '--no-show-model-warnings',
      '--message-file', promptFile,
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(this.aiderPath, args, {
        cwd: repoPath,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        // Auto-answer "Yes" to any interactive prompts Aider might ask
        if (/\(Y\)es|\[Yes\]|\(Y\)\/\(N\)|\(Y\|n\)/i.test(text)) {
          child.stdin.write('y\n');
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // Clean up aider temp files so they don't get committed
        const cleanupFiles = [
          path.join(repoPath, '.aider.prompt'),
          path.join(repoPath, '.aider.chat.history.md'),
          path.join(repoPath, '.aider.tags.cache.v4'),
        ];
        cleanupFiles.forEach((f) => {
          try { fs.rmSync(f, { recursive: true, force: true }); } catch (_) {}
        });

        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Aider exited with code ${code}\n${stderr || stdout}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // Safety timeout (10 minutes)
      setTimeout(() => {
        child.kill();
        reject(new Error('Aider timed out after 10 minutes'));
      }, 600000);
    });
  }
}

module.exports = AiderService;
          try { fs.rmSync(f, { recursive: true, force: true }); } catch (_) {}
        });

        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Aider exited with code ${code}\n${stderr || stdout}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // Safety timeout (10 minutes)
      setTimeout(() => {
        child.kill();
        reject(new Error('Aider timed out after 10 minutes'));
      }, 600000);
    });
  }
}

module.exports = AiderService;
