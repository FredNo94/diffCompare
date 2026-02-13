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

  function getMode() {
    return document.querySelector('input[name="mode"]:checked').value;
  }

  function normalizeJson(str) {
    var s = str.trim();
    if (!s) return '';
    try {
      var parsed = JSON.parse(s);
      return JSON.stringify(parsed, null, 2);
    } catch (_) {
      return str;
    }
  }

  function getTextA() {
    var t = inputA.value.trim();
    return getMode() === 'json' ? normalizeJson(t) : t;
  }

  function getTextB() {
    var t = inputB.value.trim();
    return getMode() === 'json' ? normalizeJson(t) : t;
  }

  function runDiff() {
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
    diffSection.classList.add('visible');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function clearAll() {
    inputA.value = '';
    inputB.value = '';
    fileA.value = '';
    fileB.value = '';
    diffSection.classList.remove('visible');
    diffOutput.innerHTML = '';
    diffStats.textContent = '';
  }

  function readFile(fileInput, targetTextarea) {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      targetTextarea.value = e.target.result || '';
    };
    reader.readAsText(file, 'UTF-8');
  }

  fileA.addEventListener('change', function () {
    readFile(fileA, inputA);
  });

  fileB.addEventListener('change', function () {
    readFile(fileB, inputB);
  });

  btnCompare.addEventListener('click', runDiff);

  btnClear.addEventListener('click', clearAll);

  // Drag and drop on textareas
  function setupDrop(textarea, label) {
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

  setupDrop(inputA);
  setupDrop(inputB);

  // Ctrl+Enter to compare
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runDiff();
    }
  });
})();
