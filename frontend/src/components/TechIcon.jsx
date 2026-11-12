import React from 'react';

export const TECH_ICONS = {
    python: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.006 2.752h5.814v.826H3.898s-3.898.442-3.898 6.304c0 5.86 3.406 5.674 3.406 5.674h2.036v-2.868s-.11-3.416 3.354-3.416h5.783v-.86H8.814v-2.45h11.45s3.23.368 3.23-5.52c0-5.89-2.92-5.598-2.92-5.598H11.914zm-3.03 1.748a1.05 1.05 0 110 2.102 1.05 1.05 0 010-2.102z" />
            <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.006-2.752h-5.814v-.826h8.122s3.898-.442 3.898-6.304c0-5.86-3.406-5.674-3.406-5.674h-2.036v2.868s.11 3.416-3.354 3.416H9.419v.86h5.785v2.45H3.754s-3.23-.368-3.23 5.52c0 5.89 2.92 5.598 2.92 5.598h8.642zm3.03-1.748a1.05 1.05 0 110-2.102 1.05 1.05 0 010 2.102z" />
        </svg>
    ),
    javascript: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M3 3h18v18H3V3zm15.7 13.9c-.3.8-.9 1.4-1.8 1.8-1 .4-2.3.4-3.4-.1-.7-.3-1.2-.8-1.5-1.5l1.6-1c.2.4.5.8.8 1 .4.2.9.3 1.5.2.5 0 .9-.1 1.2-.4.3-.2.4-.6.4-1.1 0-.5-.2-.9-.5-1.1-.3-.3-.9-.6-1.7-.9-1.2-.5-2-.9-2.5-1.4-.5-.5-.8-1.2-.8-2 0-.8.3-1.5.8-2 .6-.6 1.4-.9 2.4-1 1 0 1.8.2 2.5.6.7.4 1.1 1 1.4 1.7l-1.6 1c-.2-.4-.4-.7-.7-.9-.4-.2-.8-.3-1.3-.3-.5 0-.9.1-1.2.3-.3.2-.4.5-.4.9 0 .4.2.7.5.9.3.2.9.5 1.7.8 1.3.5 2.1 1 2.6 1.5.5.6.8 1.4.8 2.4 0 .4-.1.7-.3 1zm-7.4-5.3h1.8v6.7c0 .9-.3 1.6-.8 2.1-.6.5-1.4.8-2.5.8-.8 0-1.6-.2-2.3-.6-.7-.4-1.1-1-1.3-1.7l1.6-.9c.2.4.4.8.7 1 .3.2.7.3 1.2.3.5 0 .9-.1 1.1-.4.3-.3.4-.7.4-1.3v-6z" />
        </svg>
    ),
    typescript: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M1.5 0h21A1.5 1.5 0 0124 1.5v21a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 22.5v-21A1.5 1.5 0 011.5 0zm9.4 11.2H7.7v8.9H5.5v-8.9H2.3V9.4h8.6v1.8zm10 4.9c0 .9-.3 1.6-.9 2.1-.6.5-1.5.8-2.6.8-1 0-1.9-.3-2.6-.8-.7-.5-1.2-1.2-1.4-2.1l2-.8c.2.6.5 1 1 1.3.4.3.9.4 1.5.4.6 0 1.1-.1 1.4-.4.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1-.3-.3-.9-.6-1.8-.9-1.3-.5-2.2-1-2.7-1.6-.5-.6-.8-1.3-.8-2.2 0-.9.4-1.7 1.1-2.3.7-.6 1.6-.9 2.7-.9 1 0 1.8.2 2.5.7.7.5 1.1 1.1 1.3 1.9l-2 .8c-.1-.4-.4-.8-.7-1-.4-.2-.8-.4-1.4-.4-.5 0-.9.1-1.3.4-.3.2-.5.6-.5 1 0 .4.2.7.5.9.3.2.9.5 1.8.8 1.4.5 2.3 1 2.8 1.6.5.6.8 1.5.8 2.5z" />
        </svg>
    ),
    react: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <ellipse cx="12" cy="12" rx="10.5" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10.5" ry="4.2" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10.5" ry="4.2" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
    ),
    docker: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186m-2.954 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.145a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186m5.884 2.714h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.887c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.887c0 .102.083.185.185.185m-2.954 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.145a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.887c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.493.924-.619 1.434-.524.238-.992.585-1.373 1.018l-.19.213.125.263c.594 1.25.64 2.68.127 3.972-.416 1.05-1.196 1.905-2.203 2.417-1.135.576-2.428.875-3.731.864H.58c-.32 0-.58.26-.58.58 0 4.418 3.582 8 8 8 5.626 0 10.457-3.923 11.66-9.475 2.14-.14 3.99-1.572 4.093-4.148l.01-.3-.02-.072z" />
        </svg>
    ),
    git: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M23.546 10.93L13.067.452a1.5 1.5 0 00-2.122 0L8.85 2.547l3.262 3.262a2.378 2.378 0 012.98 2.99l3.14 3.14a2.38 2.38 0 11-1.42 1.42l-2.92-2.92v6.082a2.38 2.38 0 11-2 0V9.87a2.38 2.38 0 01-1.28-3.11L7.35 3.5 1.455 9.395a1.5 1.5 0 000 2.122l10.48 10.48a1.5 1.5 0 002.122 0l9.49-9.49a1.5 1.5 0 000-2.122z" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
    ),
    html: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M1.5 0h21l-1.9 21.3L12 24l-8.6-2.7L1.5 0zm17 5.6H5.5l.4 4.5h11.8l-.5 5.5-4.2 1.2-4.2-1.2-.3-3.1H5.7l.5 5.5 5.8 1.6 5.8-1.6 1.2-12.4H18.5z" />
        </svg>
    ),
    css: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M1.5 0h21l-1.9 21.3L12 24l-8.6-2.7L1.5 0zm16.7 5.6H5.8l.3 3.5h11.7l-.4 4.5h-8l.2 2.5 4.4 1.2 4.4-1.2.5-5.5H15l-.2 2.2-2.8.8-2.8-.8-.2-2.2h8.9l.7-7.8z" />
        </svg>
    ),
    tailwind: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
        </svg>
    ),
    database: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    ),
    ai: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    ),
    cpu: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path>
        </svg>
    ),
    code: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    ),
    server: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
    ),
    award: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
    ),
    wrench: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    ),
    medium: (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
    )
};

export const normalizeSkillKey = (name) => {
    if (!name || typeof name !== 'string') return 'code';
    const clean = name.toLowerCase().trim();
    if (clean.includes('python')) return 'python';
    if (clean === 'js' || clean.includes('javascript')) return 'javascript';
    if (clean === 'ts' || clean.includes('typescript')) return 'typescript';
    if (clean.includes('react')) return 'react';
    if (clean.includes('docker')) return 'docker';
    if (clean === 'git') return 'git';
    if (clean.includes('github')) return 'github';
    if (clean.includes('html')) return 'html';
    if (clean.includes('css')) return 'css';
    if (clean.includes('tailwind')) return 'tailwind';
    if (clean.includes('sql') || clean.includes('database') || clean.includes('sqlite') || clean.includes('mysql') || clean.includes('postgres')) return 'database';
    if (clean.includes('ai') || clean.includes('ml') || clean.includes('llm') || clean.includes('claude') || clean.includes('gemini')) return 'cpu';
    if (clean.includes('server') || clean.includes('backend') || clean.includes('flask') || clean.includes('django') || clean.includes('node') || clean.includes('api')) return 'server';
    if (clean.includes('tool') || clean.includes('windsurf') || clean.includes('linux')) return 'wrench';
    if (clean.includes('leet') || clean.includes('hack') || clean.includes('code') || clean.includes('dsa') || clean.includes('platform')) return 'award';
    return 'code';
};

const TechIcon = ({ name, className = "w-5 h-5", fallbackIcon = null }) => {
    const key = normalizeSkillKey(name);
    const icon = TECH_ICONS[key] || fallbackIcon || TECH_ICONS.code;

    return (
        <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
            {icon}
        </span>
    );
};

export default TechIcon;
