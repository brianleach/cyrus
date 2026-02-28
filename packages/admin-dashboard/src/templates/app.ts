/**
 * Single-page admin dashboard — inline HTML/CSS/JS, no build step.
 * Hash-based client-side routing with dark theme.
 */
export function getDashboardHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cyrus Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e5e5e5;line-height:1.6}
a{color:#60a5fa;text-decoration:none}
a:hover{text-decoration:underline}
.container{max-width:900px;margin:0 auto;padding:20px}
header{padding:16px 0;border-bottom:1px solid #262626;margin-bottom:24px}
.header-row{display:flex;align-items:center;justify-content:space-between}
header h1{font-size:1.25rem;font-weight:600;color:#f5f5f5}
.header-sub{font-size:0.75rem;color:#525252;margin-top:2px;font-family:'SF Mono',Monaco,Consolas,monospace}
nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
nav a{padding:6px 14px;border-radius:6px;font-size:0.85rem;color:#a3a3a3;transition:background 0.15s,color 0.15s}
nav a:hover{background:#1a1a1a;color:#e5e5e5;text-decoration:none}
nav a.active{background:#1e3a5f;color:#60a5fa}
.card{background:#141414;border:1px solid #262626;border-radius:8px;padding:20px;margin-bottom:16px}
.card h2{font-size:1rem;font-weight:600;margin-bottom:12px;color:#f5f5f5}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.card-header h2{margin-bottom:0}
.stat{display:inline-block;margin-right:24px;margin-bottom:8px}
.stat .label{font-size:0.75rem;color:#737373;text-transform:uppercase;letter-spacing:0.05em}
.stat .value{font-size:1.25rem;font-weight:600;color:#f5f5f5}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600}
.badge-green{background:#14532d;color:#4ade80}
.badge-yellow{background:#422006;color:#fbbf24}
.badge-red{background:#450a0a;color:#f87171}
.badge-blue{background:#1e3a5f;color:#60a5fa}
.badge-gray{background:#1a1a1a;color:#737373}
table{width:100%;border-collapse:collapse;font-size:0.85rem}
th{text-align:left;padding:8px 12px;border-bottom:1px solid #262626;color:#737373;font-weight:500;text-transform:uppercase;font-size:0.7rem;letter-spacing:0.05em}
td{padding:8px 12px;border-bottom:1px solid #1a1a1a}
input,textarea,select{background:#1a1a1a;border:1px solid #333;color:#e5e5e5;padding:8px 12px;border-radius:6px;width:100%;font-family:inherit;font-size:0.85rem}
input:focus,textarea:focus{outline:none;border-color:#60a5fa}
textarea{min-height:200px;font-family:'SF Mono',Monaco,Consolas,monospace;font-size:0.8rem;resize:vertical}
button{background:#1e3a5f;color:#60a5fa;border:1px solid #2563eb;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:0.85rem;font-family:inherit;transition:background 0.15s}
button:hover{background:#1e40af}
button.danger{background:#450a0a;color:#f87171;border-color:#dc2626}
button.danger:hover{background:#7f1d1d}
button.secondary{background:#1a1a1a;color:#a3a3a3;border-color:#333}
button.secondary:hover{background:#262626;color:#e5e5e5}
button.small{padding:4px 10px;font-size:0.75rem}
.btn-group{display:flex;gap:8px}
.form-group{margin-bottom:12px}
.form-group label{display:block;font-size:0.8rem;color:#a3a3a3;margin-bottom:4px}
.msg{padding:10px 14px;border-radius:6px;margin-bottom:12px;font-size:0.85rem}
.msg-ok{background:#14532d;color:#4ade80;border:1px solid #166534}
.msg-err{background:#450a0a;color:#f87171;border:1px solid #7f1d1d}
.mono{font-family:'SF Mono',Monaco,Consolas,monospace;font-size:0.8rem}
pre{background:#0a0a0a;border:1px solid #262626;border-radius:6px;padding:12px;overflow-x:auto;font-size:0.8rem;white-space:pre-wrap;word-break:break-all}
.loading{color:#737373;font-style:italic}
.empty-state{text-align:center;padding:32px 16px;color:#525252}
.empty-state p{margin-bottom:8px}
#page{min-height:50vh}
footer{border-top:1px solid #1a1a1a;padding:16px 0;margin-top:24px;text-align:center;font-size:0.7rem;color:#404040}
.toast-container{position:fixed;top:16px;right:16px;z-index:1000;display:flex;flex-direction:column;gap:8px}
.toast{padding:10px 16px;border-radius:6px;font-size:0.85rem;animation:slideIn 0.2s ease-out;max-width:360px}
.toast-ok{background:#14532d;color:#4ade80;border:1px solid #166534}
.toast-err{background:#450a0a;color:#f87171;border:1px solid #7f1d1d}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.log-viewer{background:#0a0a0a;border:1px solid #262626;border-radius:6px;padding:12px;font-family:'SF Mono',Monaco,Consolas,monospace;font-size:0.75rem;line-height:1.5;max-height:600px;overflow-y:auto;white-space:pre-wrap;word-break:break-all}
.log-debug{color:#525252}
.log-info{color:#a3a3a3}
.log-warn{color:#fbbf24}
.log-error{color:#f87171}
.toggle-btn{padding:4px 10px;font-size:0.75rem;border-radius:4px;cursor:pointer}
.toggle-btn.active{background:#14532d;color:#4ade80;border-color:#166534}
</style>
</head>
<body>
<div class="container">
<header>
<div class="header-row">
<div>
<h1>Cyrus Admin</h1>
<div class="header-sub" id="header-origin"></div>
</div>
</div>
<nav id="nav">
<a href="#/">Status</a>
<a href="#/repos">Repositories</a>
<a href="#/logs">Logs</a>
<a href="#/auth">Linear Auth</a>
<a href="#/github">GitHub</a>
<a href="#/config">Config</a>
<a href="#/env">Environment</a>
</nav>
</header>
<div id="page"><p class="loading">Loading...</p></div>
<footer id="footer"></footer>
</div>
<div class="toast-container" id="toasts"></div>

<script>
(function(){
// ── Auth Token ──────────────────────────────────────────────────────
var params = new URLSearchParams(location.search);
var urlToken = params.get('token');
if (urlToken) {
  localStorage.setItem('cyrus_admin_token', urlToken);
  history.replaceState(null, '', location.pathname + location.hash);
}
var TOKEN = localStorage.getItem('cyrus_admin_token') || '';

// ── Header subtitle ────────────────────────────────────────────────
document.getElementById('header-origin').textContent = location.origin;

function api(path, opts) {
  var o = opts || {};
  var headers = Object.assign({'Authorization': 'Bearer ' + TOKEN}, o.headers || {});
  if (o.body && typeof o.body === 'string') headers['Content-Type'] = 'application/json';
  return fetch(path, Object.assign({}, o, {headers})).then(function(r) {
    if (r.status === 401) { showNoAuth(); throw new Error('unauthorized'); }
    return r.json();
  });
}

function showNoAuth() {
  document.getElementById('page').innerHTML =
    '<div class="card"><h2>Authentication Required</h2>' +
    '<p>Visit <code>/admin?token=YOUR_TOKEN</code> to authenticate.</p></div>';
}

// ── Toast Notifications ────────────────────────────────────────────
function toast(text, ok) {
  var container = document.getElementById('toasts');
  var el = h('div', {className: 'toast ' + (ok ? 'toast-ok' : 'toast-err')}, text);
  container.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
}

// ── Auto-refresh management ────────────────────────────────────────
var autoRefreshInterval = null;

function clearAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// ── Router ──────────────────────────────────────────────────────────
var $page = document.getElementById('page');
var routes = {
  '/': renderStatus,
  '/repos': renderRepos,
  '/logs': renderLogs,
  '/auth': renderAuth,
  '/github': renderGithub,
  '/config': renderConfig,
  '/env': renderEnv
};

function navigate() {
  clearAutoRefresh();
  var hash = location.hash.replace('#','') || '/';
  document.querySelectorAll('#nav a').forEach(function(a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
  });
  var fn = routes[hash] || routes['/'];
  $page.innerHTML = '<p class="loading">Loading...</p>';
  fn();
}

window.addEventListener('hashchange', navigate);

// ── Footer version ─────────────────────────────────────────────────
api('/api/admin/status').then(function(r) {
  if (r.success) {
    document.getElementById('footer').textContent = 'Cyrus v' + r.data.version;
  }
}).catch(function(){});

navigate();

// ── Helpers ─────────────────────────────────────────────────────────
function h(tag, attrs, children) {
  var el = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k) {
    if (k === 'className') el.className = attrs[k];
    else if (k === 'innerHTML') el.innerHTML = attrs[k];
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else el.setAttribute(k, attrs[k]);
  });
  if (children !== undefined) {
    if (typeof children === 'string') el.textContent = children;
    else if (Array.isArray(children)) children.forEach(function(c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    else el.appendChild(children);
  }
  return el;
}

function msg(text, ok) {
  return h('div', {className: ok ? 'msg msg-ok' : 'msg msg-err'}, text);
}

function timeAgo(ts) {
  if (!ts) return 'Never';
  var diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function formatDuration(startMs) {
  if (!startMs) return '-';
  var diff = Math.floor((Date.now() - startMs) / 1000);
  var hours = Math.floor(diff / 3600);
  var mins = Math.floor((diff % 3600) / 60);
  if (hours > 0) return hours + 'h ' + mins + 'm';
  return mins + 'm';
}

// ── Status Page ─────────────────────────────────────────────────────
var statusAutoRefreshOn = false;

function renderStatus() {
  loadStatus();
}

function loadStatus() {
  api('/api/admin/status').then(function(r) {
    if (!r.success) { $page.innerHTML = ''; $page.appendChild(msg(r.error, false)); return; }
    var d = r.data;
    var ws = d.webhookStats || {};

    // Instance status card
    var card = h('div', {className:'card'}, [
      h('div', {className:'card-header'}, [
        h('h2', null, 'Instance Status'),
        h('div', {className:'btn-group'}, [
          h('button', {
            className: 'toggle-btn small' + (statusAutoRefreshOn ? ' active' : ''),
            onClick: function() {
              statusAutoRefreshOn = !statusAutoRefreshOn;
              if (statusAutoRefreshOn) {
                autoRefreshInterval = setInterval(loadStatus, 15000);
                this.className = 'toggle-btn small active';
              } else {
                clearAutoRefresh();
                this.className = 'toggle-btn small';
              }
            }
          }, statusAutoRefreshOn ? 'Auto-refresh ON' : 'Auto-refresh')
        ])
      ]),
      h('div', null, [
        stat('Version', d.version),
        stat('Repositories', d.repoCount),
        stat('Uptime', formatUptime(d.uptime)),
        stat('Node', d.nodeVersion),
        stat('Platform', d.platform)
      ])
    ]);
    $page.innerHTML = '';
    $page.appendChild(card);

    // Webhook stats card
    var whCard = h('div', {className:'card'}, [
      h('h2', null, 'Webhooks'),
      h('div', null, [
        stat('Received', String(ws.totalCount || 0)),
        stat('Last Received', timeAgo(ws.lastTimestamp)),
        stat('Currently Processing', String(ws.activeCount || 0))
      ])
    ]);
    $page.appendChild(whCard);

    // Sessions
    api('/api/admin/sessions').then(function(s) {
      if (!s.success) return;
      var sCard = h('div', {className:'card'}, [
        h('h2', null, 'Active Sessions (' + s.data.count + ')'),
      ]);
      if (s.data.sessions.length === 0) {
        sCard.appendChild(h('div', {className:'empty-state'}, [
          h('p', null, 'No active sessions'),
          h('p', {className:'loading'}, 'Sessions appear here when Cyrus is processing an issue')
        ]));
      } else {
        var tbl = h('table', null, [
          h('thead', null, h('tr', null, [
            h('th',null,'Issue'),
            h('th',null,'Repository'),
            h('th',null,'Runner'),
            h('th',null,'Duration'),
            h('th',null,'Status')
          ])),
          h('tbody', null, s.data.sessions.map(function(ses) {
            return h('tr', null, [
              h('td', {className:'mono'}, ses.issueIdentifier || ses.issueId),
              h('td', {className:'mono'}, ses.repositoryId),
              h('td', null, ses.runnerType
                ? h('span', {className:'badge badge-blue'}, ses.runnerType)
                : h('span', {className:'badge badge-gray'}, '-')),
              h('td', null, formatDuration(ses.startedAt)),
              h('td', null, h('span', {className: ses.isRunning ? 'badge badge-green' : 'badge badge-yellow'}, ses.isRunning ? 'Running' : 'Idle'))
            ]);
          }))
        ]);
        sCard.appendChild(tbl);
      }
      $page.appendChild(sCard);
    }).catch(function(){});
  }).catch(function(){});
}

function stat(label, value) {
  return h('div', {className:'stat'}, [
    h('div', {className:'label'}, label),
    h('div', {className:'value'}, String(value))
  ]);
}

function formatUptime(seconds) {
  var h2 = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  return h2 + 'h ' + m + 'm';
}

// ── Repositories Page ───────────────────────────────────────────────
function renderRepos() {
  api('/api/admin/config').then(function(r) {
    if (!r.success) { $page.innerHTML = ''; $page.appendChild(msg(r.error, false)); return; }
    var repos = r.data.repositories || [];
    $page.innerHTML = '';

    var card = h('div', {className:'card'}, [h('h2', null, 'Repositories (' + repos.length + ')')]);
    if (repos.length === 0) {
      card.appendChild(h('div', {className:'empty-state'}, [
        h('p', null, 'No repositories configured'),
        h('p', {className:'loading'}, 'Add a repository below to get started')
      ]));
    } else {
      var tbl = h('table', null, [
        h('thead', null, h('tr', null, [h('th',null,'Name'), h('th',null,'Workspace'), h('th',null,'Base Branch'), h('th',null,'Token'), h('th',null,'')])),
        h('tbody', null, repos.map(function(repo) {
          var tokenBadge = repo.linearToken
            ? h('span', {className:'badge badge-green'}, 'Valid')
            : h('span', {className:'badge badge-yellow'}, 'Missing');
          return h('tr', null, [
            h('td', null, [
              h('div', null, repo.name),
              h('div', {className:'mono', style:'color:#525252;font-size:0.7rem'}, repo.repositoryPath)
            ]),
            h('td', null, repo.linearWorkspaceName || repo.linearWorkspaceId || '-'),
            h('td', {className:'mono'}, repo.baseBranch || 'main'),
            h('td', null, tokenBadge),
            h('td', null, h('button', {className:'danger small', onClick: function() { removeRepo(repo.id); }}, 'Remove'))
          ]);
        }))
      ]);
      card.appendChild(tbl);
    }
    $page.appendChild(card);

    // Add repo form
    var addCard = h('div', {className:'card'}, [
      h('h2', null, 'Add Repository'),
      h('div', {id:'add-repo-msg'}),
      h('div', {className:'form-group'}, [h('label', null, 'Repository Name'), h('input', {id:'repo-name', placeholder:'my-repo'})]),
      h('div', {className:'form-group'}, [h('label', null, 'Repository Path'), h('input', {id:'repo-path', placeholder:'/home/cyrus/repos/my-repo'})]),
      h('div', {className:'form-group'}, [h('label', null, 'Base Branch'), h('input', {id:'repo-branch', placeholder:'main', value:'main'})]),
      h('div', {className:'form-group'}, [h('label', null, 'GitHub URL (optional)'), h('input', {id:'repo-github', placeholder:'https://github.com/org/repo'})]),
      h('button', {onClick: addRepo}, 'Add Repository')
    ]);
    $page.appendChild(addCard);
  }).catch(function(){});
}

function addRepo() {
  var name = document.getElementById('repo-name').value.trim();
  var path = document.getElementById('repo-path').value.trim();
  var branch = document.getElementById('repo-branch').value.trim() || 'main';
  var github = document.getElementById('repo-github').value.trim();
  var msgEl = document.getElementById('add-repo-msg');
  if (!name || !path) { msgEl.innerHTML = ''; msgEl.appendChild(msg('Name and path are required', false)); return; }

  api('/api/update/repository', {
    method: 'POST',
    body: JSON.stringify({
      id: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: name,
      repositoryPath: path,
      baseBranch: branch,
      githubUrl: github || undefined,
      linearWorkspaceId: '',
      linearToken: '',
    })
  }).then(function(r) {
    if (r.success) {
      toast('Repository added', true);
      setTimeout(renderRepos, 500);
    } else {
      toast(r.error || 'Failed to add repository', false);
    }
  }).catch(function(e) { toast(e.message, false); });
}

function removeRepo(id) {
  if (!confirm('Remove repository ' + id + '?')) return;
  api('/api/update/repository', {
    method: 'DELETE',
    body: JSON.stringify({ id: id })
  }).then(function(r) {
    toast('Repository removed', true);
    renderRepos();
  }).catch(function() { renderRepos(); });
}

// ── Logs Page ───────────────────────────────────────────────────────
var logsAutoRefreshOn = false;
var logsSinceTimestamp = 0;

function renderLogs() {
  logsAutoRefreshOn = false;
  logsSinceTimestamp = 0;

  $page.innerHTML = '';
  var card = h('div', {className:'card'}, [
    h('div', {className:'card-header'}, [
      h('h2', null, 'Logs'),
      h('div', {className:'btn-group'}, [
        h('button', {className:'secondary small', onClick: function() { logsSinceTimestamp = 0; loadLogs(); }}, 'Refresh'),
        h('button', {
          id: 'logs-auto-btn',
          className: 'toggle-btn small',
          onClick: function() {
            logsAutoRefreshOn = !logsAutoRefreshOn;
            var btn = document.getElementById('logs-auto-btn');
            if (logsAutoRefreshOn) {
              btn.className = 'toggle-btn small active';
              btn.textContent = 'Auto-refresh ON';
              autoRefreshInterval = setInterval(function() { loadLogs(true); }, 5000);
            } else {
              btn.className = 'toggle-btn small';
              btn.textContent = 'Auto-refresh';
              clearAutoRefresh();
            }
          }
        }, 'Auto-refresh')
      ])
    ]),
    h('div', {id:'log-viewer', className:'log-viewer'}, 'Loading logs...')
  ]);
  $page.appendChild(card);
  loadLogs();
}

function loadLogs(incremental) {
  var params = '?limit=200';
  if (incremental && logsSinceTimestamp) {
    params += '&since=' + logsSinceTimestamp;
  }
  api('/api/admin/logs' + params).then(function(r) {
    if (!r.success) return;
    var viewer = document.getElementById('log-viewer');
    if (!viewer) return;

    var entries = r.data.entries || [];

    if (!incremental) {
      viewer.innerHTML = '';
    }

    if (entries.length === 0 && !incremental) {
      viewer.innerHTML = '<span class="log-debug">No log entries yet. Logs appear as Cyrus processes webhooks and sessions.</span>';
      return;
    }

    entries.forEach(function(entry) {
      var cls = 'log-' + entry.level.toLowerCase();
      var ts = new Date(entry.timestamp).toISOString().substr(11, 12);
      var line = document.createElement('div');
      line.className = cls;
      line.textContent = ts + ' [' + entry.level.padEnd(5) + '] [' + entry.component + '] ' + entry.message;
      viewer.appendChild(line);
      logsSinceTimestamp = Math.max(logsSinceTimestamp, entry.timestamp);
    });

    // Auto-scroll to bottom
    viewer.scrollTop = viewer.scrollHeight;
  }).catch(function(){});
}

// ── Linear Auth Page ────────────────────────────────────────────────
function renderAuth() {
  $page.innerHTML = '';
  var card = h('div', {className:'card'}, [
    h('h2', null, 'Linear Authorization'),
    h('div', {id:'auth-msg'}),
    h('p', null, 'Re-authorize Cyrus with your Linear workspace to refresh OAuth tokens.'),
    h('br'),
    h('button', {onClick: initiateOAuth}, 'Authorize with Linear')
  ]);
  $page.appendChild(card);

  api('/api/admin/config').then(function(r) {
    if (!r.success) return;
    var repos = r.data.repositories || [];
    if (repos.length === 0) return;
    var first = repos[0];
    var info = h('div', {className:'card'}, [
      h('h2', null, 'Current Workspace'),
      h('div', null, [
        stat('Workspace', first.linearWorkspaceName || '-'),
        stat('Workspace ID', first.linearWorkspaceId || '-'),
        stat('Token', first.linearToken || '-')
      ])
    ]);
    $page.appendChild(info);
  }).catch(function(){});
}

function initiateOAuth() {
  var msgEl = document.getElementById('auth-msg');
  msgEl.innerHTML = '';
  msgEl.appendChild(msg('Initiating OAuth flow...', true));

  api('/api/admin/linear-oauth/initiate', {method:'POST'}).then(function(r) {
    msgEl.innerHTML = '';
    if (r.success && r.data.authorizeUrl) {
      window.open(r.data.authorizeUrl, '_blank');
      msgEl.appendChild(msg('Authorization page opened. Complete the flow in the new tab.', true));
    } else {
      msgEl.appendChild(msg(r.error || 'Failed to initiate OAuth', false));
    }
  }).catch(function(e) { msgEl.innerHTML = ''; msgEl.appendChild(msg(e.message, false)); });
}

// ── GitHub Auth Page ────────────────────────────────────────────────
function renderGithub() {
  $page.innerHTML = '';
  var card = h('div', {className:'card'}, [
    h('h2', null, 'GitHub CLI Status'),
    h('div', {id:'gh-status'}, h('p', {className:'loading'}, 'Checking...'))
  ]);
  $page.appendChild(card);

  api('/api/admin/gh-status').then(function(r) {
    var el = document.getElementById('gh-status');
    if (!el) return;
    el.innerHTML = '';
    if (!r.success) { el.appendChild(msg(r.error, false)); return; }
    var d = r.data;
    el.appendChild(h('div', null, [
      stat('Installed', d.isInstalled ? 'Yes' : 'No'),
      stat('Authenticated', d.isAuthenticated ? 'Yes' : 'No')
    ]));
    if (d.statusOutput) {
      el.appendChild(h('pre', null, d.statusOutput));
    }
  }).catch(function(){});

  var tokenCard = h('div', {className:'card'}, [
    h('h2', null, 'Set GH_TOKEN'),
    h('div', {id:'gh-msg'}),
    h('p', null, 'Set a GitHub personal access token. The container\\'s gh CLI will use this automatically.'),
    h('br'),
    h('div', {className:'form-group'}, [h('label', null, 'GH_TOKEN'), h('input', {id:'gh-token', type:'password', placeholder:'ghp_...'})]),
    h('button', {onClick: setGhToken}, 'Save GH_TOKEN')
  ]);
  $page.appendChild(tokenCard);
}

function setGhToken() {
  var token = document.getElementById('gh-token').value.trim();
  if (!token) { toast('Token is required', false); return; }

  api('/api/update/cyrus-env', {
    method: 'POST',
    body: JSON.stringify({ key: 'GH_TOKEN', value: token })
  }).then(function(r) {
    toast(r.success ? 'GH_TOKEN saved. Restart may be required.' : (r.error || 'Failed'), r.success);
  }).catch(function(e) { toast(e.message, false); });
}

// ── Config Page ─────────────────────────────────────────────────────
var originalConfigJson = '';

function renderConfig() {
  $page.innerHTML = '';
  var card = h('div', {className:'card'}, [
    h('h2', null, 'Configuration'),
    h('div', {id:'config-msg'}),
    h('p', null, 'Edit the full config.json. Tokens shown are masked; saving will overwrite with the values below.'),
    h('br'),
    h('textarea', {id:'config-editor'}),
    h('br'),
    h('div', {className:'btn-group'}, [
      h('button', {onClick: saveConfig}, 'Save Configuration'),
      h('button', {className:'secondary', onClick: formatConfigJson}, 'Format JSON'),
      h('button', {className:'secondary', onClick: resetConfig}, 'Reset')
    ])
  ]);
  $page.appendChild(card);

  api('/api/admin/config').then(function(r) {
    var ta = document.getElementById('config-editor');
    if (!ta) return;
    if (r.success) {
      originalConfigJson = JSON.stringify(r.data, null, 2);
      ta.value = originalConfigJson;
    } else {
      ta.value = '// Error: ' + (r.error || 'Failed to load config');
    }
  }).catch(function(){});
}

function formatConfigJson() {
  var ta = document.getElementById('config-editor');
  try {
    var parsed = JSON.parse(ta.value);
    ta.value = JSON.stringify(parsed, null, 2);
    toast('JSON formatted', true);
  } catch(e) {
    toast('Invalid JSON: ' + e.message, false);
  }
}

function resetConfig() {
  var ta = document.getElementById('config-editor');
  if (originalConfigJson) {
    ta.value = originalConfigJson;
    toast('Config reset to last saved state', true);
  }
}

function saveConfig() {
  var ta = document.getElementById('config-editor');
  var value;
  try { value = JSON.parse(ta.value); } catch(e) { toast('Invalid JSON: ' + e.message, false); return; }

  api('/api/update/cyrus-config', {
    method: 'POST',
    body: JSON.stringify({ config: value })
  }).then(function(r) {
    toast(r.success ? 'Configuration saved' : (r.error || 'Failed'), r.success);
    if (r.success) originalConfigJson = ta.value;
  }).catch(function(e) { toast(e.message, false); });
}

// ── Environment Page ────────────────────────────────────────────────
function renderEnv() {
  $page.innerHTML = '';
  var card = h('div', {className:'card'}, [
    h('h2', null, 'Environment Variables'),
    h('div', {id:'env-msg'}),
    h('p', null, 'Set or update environment variables in the .env file.'),
    h('br'),
    h('div', {className:'form-group'}, [h('label', null, 'Variable Name'), h('input', {id:'env-key', placeholder:'ANTHROPIC_API_KEY'})]),
    h('div', {className:'form-group'}, [h('label', null, 'Value'), h('input', {id:'env-value', type:'password', placeholder:'sk-...'})]),
    h('button', {onClick: setEnvVar}, 'Save Variable')
  ]);
  $page.appendChild(card);
}

function setEnvVar() {
  var key = document.getElementById('env-key').value.trim();
  var value = document.getElementById('env-value').value.trim();
  if (!key || !value) { toast('Key and value are required', false); return; }

  api('/api/update/cyrus-env', {
    method: 'POST',
    body: JSON.stringify({ key: key, value: value })
  }).then(function(r) {
    toast(r.success ? key + ' saved. Restart may be required.' : (r.error || 'Failed'), r.success);
  }).catch(function(e) { toast(e.message, false); });
}
})();
</script>
</body>
</html>`;
}
