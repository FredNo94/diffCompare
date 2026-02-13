(function () {
  'use strict';

  var inputA = document.getElementById('inputA');
  var inputB = document.getElementById('inputB');
  var fileA = document.getElementById('fileA');
  var fileB = document.getElementById('fileB');
  var btnCompare = document.getElementById('btnCompare');
  var btnClear = document.getElementById('btnClear');
  var diffSection = document.getElementById('diffSection');
  var diffOutput = document.getElementById('diffOutput');
  var diffStats = document.getElementById('diffStats');
  var diffComment = document.getElementById('diffComment');
  var commentInputA = document.getElementById('commentA');
  var commentInputB = document.getElementById('commentB');
  var widgetTokenInput = document.getElementById('widgetToken');

  var TOKEN_KEYS = ['token', 'widgetToken', 'widget_id', 'widgetId', 'id'];

  function getMode() {
    if (typeof document === 'undefined') return 'text'; // Default mode for Node.js
    return document.querySelector('input[name="mode"]:checked').value;
  }

  function objectHasToken(obj, token) {
    if (!obj || typeof obj !== 'object') return false;
    return TOKEN_KEYS.some(function (k) {
      return obj[k] === token;
    });
  }

  function filterByWidgetToken(data, token) {
    if (!token || typeof token !== 'string' || !token.trim()) return data;
    token = token.trim();

    function filterValue(val) {
      if (val == null) return null;
      if (Array.isArray(val)) {
        var filtered = val.filter(function (item) {
          return objectHasToken(item, token);
        });
        return filtered.length ? filtered : null;
      }
      if (typeof val === 'object') {
        if (objectHasToken(val, token)) return val;
        var out = {};
        for (var key in val) {
          if (!Object.prototype.hasOwnProperty.call(val, key)) continue;
          var filtered = filterValue(val[key]);
          if (filtered !== null && (Array.isArray(filtered) ? filtered.length > 0 : true)) {
            out[key] = filtered;
          }
        }
        return Object.keys(out).length ? out : null;
      }
      return null;
    }

    var result = filterValue(data);
    return result !== null ? result : { _empty: 'Нет данных по токену «' + token + '»' };
  }

  function normalizeJson(str, widgetToken) {
    var s = str.trim();
    if (!s) return '';
    try {
      var parsed = JSON.parse(s);
      if (widgetToken && getMode() === 'json') {
        parsed = filterByWidgetToken(parsed, widgetToken);
      }
      return JSON.stringify(parsed, null, 2);
    } catch (_) {
      return str;
    }
  }

  function getTextA() {
    if (typeof document === 'undefined') return '';
    var t = inputA.value.trim();
    var token = widgetTokenInput && widgetTokenInput.value ? widgetTokenInput.value.trim() : '';
    return getMode() === 'json' ? normalizeJson(t, token) : t;
  }

  function getTextB() {
    if (typeof document === 'undefined') return '';
    var t = inputB.value.trim();
    var token = widgetTokenInput && widgetTokenInput.value ? widgetTokenInput.value.trim() : '';
    return getMode() === 'json' ? normalizeJson(t, token) : t;
  }

  function runDiff() {
    if (typeof document === 'undefined') return;
    var textA = getTextA();
    var textB = getTextB();

    if (!textA && !textB) {
      diffSection.classList.remove('visible');
      return;
    }

    var linesA = textA ? textA.split(/\r?\n/) : [];
    var linesB = textB ? textB.split(/\r?\n/) : [];
    var result = Diff.diffLines(textA || '', textB || '');

    var addedCount = 0;
    var removedCount = 0;
    var lineNumA = 0;
    var lineNumB = 0;
    var html = '';
    var lineNum = 0;

    result.forEach(function (part) {
      var lines = part.value.split(/\r?\n/);
      if (lines[lines.length - 1] === '') lines.pop();

      lines.forEach(function (line) {
        lineNum++;
        var escaped = escapeHtml(line || ' ');
        var cls = '';
        var prefix = '';

        if (part.added) {
          addedCount++;
          lineNumB++;
          cls = 'added';
          prefix = '+';
        } else if (part.removed) {
          removedCount++;
          lineNumA++;
          cls = 'removed';
          prefix = '-';
        } else {
          lineNumA++;
          lineNumB++;
          cls = 'unchanged';
          prefix = ' ';
        }

        html += '<span class="line ' + cls + '"><span class="line-num">' + prefix + '</span>' + escaped + '</span>\n';
      });
    });

    diffOutput.innerHTML = html || '<span class="line unchanged">Нет различий</span>';
    diffStats.textContent = '−' + removedCount + ' / +' + addedCount;
    var commentA = commentInputA && commentInputA.value.trim() ? commentInputA.value.trim() : '';
    var commentB = commentInputB && commentInputB.value.trim() ? commentInputB.value.trim() : '';
    var commentText = '';
    if (commentA && commentB) {
      commentText = commentA + ' → ' + commentB;
    } else if (commentA) {
      commentText = commentA;
    } else if (commentB) {
      commentText = commentB;
    }
    diffComment.textContent = commentText;
    diffSection.classList.add('visible');
  }

  function escapeHtml(str) {
    if (typeof document === 'undefined') {
      // Simple HTML escaping for Node.js environment
      return str.replace(/[&<>"']/g, function (m) {
        return {
          '&': '&',
          '<': '<',
          '>': '>',
          '"': '"',
          "'": '&#39;'
        }[m];
      });
    }
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function clearAll() {
    if (typeof document === 'undefined') return;
    inputA.value = '';
    inputB.value = '';
    fileA.value = '';
    fileB.value = '';
    if (commentInputA) commentInputA.value = '';
    if (commentInputB) commentInputB.value = '';
    if (widgetTokenInput) widgetTokenInput.value = '';
    diffSection.classList.remove('visible');
    diffOutput.innerHTML = '';
    diffStats.textContent = '';
    diffComment.textContent = '';
  }

  function readFile(fileInput, targetTextarea) {
    if (typeof document === 'undefined') return;
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      targetTextarea.value = e.target.result || '';
    };
    reader.readAsText(file, 'UTF-8');
  }

  if (typeof document !== 'undefined') {
    fileA.addEventListener('change', function () {
      readFile(fileA, inputA);
    });

    fileB.addEventListener('change', function () {
      readFile(fileB, inputB);
    });

    btnCompare.addEventListener('click', runDiff);

    btnClear.addEventListener('click', clearAll);
  }

  // Drag and drop on textareas
  function setupDrop(textarea, label) {
    if (typeof document === 'undefined') return;
    textarea.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.add('drag-over');
    });
    textarea.addEventListener('dragleave', function (e) {
      e.preventDefault();
      textarea.classList.remove('drag-over');
    });
    textarea.addEventListener('drop', function (e) {
      e.preventDefault();
      textarea.classList.remove('drag-over');
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        textarea.value = ev.target.result || '';
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (typeof document !== 'undefined') {
    setupDrop(inputA);
    setupDrop(inputB);
  }

  // Ctrl+Enter to compare
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runDiff();
      }
    });
  }
})();
