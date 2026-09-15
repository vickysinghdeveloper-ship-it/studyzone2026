import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Copy,
  Check,
  Code,
  Save,
  Terminal,
  FileCode,
  Download,
  Archive,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { LibrarySettings } from '../../types';
import {
  HOSTINGER_MYSQL_SCHEMA,
  HOSTINGER_CONFIG_PHP,
  HOSTINGER_INDEX_PHP,
  HOSTINGER_HTACCESS,
  HOSTINGER_DEPLOYMENT_GUIDE_MD
} from '../../utils/hostingerFiles';

interface SettingsAndHostingerExportProps {
  settings: LibrarySettings;
  onSaveSettings: (settings: LibrarySettings) => void;
}

export const SettingsAndHostingerExport: React.FC<SettingsAndHostingerExportProps> = ({
  settings,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'hostinger'>('hostinger');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const [formData, setFormData] = useState<LibrarySettings>({ ...settings });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFullZip = async () => {
    setIsZipping(true);
    setZipSuccess(false);
    try {
      const zip = new JSZip();

      // Root files
      zip.file('studyzone_database.sql', HOSTINGER_MYSQL_SCHEMA);
      zip.file('.htaccess', HOSTINGER_HTACCESS);
      zip.file('HOSTINGER_BUSINESS_SETUP_GUIDE.md', HOSTINGER_DEPLOYMENT_GUIDE_MD);
      zip.file(
        'README_UPLOAD_TO_HOSTINGER.txt',
        `=============================================================
STUDYZONE - HOSTINGER BUSINESS WEB HOSTING QUICK START
=============================================================
Owner Email: vickysingh.developer@gmail.com
Initial Password: @Study@2011
UPI ID for Payments: 6209332827zbl@ybl
WhatsApp Support: 6209332827

1. Create a MySQL Database in Hostinger hPanel -> Databases.
2. In phpMyAdmin, import 'studyzone_database.sql'.
3. In File Manager, upload your files into 'public_html'.
4. Edit 'api/config.php' with your Hostinger MySQL DB Name, Username & Password.
5. Open your domain in any browser - your library system is fully LIVE!
=============================================================`
      );

      // api folder
      const apiFolder = zip.folder('api');
      if (apiFolder) {
        apiFolder.file('config.php', HOSTINGER_CONFIG_PHP);
        apiFolder.file('index.php', HOSTINGER_INDEX_PHP);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'studyzone_hostinger_business_deployment.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP package:', err);
      alert('Failed to generate ZIP package. You can download the individual files below.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    alert('Library settings updated successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
            <Server className="w-6 h-6 text-indigo-600 mr-2" />
            Hostinger Business Web Hosting Deployment Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured for Hostinger Business Web Hosting with PHP 8.1+, MySQL database, and Apache/LiteSpeed server.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('hostinger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'hostinger'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hostinger Deployer</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            General Settings
          </button>
        </div>
      </div>

      {/* Tab 1: Hostinger Business Deployment Center */}
      {activeTab === 'hostinger' && (
        <div className="space-y-6">
          
          {/* Main Hero Callout for Hostinger Business Hosting */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/40 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>Hostinger Business Web Hosting Compatible</span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero External Cloud Subscriptions Required</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Direct Upload to Hostinger hPanel File Manager
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mt-2">
                This platform is tailored specifically for Hostinger Business Web Hosting. It includes a complete MySQL database schema, PHP 8.1+ REST API engine, responsive UI bundle, and LiteSpeed <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">.htaccess</code> routing file. Everything uploads directly into <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">public_html</code>.
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Owner Master ID</span>
                <span className="font-mono font-bold text-indigo-300 truncate block mt-0.5">
                  vickysingh.developer@gmail.com
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">First-Time Password</span>
                <span className="font-mono font-bold text-amber-300 block mt-0.5">
                  @Study@2011 (Resettable via OTP)
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Staff & Admins</span>
                <span className="font-bold text-emerald-300 block mt-0.5">
                  Checkbox Permission Control
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Fee Payments & UPI</span>
                <span className="font-mono font-bold text-blue-300 block mt-0.5">
                  6209332827zbl@ybl
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDownloadFullZip}
                disabled={isZipping}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                {isZipping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Packaging Hostinger ZIP...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Download Ready-to-Upload Hostinger ZIP Package</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadFile('studyzone_database.sql', HOSTINGER_MYSQL_SCHEMA)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-purple-400" />
                <span>Download MySQL Schema (.SQL)</span>
              </button>

              <button
                onClick={() => handleDownloadFile('config.php', HOSTINGER_CONFIG_PHP)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Download api/config.php</span>
              </button>

              <button
                onClick={() => handleDownloadFile('index.php', HOSTINGER_INDEX_PHP)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Code className="w-4 h-4 text-blue-400" />
                <span>Download api/index.php</span>
              </button>
            </div>

            {zipSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Hostinger deployment ZIP downloaded successfully! Upload this directly to Hostinger File Manager in public_html.</span>
              </div>
            )}
          </div>

          {/* 5-Step Hostinger Business Hosting Visual Roadmap */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
                Step-by-Step Hostinger Business Web Hosting Setup
              </h3>
              <a
                href="https://hpanel.hostinger.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Open Hostinger hPanel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Create MySQL DB</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  In hPanel go to <strong>Databases → MySQL Databases</strong>. Create a database (e.g. <code className="text-indigo-600 dark:text-indigo-400">u123456789_studyzone</code>) and password.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Import SQL Schema</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Click <strong>Enter phpMyAdmin</strong> next to your database → click <strong>Import</strong> → upload <code className="text-purple-600 dark:text-purple-400">studyzone_database.sql</code>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Upload to File Manager</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  In hPanel open <strong>Files → File Manager</strong> → open <code className="text-indigo-600 dark:text-indigo-400">public_html</code>. Upload the ZIP and right-click <strong>Extract</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Edit api/config.php</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inside <code className="text-emerald-600 dark:text-emerald-400">public_html/api/config.php</code>, update DB User, DB Password, and DB Name to match Step 1.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  5
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Launch & Verify</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Visit your domain! Sign in as Owner using <code className="text-blue-600 dark:text-blue-400">vickysingh.developer@gmail.com</code> with password <code className="text-blue-600 dark:text-blue-400">@Study@2011</code>.
                </p>
              </div>

            </div>
          </div>

          {/* MySQL Database Schema Preview & Copy */}
          <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-400 flex items-center">
                <Terminal className="w-4 h-4 mr-1.5" /> studyzone_database.sql (Hostinger MariaDB / MySQL 8.0)
              </span>
              <button
                onClick={() => handleCopy(HOSTINGER_MYSQL_SCHEMA, 'sql')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center transition-all cursor-pointer"
              >
                {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copiedKey === 'sql' ? 'Copied SQL!' : 'Copy SQL Script'}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 border border-slate-800/80">
              {HOSTINGER_MYSQL_SCHEMA}
            </pre>
          </div>

          {/* Complete Hostinger Setup Guide Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                HOSTINGER_BUSINESS_SETUP_GUIDE.md
              </h4>
              <button
                onClick={() => handleCopy(HOSTINGER_DEPLOYMENT_GUIDE_MD, 'guide')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center transition-all cursor-pointer"
              >
                {copiedKey === 'guide' ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copiedKey === 'guide' ? 'Copied Guide!' : 'Copy Guide Text'}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-64 border border-slate-200 dark:border-slate-800">
              {HOSTINGER_DEPLOYMENT_GUIDE_MD}
            </pre>
          </div>

        </div>
      )}

      {/* Tab 2: General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettingsSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Library Profile & Contact Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Library Name *</label>
              <input
                type="text"
                required
                value={formData.libraryName}
                onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Owner Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g. 6209332827"
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">UPI ID for Fee Payment QR *</label>
              <input
                type="text"
                required
                value={formData.upiId || '6209332827zbl@ybl'}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. 6209332827zbl@ybl"
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 font-mono font-black text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Library Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Google Map Embed URL</label>
            <input
              type="text"
              placeholder="e.g. https://maps.google.com/maps?q=YourAddress&output=embed"
              value={formData.mapEmbedUrl || ''}
              onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl border text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
