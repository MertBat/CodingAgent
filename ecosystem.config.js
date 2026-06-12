module.exports = {
  apps: [{
    name: 'ai-github-issue-agent',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_file: '.env',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    merge_logs: true,
    max_restarts: 10,
    restart_delay: 5000,
    autorestart: true,
  }],
};
