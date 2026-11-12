import React from 'react';

const FormattedText = ({ text = '', className = '' }) => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    const paragraphs = text.split(/\n{2,}/);

    const formatInline = (str) => {
        const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-semibold text-navy-800 dark:text-soft-cream-100">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return (
                    <em key={index} className="italic text-navy-700 dark:text-soft-cream-200">
                        {part.slice(1, -1)}
                    </em>
                );
            }
            return part;
        });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {paragraphs.map((paragraph, pIdx) => {
                const lines = paragraph.split(/\n/);
                return (
                    <p key={pIdx} className="leading-relaxed">
                        {lines.map((line, lIdx) => (
                            <React.Fragment key={lIdx}>
                                {formatInline(line)}
                                {lIdx < lines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
};

export default FormattedText;

