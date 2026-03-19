'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { clsx } from 'clsx';
import { ChevronDown, UploadCloud, Copy, Wand2, Hash } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useCodeFont } from '../hooks/useCodeFont';
import { CODE_FONTS } from '../fonts';

export const LANGUAGES = [
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'go', label: 'Go', ext: 'go' },
  { id: 'rust', label: 'Rust', ext: 'rs' },
  { id: 'css', label: 'CSS', ext: 'css' },
  { id: 'html', label: 'HTML', ext: 'html' },
  { id: 'sql', label: 'SQL', ext: 'sql' },
  { id: 'json', label: 'JSON', ext: 'json' },
  { id: 'bash', label: 'Bash', ext: 'sh' },
];

interface EditorPanelProps {
  code: string;
  setCode: (c: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  fileName: string;
}

export function EditorPanel({
  code,
  setCode,
  language,
  setLanguage,
  fileName,
}: EditorPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [tabSize, setTabSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);
  const [formatStatus, setFormatStatus] = useState<string>('');
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();
  const { codeFont } = useCodeFont();
  const activeFontFamily =
    CODE_FONTS.find((f) => f.id === codeFont)?.fontFamily ||
    '"JetBrains Mono", monospace';

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (!editorRef.current) return;
    const action = editorRef.current.getAction('editor.action.formatDocument');
    if (action && action.isSupported()) {
      action.run().then(() => {
        setFormatStatus('Formatted!');
        setTimeout(() => setFormatStatus(''), 2000);
      });
    } else {
      setFormatStatus('Not Supported for ' + language.toUpperCase());
      setTimeout(() => setFormatStatus(''), 3000);
    }
  };

  const handleTabToggle = () => {
    const newSize = tabSize === 2 ? 4 : 2;
    setTabSize(newSize);
    if (editorRef.current) {
      editorRef.current.getModel()?.updateOptions({ tabSize: newSize });
    }

    let detectedIndent: number = tabSize;
    const lines = code.split('\n');
    for (const line of lines) {
      const match = line.match(/^( +)\S/);
      if (match && match[1].length > 1) {
        // Find the first line with meaningful leading spaces (e.g. 2, 4, 8)
        detectedIndent = match[1].length;
        if (detectedIndent === 2 || detectedIndent === 4) {
          break; // Stop at the first reliable indent level
        }
      }
    }

    if (detectedIndent === newSize) {
      return; // The text already matches the desired visual size!
    }

    const reindented = lines
      .map((line) => {
        const leadingMatch = line.match(/^( +)/);
        if (leadingMatch) {
          const oldSpacesCount = leadingMatch[1].length;
          const levels = oldSpacesCount / detectedIndent;
          const newSpacesCount = Math.max(1, Math.round(levels * newSize));
          return ' '.repeat(newSpacesCount) + line.substring(oldSpacesCount);
        }
        return line;
      })
      .join('\n');

    if (reindented !== code) {
      setCode(reindented);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setCode(content);
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const match = LANGUAGES.find((l) => l.ext === ext);
        if (match) setLanguage(match.id);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface-raised)] rounded-[var(--r-xl)] border border-[var(--border-dark)] shadow-[var(--shadow-panel)] overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-titlebar)] border-b border-[var(--border-dark)] shadow-[inset_0_1px_0_var(--border-light)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 opacity-80">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--tl-red)]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--tl-yellow)]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--tl-green)]"></div>
          </div>
          <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase hidden sm:block">
            Input Editor
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="px-2 py-1.5 flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[11px] font-semibold tracking-wide"
          >
            {copied ? (
              <span className="text-green-500 font-medium px-1 whitespace-nowrap">
                Copied
              </span>
            ) : (
              <>
                <Copy size={13} /> Copy
              </>
            )}
          </button>

          <button
            onClick={handleFormat}
            className="px-2 py-1.5 flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[11px] font-semibold tracking-wide min-w-[75px]"
          >
            {formatStatus ? (
              <span
                className={
                  formatStatus === 'Formatted!'
                    ? 'text-green-500 whitespace-nowrap'
                    : 'text-orange-400 whitespace-nowrap'
                }
              >
                {formatStatus}
              </span>
            ) : (
              <>
                <Wand2 size={13} /> Format
              </>
            )}
          </button>

          <button
            onClick={handleTabToggle}
            className="px-2 py-1.5 flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-[11px] font-semibold tracking-wide"
          >
            <Hash size={13} /> {tabSize} Spaces
          </button>

          <div className="w-px h-4 bg-[var(--border-dark)] mx-1" />

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-[var(--surface-raised)] border border-[var(--border-dark)] shadow-[inset_0_1px_0_var(--border-light),0_2px_4px_rgba(0,0,0,0.1)] rounded-[var(--r-sm)] pl-3 pr-8 py-1.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option
                  key={l.id}
                  value={l.id}
                  className="bg-gray-800 text-white"
                >
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Editor Well */}
      <div
        className="p-3 bg-[var(--surface-raised)] relative flex-1 flex flex-col min-h-[300px]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={clsx(
            'flex-1 w-full rounded-[var(--r-md)] border border-[var(--border-editor)] shadow-[var(--shadow-inset)] overflow-hidden relative bg-[var(--surface-editor)] transition-colors duration-300 flex flex-col',
            isDragging &&
              'ring-2 ring-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)] filter brightness-110'
          )}
        >
          {/* File Tab mimic */}
          <div className="flex px-4 pt-3 pb-2 border-b border-black/20 bg-black/10 shrink-0">
            <span className="text-xs font-mono px-3 py-1 rounded bg-black/20 text-gray-300 dark:text-gray-300 shadow-inner">
              {fileName}
            </span>
          </div>

          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              theme="transparent-theme"
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('transparent-theme', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#00000000',
                    'editor.lineHighlightBackground': '#ffffff08',
                    'editorGutter.background': '#00000000',
                    'editorWidget.background': '#1e1e2e',
                    'editorSuggestWidget.background': '#1e1e2e',
                  },
                });
              }}
              options={{
                minimap: { enabled: false },
                fontFamily: activeFontFamily,
                fontSize: 14,
                tabSize: tabSize,
                fontLigatures: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                roundedSelection: true,
                cursorBlinking: 'phase',
              }}
            />
          </div>

          {/* Drag Overlay */}
          <div
            className={clsx(
              'absolute inset-0 bg-[var(--accent)]/10 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-[var(--accent)] font-medium transition-opacity duration-200 pointer-events-none',
              isDragging ? 'opacity-100' : 'opacity-0'
            )}
          >
            <UploadCloud size={48} className="animate-bounce" />
            <span className="text-lg tracking-wide shadow-sm">
              Drop file to load code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
