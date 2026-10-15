// Toolbar and shortcut actions for the Markdown textarea. Every edit goes
// through replaceRange, which uses the browser's insertText command where it
// exists so Ctrl+Z undoes a toolbar action like any typed text.

function replaceRange(ta, start, end, text, selStart, selEnd) {
  ta.focus()
  ta.setSelectionRange(start, end)
  const ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, text)
  if (!ok || ta.value.slice(start, start + text.length) !== text) {
    ta.setRangeText(text, start, end, 'end')
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }
  ta.setSelectionRange(selStart ?? start + text.length, selEnd ?? selStart ?? start + text.length)
}

// Wraps the selection in a marker (**, _, `, ~~), or unwraps it if the
// marker is already there, so the same button toggles.
function wrap(ta, marker, placeholder) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const before = value.slice(s - marker.length, s)
  const after = value.slice(e, e + marker.length)
  if (before === marker && after === marker) {
    const inner = value.slice(s, e)
    replaceRange(ta, s - marker.length, e + marker.length, inner, s - marker.length, e - marker.length)
    return
  }
  const inner = value.slice(s, e) || placeholder
  replaceRange(ta, s, e, `${marker}${inner}${marker}`, s + marker.length, s + marker.length + inner.length)
}

// Expands the selection to whole lines.
function lineRange(ta) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const start = value.lastIndexOf('\n', s - 1) + 1
  let end = value.indexOf('\n', e > s && value[e - 1] === '\n' ? e - 1 : e)
  if (end === -1) end = value.length
  return { start, end, lines: value.slice(start, end).split('\n') }
}

const PREFIX_RE = /^(#{1,6} |> |- \[[ x]\] |[-*] |\d+\. )/

// Adds a line prefix (heading, quote, list) to every selected line, or strips
// it if every line already has it. Switching between kinds (a bullet list into
// a numbered one) replaces the old prefix.
function prefixLines(ta, kind) {
  const { start, end, lines } = lineRange(ta)
  const prefixFor = (i) => (kind === 'ol' ? `${i + 1}. ` : kind)
  const has = (line, i) =>
    kind === 'ol' ? /^\d+\. /.test(line) : line.startsWith(prefixFor(i))
  const allHave = lines.every((l, i) => !l.trim() || has(l, i))
  const next = lines
    .map((line, i) => {
      if (!line.trim() && lines.length > 1) return line
      const bare = line.replace(PREFIX_RE, '')
      return allHave ? bare : prefixFor(i) + bare
    })
    .join('\n')
  replaceRange(ta, start, end, next, start, start + next.length)
}

// Puts a block on its own lines, with a blank line before and after.
function insertBlock(ta, block, selectFrom, selectLength) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const lead = s === 0 ? '' : value.slice(Math.max(0, s - 2), s) === '\n\n' ? '' : value[s - 1] === '\n' ? '\n' : '\n\n'
  const tail = value.slice(e, e + 2) === '\n\n' || e === value.length ? '\n' : value[e] === '\n' ? '\n' : '\n\n'
  const text = `${lead}${block}${tail}`
  const at = s + lead.length + (selectFrom ?? block.length)
  replaceRange(ta, s, e, text, at, at + (selectLength ?? 0))
}

export const FORMATS = {
  h2: (ta) => prefixLines(ta, '## '),
  h3: (ta) => prefixLines(ta, '### '),
  bold: (ta) => wrap(ta, '**', 'bold text'),
  italic: (ta) => wrap(ta, '_', 'italic text'),
  strike: (ta) => wrap(ta, '~~', 'struck text'),
  code: (ta) => wrap(ta, '`', 'code'),
  link: (ta) => {
    const { selectionStart: s, selectionEnd: e, value } = ta
    const sel = value.slice(s, e)
    if (/^https?:\/\/\S+$/.test(sel)) {
      replaceRange(ta, s, e, `[link text](${sel})`, s + 1, s + 10)
    } else {
      const label = sel || 'link text'
      const text = `[${label}](https://)`
      const urlAt = s + label.length + 3
      replaceRange(ta, s, e, text, sel ? urlAt : s + 1, sel ? urlAt + 8 : s + 1 + label.length)
    }
  },
  quote: (ta) => prefixLines(ta, '> '),
  ul: (ta) => prefixLines(ta, '- '),
  ol: (ta) => prefixLines(ta, 'ol'),
  task: (ta) => prefixLines(ta, '- [ ] '),
  codeblock: (ta) => {
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd)
    const inner = sel || 'code'
    insertBlock(ta, `\`\`\`js\n${inner}\n\`\`\``, 6, sel ? 0 : inner.length)
  },
  hr: (ta) => insertBlock(ta, '---'),
  table: (ta) =>
    insertBlock(ta, '| Column | Column |\n| --- | --- |\n| Cell | Cell |', 2, 6),
}

// Drops an uploaded image in on its own line, with the alt text selected so
// it's easy to replace with a real description.
export function insertImage(ta, alt, url) {
  insertBlock(ta, `![${alt}](${url})`, 2, alt.length)
}

// Ctrl/Cmd shortcuts handled inside the textarea.
export const SHORTCUTS = { b: 'bold', i: 'italic', k: 'link', e: 'code' }
