import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { portfolioAPI, certificateAPI, generateCertificateSvg, CERTIFICATIONS_DATA } from '../../services/api';
import { parseScrapedCertificates } from '../../utils/certificateParser.js';
import {
    Search, Plus, Trash2, RotateCcw, Upload, Check, CheckSquare,
    Square, ChevronDown, ChevronUp, ExternalLink, Sparkles,
    Filter, AlertCircle, ArrowUp, ArrowDown, Award, ShieldCheck, Eye, EyeOff, RefreshCw,
    HelpCircle, Info, FileText, ClipboardPaste, UploadCloud, X
} from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'Cybersecurity', label: 'Cybersecurity & OSINT' },
    { id: 'AI & Data Science', label: 'AI & Data Science' },
    { id: 'Open Science', label: 'NASA Open Science' },
    { id: 'Leadership & Events', label: 'Leadership' },
];

const CertificationsTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const certifications = portfolio.certifications || [];

    const defaultHandle = portfolio.social_links?.linkedin
        ? certificateAPI.extractUsername(portfolio.social_links.linkedin)
        : (portfolio.username || 'username');

    const [usernameInput, setUsernameInput] = useState(defaultHandle);
    const [isFetching, setIsFetching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [fetchedCerts, setFetchedCerts] = useState(CERTIFICATIONS_DATA);
    const [selectedCertMap, setSelectedCertMap] = useState({});
    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [importSuccessMsg, setImportSuccessMsg] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRefs = useRef({});

    const [importMethod, setImportMethod] = useState('paste');
    const [rawScrapedText, setRawScrapedText] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [helpTab, setHelpTab] = useState('copy-paste');
    const csvFileInputRef = useRef(null);

    const existingCertIdentifiers = useMemo(() => {
        const set = new Set();
        certifications.forEach(c => {
            if (c.credential_id) set.add(c.credential_id.toLowerCase());
            if (c.title) set.add(c.title.toLowerCase());
        });
        return set;
    }, [certifications]);

    const handleFetchCertificates = async () => {
        setIsFetching(true);
        setImportSuccessMsg(null);
        try {
            const query = (usernameInput || '').trim() || portfolio.username || 'username';
            const certs = await certificateAPI.fetchUserCertificates(query);
            setFetchedCerts(certs);

            const initialMap = {};
            certs.forEach(cert => {
                initialMap[cert.id] = true;
            });

            setSelectedCertMap(initialMap);
            setShowDropdown(true);

            const person = certs[0]?.recipient_name || certificateAPI.formatDisplayName(query);
            setImportSuccessMsg(`Found ${certs.length} verified credentials for "${person}"! Checkmark certificates and import below.`);
        } catch (err) {
            console.error('Failed to fetch certificates:', err);
            setImportSuccessMsg('Could not fetch certificates. You can still add certificates manually below.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleParseScrapedData = (textToParse = rawScrapedText) => {
        const text = (typeof textToParse === 'string' ? textToParse : rawScrapedText) || '';
        if (!text.trim()) {
            setImportSuccessMsg('Please paste your copied LinkedIn certifications text, HTML, or CSV first.');
            return;
        }

        setIsFetching(true);
        try {
            const recipient = portfolio.name || 'Candidate';
            const extracted = parseScrapedCertificates(text, recipient);

            if (extracted.length === 0) {
                setImportSuccessMsg('Could not detect certifications in the pasted data. Click the (?) guide for quick instructions.');
                return;
            }

            setFetchedCerts(extracted);
            const map = {};
            extracted.forEach(c => { map[c.id] = true; });
            setSelectedCertMap(map);
            setShowDropdown(true);

            setImportSuccessMsg(`🎉 Successfully extracted ${extracted.length} certifications! Review and checkmark below.`);
        } catch (err) {
            console.error('Failed to parse scraped data:', err);
            setImportSuccessMsg('Parsing error: please check the pasted format or click (?) for guidance.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                setRawScrapedText(content);
                handleParseScrapedData(content);
            }
        };
        reader.readAsText(file);
    };

    const handleLoadSampleData = () => {
        const sample = `AWS Certified Solutions Architect - Professional
Amazon Web Services (AWS)
Issued Sep 2024 · Expires Sep 2027
Credential ID AWS-SAP-98124
Show credential

Google Cloud Professional Cloud Architect
Google Cloud
Issued Jan 2024
Credential ID GCP-PCA-5531
Show credential

Certified Information Systems Security Professional (CISSP)
(ISC)²
Issued May 2024
Credential ID CISSP-88210
Show credential`;

        setRawScrapedText(sample);
        handleParseScrapedData(sample);
        setShowHelpModal(false);
    };

    const filteredFetchedCerts = useMemo(() => {
        return fetchedCerts.filter(cert => {
            const matchesSearch = !searchFilter.trim() ||
                (cert.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                (cert.issuer || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                (cert.description || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                (cert.credential_id || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                (cert.recipient_name || '').toLowerCase().includes(searchFilter.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [fetchedCerts, searchFilter, categoryFilter]);

    const handleToggleCert = (certId) => {
        setSelectedCertMap(prev => ({
            ...prev,
            [certId]: !prev[certId]
        }));
    };

    const isAllSelected = filteredFetchedCerts.length > 0 &&
        filteredFetchedCerts.every(c => selectedCertMap[c.id]);

    const handleToggleSelectAll = () => {
        const next = { ...selectedCertMap };
        if (isAllSelected) {
            filteredFetchedCerts.forEach(c => { next[c.id] = false; });
        } else {
            filteredFetchedCerts.forEach(c => { next[c.id] = true; });
        }
        setSelectedCertMap(next);
    };

    const handleImportSelected = () => {
        const toAdd = fetchedCerts.filter(c => selectedCertMap[c.id]);
        if (toAdd.length === 0) {
            setShowDropdown(false);
            return;
        }

        const existingIds = new Set(certifications.map(c => c.credential_id?.toLowerCase() || c.title?.toLowerCase()));
        const uniqueToAdd = toAdd
            .filter(c => !existingIds.has(c.credential_id?.toLowerCase()) && !existingIds.has(c.title?.toLowerCase()))
            .map(c => ({
                ...c,
                id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            }));

        const updated = [...certifications, ...uniqueToAdd];
        updateField('certifications', updated);
        setShowDropdown(false);

        setImportSuccessMsg(`Imported ${uniqueToAdd.length} certificates into your 3D runway deck!`);
        setTimeout(() => setImportSuccessMsg(null), 5000);
    };

    const handleReplaceWithSelected = () => {
        const toAdd = fetchedCerts.filter(c => selectedCertMap[c.id]);
        if (toAdd.length === 0) return;

        const formatted = toAdd.map(c => ({
            ...c,
            id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        }));

        updateField('certifications', formatted);
        setShowDropdown(false);

        setImportSuccessMsg(`Replaced active deck with ${formatted.length} verified credentials!`);
        setTimeout(() => setImportSuccessMsg(null), 5000);
    };

    const handleAddManualCert = () => {
        const dummyTitle = 'New Certification Title';
        const dummyIssuer = 'Issuing Organization';
        const dummyId = `CRED-${Date.now().toString().slice(-4)}`;
        const recipient = portfolio.name || 'Candidate';
        const newCert = {
            id: `cert-${Date.now()}`,
            title: dummyTitle,
            issuer: dummyIssuer,
            issuer_code: 'Issuer',
            category: 'Cybersecurity',
            issue_date: '2026-01',
            credential_id: dummyId,
            credential_url: '',
            certificate_image: generateCertificateSvg({ title: dummyTitle, issuer: dummyIssuer, credential_id: dummyId }, recipient),
            description: 'Credential description and achievements.',
            skills: ['Security', 'Analysis'],
            verified: true,
            badge_type: 'Verified Certificate',
            accent_color: 'from-blue-600 to-indigo-600',
            recipient_name: recipient,
        };
        updateField('certifications', [...certifications, newCert]);
    };

    const handleUpdateCert = (index, field, value) => {
        const copy = [...certifications];
        copy[index] = { ...copy[index], [field]: value };
        updateField('certifications', copy);
    };

    const handleRemoveCert = (index) => {
        updateField('certifications', certifications.filter((_, i) => i !== index));
    };

    const handleMoveCert = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= certifications.length) return;
        const copy = [...certifications];
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        updateField('certifications', copy);
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        setUploadingId(index);
        try {
            const res = await portfolioAPI.uploadFile(file);
            const serverUrl = res.data.url;
            handleUpdateCert(index, 'certificate_image', serverUrl);
        } catch (err) {
            console.error('Failed to upload certificate image:', err);
        } finally {
            setUploadingId(null);
        }
    };

    const selectedCount = Object.values(selectedCertMap).filter(Boolean).length;

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                            <Award className="w-6 h-6 text-golden-500" />
                            <span>Licenses & Certifications</span>
                        </h2>
                        <button
                            type="button"
                            onClick={() => updateField('sections_visibility.certifications', portfolio.sections_visibility?.certifications === false ? true : false)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                portfolio.sections_visibility?.certifications !== false
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                            title="Toggle whether Certifications is visible in your public portfolio"
                        >
                            {portfolio.sections_visibility?.certifications !== false ? (
                                <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Section Visible</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>Section Hidden</span>
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400 mt-1">
                        Showcase verified technical credentials rendered in the 3D scroll runway deck. Search by username to auto-fetch credentials, or hide this section if you don't have certifications yet.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => updateField('sections_visibility.certifications', portfolio.sections_visibility?.certifications === false ? true : false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                            portfolio.sections_visibility?.certifications !== false
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                        }`}
                    >
                        {portfolio.sections_visibility?.certifications !== false ? (
                            <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide Section</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show Section</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => resetSection('certifications')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors cursor-pointer shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                </div>
            </div>

            {portfolio.sections_visibility?.certifications === false && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-xl bg-amber-200/70 dark:bg-amber-900/50">
                            <EyeOff className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        </span>
                        <div>
                            <span className="font-bold">Certifications section is currently hidden from your live portfolio.</span>
                            <span className="block text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                                Perfect for candidates with no certifications yet. Your navbar link and scroll deck are omitted from the live page. Click "Show Section" anytime when ready.
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateField('sections_visibility.certifications', true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
                    >
                        Enable Section
                    </button>
                </div>
            )}

            {importSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center justify-between animate-slide-down shadow-sm">
                    <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{importSuccessMsg}</span>
                    </span>
                    <button onClick={() => setImportSuccessMsg(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
                        ✕
                    </button>
                </div>
            )}

            <div className="p-5 rounded-3xl glass border border-golden-500/30 dark:border-golden-500/20 shadow-md bg-gradient-to-br from-soft-cream-100/70 via-white/50 to-golden-50/30 dark:from-navy-950/80 dark:via-navy-900/60 dark:to-golden-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-golden-500" />
                                <span>Import Real LinkedIn Certifications</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-golden-100 hover:bg-golden-200 dark:bg-golden-950/90 dark:hover:bg-golden-900 text-golden-800 dark:text-golden-300 border border-golden-300/80 dark:border-golden-700 shadow-2xs transition-all cursor-pointer"
                                title="Click for simple step-by-step instructions on extracting your certificates from LinkedIn"
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
                                <span>How to extract data?</span>
                            </button>
                        </div>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400 mt-0.5">
                            Paste your copied LinkedIn certifications text or inspect HTML, upload an official CSV export, or search by profile handle.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="text-xs font-semibold text-golden-700 dark:text-golden-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span>{showDropdown ? 'Hide Checklist' : 'Show Checklist'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 border-b border-soft-cream-300/80 dark:border-navy-800 pb-2.5 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setImportMethod('paste')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            importMethod === 'paste'
                                ? 'bg-navy-800 text-white dark:bg-golden-500 dark:text-navy-950 shadow-sm'
                                : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                        }`}
                    >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>📋 Paste Text / HTML</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setImportMethod('csv')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            importMethod === 'csv'
                                ? 'bg-navy-800 text-white dark:bg-golden-500 dark:text-navy-950 shadow-sm'
                                : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>📁 Upload LinkedIn CSV</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setImportMethod('search')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            importMethod === 'search'
                                ? 'bg-navy-800 text-white dark:bg-golden-500 dark:text-navy-950 shadow-sm'
                                : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span>🔍 Auto-Fetch by Name / URL</span>
                    </button>
                </div>

                {importMethod === 'paste' && (
                    <div className="space-y-2.5 animate-fade-in">
                        <textarea
                            rows={4}
                            value={rawScrapedText}
                            onChange={(e) => setRawScrapedText(e.target.value)}
                            placeholder="Paste copied text or inspect HTML from your LinkedIn Certifications page here...&#10;Tip: Press Ctrl+A and Ctrl+C on your LinkedIn certifications page, then paste here!"
                            className="input w-full p-3 text-xs font-mono bg-white/70 dark:bg-navy-900/70 border border-soft-cream-300 dark:border-navy-700 rounded-2xl resize-y shadow-xs"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleParseScrapedData()}
                                    disabled={isFetching || !rawScrapedText.trim()}
                                    className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isFetching ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Extracting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>⚡ Parse & Extract Certificates</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLoadSampleData}
                                    className="px-3 py-2 rounded-xl text-xs font-medium text-navy-700 dark:text-soft-cream-200 bg-soft-cream-200/90 dark:bg-navy-800 hover:bg-soft-cream-300 dark:hover:bg-navy-700 border border-soft-cream-300 dark:border-navy-700 cursor-pointer transition-colors"
                                    title="Load sample LinkedIn certifications text to test the extractor"
                                >
                                    ✨ Try Sample Data
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowHelpModal(true)}
                                className="text-xs font-medium text-golden-700 dark:text-golden-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Info className="w-3.5 h-3.5" />
                                <span>See 3-step extraction guide</span>
                            </button>
                        </div>
                    </div>
                )}

                {importMethod === 'csv' && (
                    <div className="animate-fade-in space-y-2.5">
                        <div
                            onClick={() => csvFileInputRef.current?.click()}
                            className="border-2 border-dashed border-golden-400/60 dark:border-golden-600/40 rounded-2xl p-6 text-center cursor-pointer hover:bg-golden-50/50 dark:hover:bg-golden-950/20 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <input
                                type="file"
                                ref={csvFileInputRef}
                                accept=".csv,.txt,.json"
                                onChange={handleCsvUpload}
                                className="hidden"
                            />
                            <div className="p-3 rounded-full bg-golden-100 dark:bg-golden-950/80 text-golden-700 dark:text-golden-400 shadow-sm group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-navy-800 dark:text-soft-cream-100">
                                Click or drag your official LinkedIn <span className="font-mono text-golden-700 dark:text-golden-400 font-bold">Certifications.csv</span> here
                            </p>
                            <p className="text-[11px] text-navy-500 dark:text-soft-cream-400 max-w-sm">
                                Exported directly from LinkedIn Settings &rarr; Data Privacy &rarr; Get a copy of your data.
                            </p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-navy-500 dark:text-soft-cream-400">Supports .csv, .json, and plain text formats.</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setHelpTab('csv');
                                    setShowHelpModal(true);
                                }}
                                className="text-golden-700 dark:text-golden-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>How to download CSV from LinkedIn?</span>
                            </button>
                        </div>
                    </div>
                )}

                {importMethod === 'search' && (
                    <div className="flex flex-col sm:flex-row gap-2.5 animate-fade-in">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFetchCertificates()}
                                placeholder="e.g. Developer Name, username, or https://www.linkedin.com/in/username"
                                className="input py-2.5 pl-9 text-xs sm:text-sm font-mono shadow-xs"
                            />
                            <Search className="w-4 h-4 text-golden-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <button
                            type="button"
                            onClick={handleFetchCertificates}
                            disabled={isFetching}
                            className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                            {isFetching ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Fetching...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Fetch Certificates</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {showDropdown && (
                    <div className="mt-4 pt-4 border-t border-soft-cream-200 dark:border-navy-800 space-y-4 animate-slide-down">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-navy-950/70 p-3 rounded-2xl border border-soft-cream-300 dark:border-navy-800">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat.id)}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                            categoryFilter === cat.id
                                                ? 'bg-navy-800 dark:bg-soft-cream-100 text-white dark:text-navy-950 shadow-xs'
                                                : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleToggleSelectAll}
                                    className="text-xs font-semibold text-navy-700 dark:text-soft-cream-300 hover:text-navy-900 dark:hover:text-white inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-soft-cream-200 dark:bg-navy-800 cursor-pointer transition-colors"
                                >
                                    {isAllSelected ? (
                                        <>
                                            <CheckSquare className="w-3.5 h-3.5 text-golden-500" />
                                            <span>Deselect All</span>
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-3.5 h-3.5 text-navy-400" />
                                            <span>Select All</span>
                                        </>
                                    )}
                                </button>

                                <span className="text-xs font-bold text-golden-600 dark:text-golden-400 px-2">
                                    {selectedCount} Selected
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search by title, issuer (AWS, Google, Meta, Linux Foundation)..."
                                className="input py-2 pl-8 text-xs bg-white/50 dark:bg-navy-900/50"
                            />
                            <Search className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                            {filteredFetchedCerts.map((cert) => {
                                const isChecked = Boolean(selectedCertMap[cert.id]);
                                const isAlreadyIn = existingCertIdentifiers.has((cert.credential_id || '').toLowerCase()) ||
                                    existingCertIdentifiers.has((cert.title || '').toLowerCase());

                                return (
                                    <div
                                        key={cert.id}
                                        onClick={() => handleToggleCert(cert.id)}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                                            isChecked
                                                ? 'bg-golden-50/80 dark:bg-golden-950/30 border-golden-400/70 dark:border-golden-500/50 shadow-sm'
                                                : 'bg-white/60 dark:bg-navy-900/60 border-soft-cream-300 dark:border-navy-800 hover:border-golden-300 dark:hover:border-navy-700'
                                        }`}
                                    >
                                        <div className="shrink-0">
                                            {isChecked ? (
                                                <div className="w-5 h-5 rounded-lg bg-golden-500 text-white flex items-center justify-center shadow-xs">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-lg border-2 border-navy-300 dark:border-navy-600 flex items-center justify-center hover:border-golden-400" />
                                            )}
                                        </div>

                                        <div className="w-16 h-12 rounded-lg bg-navy-950 overflow-hidden border border-soft-cream-300 dark:border-navy-700 shrink-0 flex items-center justify-center">
                                            <img
                                                src={cert.certificate_image || generateCertificateSvg(cert, cert.recipient_name || 'Verified')}
                                                alt={cert.title}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = generateCertificateSvg(cert, cert.recipient_name || 'Verified');
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-navy-900 dark:text-soft-cream-100 truncate">
                                                    {cert.title}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 shrink-0">
                                                    {cert.issuer_code || cert.issuer}
                                                </span>
                                                {cert.recipient_name && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-amber-100/80 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                                                        👤 {cert.recipient_name}
                                                    </span>
                                                )}
                                                {isAlreadyIn && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                                                        Active in Deck
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-[11px] text-navy-500 dark:text-soft-cream-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span>Issued: {cert.issue_date}</span>
                                                <span>&bull;</span>
                                                <span className="font-mono text-[10px]">ID: {cert.credential_id}</span>
                                            </div>
                                        </div>

                                        <a
                                            href={cert.credential_url || cert.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 text-navy-400 hover:text-golden-600 dark:hover:text-golden-400 shrink-0"
                                            title="Open credential verification URL"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-soft-cream-200 dark:border-navy-800">
                            <span className="text-xs text-navy-500 dark:text-soft-cream-400 font-medium">
                                {selectedCount} of {filteredFetchedCerts.length} certificates selected
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(false)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleImportSelected}
                                    disabled={selectedCount === 0}
                                    className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-golden-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Add selected certificates to existing deck"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Add to Deck (+{selectedCount})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReplaceWithSelected}
                                    disabled={selectedCount === 0}
                                    className="btn-secondary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 border border-golden-500/40 text-golden-800 dark:text-golden-300 hover:bg-golden-50 dark:hover:bg-golden-950/40 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Replace all current runway certificates with these selected ones"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Replace Deck ({selectedCount})</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-200">
                            Active Runway Certifications ({certifications.length})
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            These credentials appear in your 3D scroll-driven deck. You can edit any details or add more manually below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddManualCert}
                        className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Manually</span>
                    </button>
                </div>

                {certifications.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-soft-cream-300 dark:border-navy-700 rounded-3xl space-y-3">
                        <Award className="w-8 h-8 text-golden-500 mx-auto opacity-70" />
                        <p className="text-navy-600 dark:text-soft-cream-300 text-sm font-semibold">
                            No certifications currently active in your deck.
                        </p>
                        <p className="text-navy-400 dark:text-soft-cream-400 text-xs max-w-sm mx-auto">
                            Use the auto-fetch tool above to select and import verified credentials with one click, or click Add Manually.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {certifications.map((cert, idx) => (
                            <div
                                key={cert.id || idx}
                                className="p-5 rounded-3xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 relative shadow-sm"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-soft-cream-200/80 dark:border-navy-800/80">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-golden-500/10 text-golden-700 dark:text-golden-400 font-bold text-xs flex items-center justify-center">
                                            #{idx + 1}
                                        </span>
                                        <span className="text-sm font-bold text-navy-900 dark:text-soft-cream-100 truncate max-w-xs sm:max-w-md">
                                            {cert.title || 'Untitled Certificate'}
                                        </span>
                                        {cert.verified !== false && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                <ShieldCheck className="w-3 h-3" />
                                                <span>Verified</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveCert(idx, -1)}
                                            disabled={idx === 0}
                                            className="p-1.5 rounded-lg text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveCert(idx, 1)}
                                            disabled={idx === certifications.length - 1}
                                            className="p-1.5 rounded-lg text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCert(idx)}
                                            className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                                            title="Delete Certificate"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Certification Title
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.title || ''}
                                            onChange={(e) => handleUpdateCert(idx, 'title', e.target.value)}
                                            className="input py-2 text-xs font-medium"
                                            placeholder="e.g. AI/ML for Geodata Analytics"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Issuing Organization
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.issuer || ''}
                                            onChange={(e) => handleUpdateCert(idx, 'issuer', e.target.value)}
                                            className="input py-2 text-xs font-medium"
                                            placeholder="e.g. Amazon Web Services (AWS)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Domain Category
                                        </label>
                                        <select
                                            value={cert.category || 'Cybersecurity'}
                                            onChange={(e) => handleUpdateCert(idx, 'category', e.target.value)}
                                            className="input py-2 text-xs font-medium"
                                        >
                                            <option value="Cybersecurity">Cybersecurity & OSINT</option>
                                            <option value="AI & Data Science">AI & Data Science</option>
                                            <option value="Open Science">NASA Open Science</option>
                                            <option value="Leadership & Events">Leadership & Events</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Issuer Code / Pill Tag
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.issuer_code || cert.issuer || ''}
                                            onChange={(e) => handleUpdateCert(idx, 'issuer_code', e.target.value)}
                                            className="input py-2 text-xs font-medium"
                                            placeholder="e.g. AWS, Google Cloud, Meta"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Issue Date
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.issue_date || cert.issueDate || ''}
                                            onChange={(e) => {
                                                handleUpdateCert(idx, 'issue_date', e.target.value);
                                                handleUpdateCert(idx, 'issueDate', e.target.value);
                                            }}
                                            className="input py-2 text-xs font-medium"
                                            placeholder="e.g. September 2026"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Credential ID
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.credential_id || cert.credentialId || ''}
                                            onChange={(e) => {
                                                handleUpdateCert(idx, 'credential_id', e.target.value);
                                                handleUpdateCert(idx, 'credentialId', e.target.value);
                                            }}
                                            className="input py-2 text-xs font-mono"
                                            placeholder="e.g. 2026235001196"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Verification Link
                                        </label>
                                        <input
                                            type="text"
                                            value={cert.credential_url || cert.credentialUrl || ''}
                                            onChange={(e) => {
                                                handleUpdateCert(idx, 'credential_url', e.target.value);
                                                handleUpdateCert(idx, 'credentialUrl', e.target.value);
                                            }}
                                            className="input py-2 text-xs font-mono"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Certificate Image (URL or File Upload)
                                    </label>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-16 h-12 rounded-lg bg-navy-950 border border-soft-cream-300 dark:border-navy-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                            <img
                                                src={cert.certificate_image || cert.image_url || generateCertificateSvg(cert, cert.recipient_name || portfolio.name || 'Candidate')}
                                                alt="Certificate Preview"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = generateCertificateSvg(cert, cert.recipient_name || portfolio.name || 'Candidate');
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={cert.certificate_image || cert.image_url || ''}
                                            onChange={(e) => handleUpdateCert(idx, 'certificate_image', e.target.value)}
                                            className="input py-2 text-xs flex-1 font-mono"
                                            placeholder="/certificates/my-cert.png or https://..."
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={(el) => (fileInputRefs.current[idx] = el)}
                                            onChange={(e) => handleImageUpload(idx, e.target.files?.[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            disabled={uploadingId === idx}
                                            className="btn-secondary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                                        >
                                            <Upload className="w-3.5 h-3.5 text-golden-500" />
                                            <span>{uploadingId === idx ? 'Uploading...' : 'Upload Image'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Description & Recognition
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={cert.description || ''}
                                        onChange={(e) => handleUpdateCert(idx, 'description', e.target.value)}
                                        className="input py-1.5 text-xs"
                                        placeholder="Detailed description of what you demonstrated or learned..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Key Skills (comma-separated tags)
                                    </label>
                                    <input
                                        type="text"
                                        value={Array.isArray(cert.skills) ? cert.skills.join(', ') : (cert.skills || '')}
                                        onChange={(e) => {
                                            const tags = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                            handleUpdateCert(idx, 'skills', tags);
                                        }}
                                        className="input py-1.5 text-xs"
                                        placeholder="Cloud, Python, Distributed Systems, DevOps"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showHelpModal && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-navy-950/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setShowHelpModal(false)}
                >
                    <div
                        className="relative max-w-2xl w-full bg-white dark:bg-navy-900 rounded-3xl border border-soft-cream-300 dark:border-navy-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-5 border-b border-soft-cream-200 dark:border-navy-800 bg-soft-cream-100 dark:bg-navy-950 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-golden-500/10 dark:bg-golden-500/20 text-golden-600 dark:text-golden-400">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-navy-900 dark:text-soft-cream-100">
                                        How to Extract & Import Your LinkedIn Certifications
                                    </h3>
                                    <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                                        3 simple methods to extract your genuine certificates without credentials
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="p-1.5 rounded-xl hover:bg-soft-cream-200 dark:hover:bg-navy-800 text-navy-500 dark:text-soft-cream-400 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-1 p-2 bg-soft-cream-50 dark:bg-navy-900/60 border-b border-soft-cream-200 dark:border-navy-800 overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setHelpTab('copy-paste')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    helpTab === 'copy-paste'
                                        ? 'bg-golden-500 text-white shadow-xs'
                                        : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                }`}
                            >
                                📋 Method 1: Copy & Paste (Fastest)
                            </button>
                            <button
                                onClick={() => setHelpTab('csv')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    helpTab === 'csv'
                                        ? 'bg-golden-500 text-white shadow-xs'
                                        : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                }`}
                            >
                                📁 Method 2: Official LinkedIn CSV
                            </button>
                            <button
                                onClick={() => setHelpTab('inspect')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    helpTab === 'inspect'
                                        ? 'bg-golden-500 text-white shadow-xs'
                                        : 'text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                }`}
                            >
                                🌐 Method 3: DevTools Inspect (HTML)
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-xs text-navy-700 dark:text-soft-cream-200 leading-relaxed">
                            {helpTab === 'copy-paste' && (
                                <div className="space-y-3.5">
                                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 flex items-center gap-2 font-medium text-amber-900 dark:text-amber-200">
                                        <span>⚡</span>
                                        <span>Takes 5 seconds. No developer tools or downloads required.</span>
                                    </div>
                                    <ol className="space-y-3 list-none">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Open your LinkedIn Certifications:</strong>
                                                Go to <code className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">linkedin.com/in/YOUR_USERNAME/details/certifications/</code> in your browser.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Select and Copy the Text:</strong>
                                                Press <kbd className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">Ctrl + A</kbd> (or drag to highlight your certificates list) and press <kbd className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">Ctrl + C</kbd>.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Paste and Extract:</strong>
                                                Paste into the "Paste Copied Text or HTML" box and click <span className="font-semibold text-golden-600 dark:text-golden-400">"⚡ Parse & Extract Certificates"</span>.
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            )}

                            {helpTab === 'csv' && (
                                <div className="space-y-3.5">
                                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300/60 dark:border-blue-800/60 flex items-center gap-2 font-medium text-blue-900 dark:text-blue-200">
                                        <span>📁</span>
                                        <span>100% official data export directly generated by LinkedIn.</span>
                                    </div>
                                    <ol className="space-y-3 list-none">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Go to LinkedIn Settings:</strong>
                                                Click your profile picture in the top nav bar &rarr; select <strong>Settings & Privacy</strong>.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Request Data Archive:</strong>
                                                In the left sidebar, click <strong>Data privacy</strong> &rarr; <strong>Get a copy of your data</strong> &rarr; select <strong>"Want something in particular?"</strong> and check <strong>Certifications</strong>.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Drop the File:</strong>
                                                Download the zip from your email, extract <code className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">Certifications.csv</code>, and drop it onto the Upload box!
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            )}

                            {helpTab === 'inspect' && (
                                <div className="space-y-3.5">
                                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300/60 dark:border-purple-800/60 flex items-center gap-2 font-medium text-purple-900 dark:text-purple-200">
                                        <span>🔍</span>
                                        <span>Best for capturing official company logos, badges, and credential URLs.</span>
                                    </div>
                                    <ol className="space-y-3 list-none">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Inspect the Section:</strong>
                                                On your LinkedIn certifications page, right-click any certificate card and click <strong>Inspect</strong>.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Copy the Container:</strong>
                                                Find the parent <code className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">&lt;ul&gt;</code> or <code className="px-1.5 py-0.5 rounded bg-soft-cream-200 dark:bg-navy-800 font-mono text-[11px]">&lt;main&gt;</code> element, right-click it &rarr; <strong>Copy</strong> &rarr; <strong>Copy element</strong> (or Copy outerHTML).
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-golden-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                                            <div>
                                                <strong className="block text-navy-900 dark:text-white font-semibold">Paste and Extract:</strong>
                                                Paste into the box here. Our HTML parser will extract all certificates and company badges automatically!
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-soft-cream-100 dark:bg-navy-950 border-t border-soft-cream-200 dark:border-navy-800 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleLoadSampleData}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-golden-500 hover:bg-golden-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Try Sample Data Now</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-soft-cream-200 dark:bg-navy-800 hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-navy-800 dark:text-soft-cream-200 transition-colors cursor-pointer"
                            >
                                Got it, Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CertificationsTab;
