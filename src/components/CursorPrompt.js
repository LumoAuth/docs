import React, { useState } from 'react';

export default function CursorPrompt({ prompt }) {
  const [copied, setCopied] = useState(false);

  const cursorUrl = `https://cursor.com/link/prompt?text=${encodeURIComponent(prompt)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    }}>
      <a
        href={cursorUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 500,
          color: '#fff',
          backgroundColor: '#000',
          textDecoration: 'none',
          border: '1px solid #333',
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 1.5L1.5 7L7 9L9 14.5L14.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
        Open in Cursor
      </a>
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--ifm-font-color-base)',
          backgroundColor: 'transparent',
          border: '1px solid var(--ifm-color-emphasis-300)',
          cursor: 'pointer',
        }}
      >
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy prompt
          </>
        )}
      </button>
    </div>
  );
}
