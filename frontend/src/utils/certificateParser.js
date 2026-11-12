import { generateCertificateSvg } from '../services/api.js';

export function parseCsv(text) {
    const lines = [];
    let row = [];
    let inQuotes = false;
    let currentField = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            row.push(currentField.trim());
            if (row.some(f => f.length > 0)) lines.push(row);
            row = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField.length > 0 || row.length > 0) {
        row.push(currentField.trim());
        if (row.some(f => f.length > 0)) lines.push(row);
    }

    if (lines.length < 2) return [];

    const headers = lines[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        results.push(obj);
    }

    return results;
}

export function parseLinkedInCsv(csvText, recipientName = 'Candidate') {
    const rows = parseCsv(csvText);
    const certificates = [];

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const title = r.name || r.title || r.certificationname || '';
        if (!title) continue;

        const issuer = r.authority || r.issuer || r.organization || 'Issuing Authority';
        const url = r.url || r.credentialurl || r.link || '';
        const issueDate = r.startedon || r.startdate || r.issuedate || r.finishedon || '2024';
        const license = r.licensenumber || r.credentialid || r.id || `CRED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const cert = {
            id: `csv-cert-${Date.now()}-${i}`,
            title,
            issuer,
            issuer_code: issuer.split(' ')[0] || 'Verified',
            issue_date: issueDate,
            category: determineCategory(title, issuer),
            credential_id: license,
            credential_url: url,
            certificate_image: '',
            recipient_name: recipientName,
            description: `Official certification in ${title} issued by ${issuer}.`,
            skills: extractSkills(title),
            verified: true,
            badge_type: 'Verified Certificate',
            accent_color: 'from-amber-600 to-golden-600',
        };

        cert.certificate_image = generateCertificateSvg(cert, recipientName);
        certificates.push(cert);
    }

    return certificates;
}

export function parseLinkedInHtml(htmlText, recipientName = 'Candidate') {
    const certificates = [];
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const listItems = doc.querySelectorAll('li, div.pvs-entity, div.pvs-list__paged-list-item, div[data-view-name]');
        const elementsToScan = listItems.length > 0 ? Array.from(listItems) : [doc.body];

        elementsToScan.forEach((el, index) => {
            const textSpans = Array.from(el.querySelectorAll('span[aria-hidden="true"], span.t-bold, span.visually-hidden'))
                .map(s => s.textContent.trim())
                .filter(t => t.length > 1 && !t.includes('Show credential') && !t.includes('Skills:'));

            const imgEl = el.querySelector('img');
            const imgUrl = imgEl ? (imgEl.src || imgEl.getAttribute('data-delayed-url')) : '';

            const linkEl = el.querySelector('a[href*="http"]');
            const credUrl = linkEl ? linkEl.href : '';

            const fullText = el.textContent || '';
            const credIdMatch = fullText.match(/Credential ID\s*([A-Za-z0-9_-]+)/i);
            const dateMatch = fullText.match(/Issued\s*([A-Za-z]+\s*\d{4}|\d{4})/i);

            if (textSpans.length >= 1) {
                const title = textSpans[0];
                const issuer = textSpans[1] || 'Verified Issuer';

                if (title.length < 3 || title.includes('Licenses & certifications') || title.includes('Add certification')) {
                    return;
                }

                const cert = {
                    id: `html-cert-${Date.now()}-${index}`,
                    title,
                    issuer,
                    issuer_code: issuer.split(' ')[0] || 'Verified',
                    issue_date: dateMatch ? dateMatch[1] : '2024',
                    category: determineCategory(title, issuer),
                    credential_id: credIdMatch ? credIdMatch[1] : `CRED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    credential_url: credUrl,
                    certificate_image: (imgUrl && !imgUrl.includes('ghost')) ? imgUrl : '',
                    recipient_name: recipientName,
                    description: `Official certification in ${title} issued by ${issuer}.`,
                    skills: extractSkills(title),
                    verified: true,
                    badge_type: 'Verified Certificate',
                    accent_color: 'from-blue-600 to-indigo-600',
                };

                if (!cert.certificate_image) {
                    cert.certificate_image = generateCertificateSvg(cert, recipientName);
                }

                if (!certificates.some(c => c.title.toLowerCase() === title.toLowerCase())) {
                    certificates.push(cert);
                }
            }
        });
    } catch (e) {
        console.warn('HTML parsing encountered an error, falling back to text regex', e);
    }

    return certificates;
}

export function parseLinkedInPlainText(rawText, recipientName = 'Candidate') {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const certificates = [];

    const cleanLines = lines.filter(l => 
        !/^(Licenses & certifications|Add certification|Show credential|See credential|Skills:|Skills\b)/i.test(l) &&
        !/^https?:\/\//i.test(l)
    );

    let i = 0;
    while (i < cleanLines.length) {
        const potentialTitle = cleanLines[i];
        
        if (potentialTitle.length < 3 || /^(Issued|Expires|Credential ID)/i.test(potentialTitle)) {
            i++;
            continue;
        }

        const potentialIssuer = cleanLines[i + 1] || 'Issuing Authority';
        let issueDate = '2024';
        let credId = `CRED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        let advance = 2;

        for (let j = i + 1; j < Math.min(i + 5, cleanLines.length); j++) {
            const line = cleanLines[j];
            const dateMatch = line.match(/Issued\s*([A-Za-z]+\s*\d{4}|\d{4})/i);
            if (dateMatch) {
                issueDate = dateMatch[1];
                advance = Math.max(advance, j - i + 1);
            }
            const idMatch = line.match(/Credential ID\s*([A-Za-z0-9_-]+)/i);
            if (idMatch) {
                credId = idMatch[1];
                advance = Math.max(advance, j - i + 1);
            }
        }

        const cert = {
            id: `text-cert-${Date.now()}-${certificates.length}`,
            title: potentialTitle,
            issuer: potentialIssuer,
            issuer_code: potentialIssuer.split(' ')[0] || 'Verified',
            issue_date: issueDate,
            category: determineCategory(potentialTitle, potentialIssuer),
            credential_id: credId,
            credential_url: `https://www.google.com/search?q=${encodeURIComponent(potentialTitle + ' ' + potentialIssuer)}`,
            certificate_image: '',
            recipient_name: recipientName,
            description: `Demonstrated proficiency in ${potentialTitle} awarded by ${potentialIssuer}.`,
            skills: extractSkills(potentialTitle),
            verified: true,
            badge_type: 'Verified Certificate',
            accent_color: 'from-amber-600 to-golden-600',
        };

        cert.certificate_image = generateCertificateSvg(cert, recipientName);
        certificates.push(cert);
        i += advance;
    }

    return certificates;
}

export function parseScrapedCertificates(rawInput, recipientName = 'Candidate') {
    if (!rawInput || typeof rawInput !== 'string') return [];
    const trimmed = rawInput.trim();
    if (!trimmed) return [];

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
            const parsed = JSON.parse(trimmed);
            const array = Array.isArray(parsed) ? parsed : (parsed.certifications || parsed.certificates || [parsed]);
            return array.map((item, idx) => {
                const title = item.title || item.name || 'Certified Credential';
                const issuer = item.issuer || item.authority || item.organization || 'Verified Authority';
                const cert = {
                    id: item.id || `json-cert-${Date.now()}-${idx}`,
                    title,
                    issuer,
                    issuer_code: item.issuer_code || issuer.split(' ')[0] || 'Verified',
                    issue_date: item.issue_date || item.issueDate || item.date || '2024',
                    category: item.category || determineCategory(title, issuer),
                    credential_id: item.credential_id || item.credentialId || `CRED-${Date.now().toString().slice(-4)}`,
                    credential_url: item.credential_url || item.credentialUrl || '',
                    certificate_image: item.certificate_image || item.image_url || '',
                    recipient_name: item.recipient_name || recipientName,
                    description: item.description || `Verified credential in ${title}.`,
                    skills: Array.isArray(item.skills) ? item.skills : extractSkills(title),
                    verified: item.verified !== false,
                    badge_type: item.badge_type || 'Verified Certificate',
                    accent_color: item.accent_color || 'from-blue-600 to-indigo-600',
                };
                if (!cert.certificate_image) {
                    cert.certificate_image = generateCertificateSvg(cert, cert.recipient_name);
                }
                return cert;
            });
        } catch (e) {
        }
    }

    if (trimmed.includes(',') && (trimmed.toLowerCase().includes('authority') || trimmed.toLowerCase().includes('licensenumber') || trimmed.toLowerCase().includes('started on'))) {
        const csvResults = parseLinkedInCsv(trimmed, recipientName);
        if (csvResults.length > 0) return csvResults;
    }

    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
        const htmlResults = parseLinkedInHtml(trimmed, recipientName);
        if (htmlResults.length > 0) return htmlResults;
    }

    return parseLinkedInPlainText(trimmed, recipientName);
}

function determineCategory(title, issuer) {
    const combined = `${title} ${issuer}`.toLowerCase();
    if (combined.includes('security') || combined.includes('cyber') || combined.includes('osint') || combined.includes('forensic') || combined.includes('hacker') || combined.includes('cissp') || combined.includes('comptia')) {
        return 'Cybersecurity';
    }
    if (combined.includes('data') || combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('analytics') || combined.includes('sql') || combined.includes('python')) {
        return 'AI & Data Science';
    }
    if (combined.includes('nasa') || combined.includes('isro') || combined.includes('open science') || combined.includes('geo')) {
        return 'Open Science';
    }
    return 'Cybersecurity';
}

function extractSkills(title) {
    const common = ['Python', 'AWS', 'Security', 'Docker', 'Linux', 'SQL', 'OSINT', 'Data Science', 'Machine Learning', 'Forensics', 'React', 'Kubernetes', 'Cloud'];
    const matched = common.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(title));
    return matched.length > 0 ? matched : ['Technical Analysis', 'Certification'];
}
