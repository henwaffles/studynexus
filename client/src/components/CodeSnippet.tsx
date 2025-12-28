import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

// Import language support
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

interface CodeSnippetProps {
  code: string;
  language: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C#': 'csharp',
  'Ruby': 'ruby',
  'Go': 'go',
  'Rust': 'rust',
  'PHP': 'php',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'HTML': 'markup',
  'CSS': 'css',
  'SQL': 'sql',
  'Bash': 'bash',
  'JSON': 'json',
  'YAML': 'yaml',
  'Markdown': 'markdown',
  'None': 'plaintext',
  'Other': 'plaintext',
};

export default function CodeSnippet({ code, language }: CodeSnippetProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const prismLanguage = LANGUAGE_MAP[language] || 'plaintext';

  useEffect(() => {
    if (codeRef.current) {
      try {
        Prism.highlightElement(codeRef.current);
      } catch (err) {
        console.error('Prism highlight failed:', err);
      }
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!code || code.trim() === '') {
    return null;
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-background-dark px-4 py-2 rounded-t-lg border-b border-border-dark">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-card-hover hover:bg-border-dark text-white rounded transition-colors duration-200 ease-out"
          title="Copy to clipboard"
        >
          <span className="material-symbols-outlined text-sm">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-background-dark rounded-b-lg overflow-x-auto border border-border-dark border-t-0">
        <pre className="!m-0 !p-4 !bg-transparent text-sm">
          <code
            ref={codeRef}
            className={`language-${prismLanguage}`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
