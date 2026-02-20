import { useState, useRef } from 'react';
import { ChevronRight, Pencil, Trash2, Download, Upload, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import EditKidSheet from '@/components/settings/EditKidSheet';
import ManageTasksSheet from '@/components/settings/ManageTasksSheet';
import ManageRewardsSheet from '@/components/settings/ManageRewardsSheet';
import ResetConfirmSheet from '@/components/settings/ResetConfirmSheet';
import { useKids } from '@/hooks/useKids';
import {
  updateKid,
  deleteKid as deleteKidDb,
  createKid,
  exportAllData,
  importAllData,
  resetAllData,
} from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { KID_COLORS } from '@/lib/constants';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sounds';
import type { Kid } from '@/lib/types';

const HOUSEHOLD_ID = 'household-1';

export default function SettingsPage() {
  const { kids, refreshKids, refreshBalance } = useKids();
  const [editKid, setEditKid] = useState<Kid | null>(null);
  const [showEditKid, setShowEditKid] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleSaveKid = async (id: string, changes: Partial<Kid>) => {
    await updateKid(id, changes);
    await refreshKids();
  };

  const handleDeleteKid = async (kid: Kid) => {
    if (kids.length <= 1) return; // don't delete last kid
    if (!confirm(`Delete ${kid.name}? This cannot be undone.`)) return;
    await deleteKidDb(kid.id);
    await refreshKids();
  };

  const handleAddKid = async () => {
    const order = kids.length;
    const color = KID_COLORS[order % KID_COLORS.length];
    await createKid({
      id: `kid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      householdId: HOUSEHOLD_ID,
      name: `Kid ${order + 1}`,
      avatar: '\u{1F9D1}',
      color,
      order,
    });
    await refreshKids();
  };

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reward-jar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('This will replace all current data. Continue?')) {
      e.target.value = '';
      return;
    }
    const text = await file.text();
    await importAllData(text);
    await refreshKids();
    await refreshBalance();
    e.target.value = '';
  };

  const handleReset = async () => {
    await resetAllData();
    await seedDatabase();
    await refreshKids();
    await refreshBalance();
  };

  return (
    <div className="flex min-h-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
      </div>

      {/* KIDS section */}
      <section className="px-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Kids</h2>
        <div className="overflow-hidden rounded-2xl bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
          {kids.map((kid, i) => (
            <div
              key={kid.id}
              className={`flex items-center gap-3 px-5 py-3 ${
                i < kids.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: kid.color + '20' }}
              >
                {kid.avatar}
              </div>
              <span className="flex-1 text-sm font-semibold text-text">{kid.name}</span>
              <button
                onClick={() => { setEditKid(kid); setShowEditKid(true); }}
                className="p-1.5 text-text-muted transition-colors active:text-primary"
              >
                <Pencil size={16} />
              </button>
              {kids.length > 1 && (
                <button
                  onClick={() => handleDeleteKid(kid)}
                  className="p-1.5 text-text-light transition-colors active:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddKid}
            className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-bold text-primary"
          >
            + Add Kid
          </button>
        </div>
      </section>

      {/* MANAGE section */}
      <section className="px-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Manage</h2>
        <div className="overflow-hidden rounded-2xl bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
          <button
            onClick={() => setShowTasks(true)}
            className="flex w-full items-center justify-between border-b border-border px-5 py-3 text-left"
          >
            <span className="text-sm font-semibold text-text">Tasks</span>
            <ChevronRight size={18} className="text-text-light" />
          </button>
          <button
            onClick={() => setShowRewards(true)}
            className="flex w-full items-center justify-between px-5 py-3 text-left"
          >
            <span className="text-sm font-semibold text-text">Rewards</span>
            <ChevronRight size={18} className="text-text-light" />
          </button>
        </div>
      </section>

      {/* PREFERENCES section */}
      <section className="px-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Preferences</h2>
        <div className="overflow-hidden rounded-2xl bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
          <button
            onClick={toggleSound}
            className="flex w-full items-center gap-3 px-5 py-3 text-left"
          >
            {soundOn ? (
              <Volume2 size={18} className="text-primary" />
            ) : (
              <VolumeX size={18} className="text-text-muted" />
            )}
            <span className="flex-1 text-sm font-semibold text-text">Sound Effects</span>
            <div
              className="flex h-7 w-12 items-center rounded-full px-0.5 transition-colors duration-200"
              style={{ backgroundColor: soundOn ? '#7C5CFC' : '#E8E6E1' }}
            >
              <div
                className="h-6 w-6 rounded-full bg-white transition-transform duration-200"
                style={{ transform: soundOn ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </div>
          </button>
        </div>
      </section>

      {/* DATA section */}
      <section className="px-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Data</h2>
        <div className="overflow-hidden rounded-2xl bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left"
          >
            <Download size={18} className="text-text-muted" />
            <span className="text-sm font-semibold text-text">Export Data</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left"
          >
            <Upload size={18} className="text-text-muted" />
            <span className="text-sm font-semibold text-text">Import Data</span>
          </button>
          <button
            onClick={() => setShowReset(true)}
            className="flex w-full items-center gap-3 px-5 py-3 text-left"
          >
            <RotateCcw size={18} className="text-danger" />
            <span className="text-sm font-semibold text-danger">Reset All Data</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </section>

      {/* ABOUT section */}
      <section className="px-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">About</h2>
        <div className="overflow-hidden rounded-2xl bg-surface px-4 py-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm font-bold text-text">Reward Jar</p>
          <p className="text-xs text-text-muted">Version 1.0.0</p>
          <p className="mt-2 text-xs text-text-light">
            Made with {'\u2764\u{FE0F}'} for families
          </p>
        </div>
      </section>

      {/* Sheets */}
      <EditKidSheet
        open={showEditKid}
        onClose={() => { setShowEditKid(false); setEditKid(null); }}
        kid={editKid}
        onSave={handleSaveKid}
      />
      <ManageTasksSheet open={showTasks} onClose={() => setShowTasks(false)} />
      <ManageRewardsSheet open={showRewards} onClose={() => setShowRewards(false)} />
      <ResetConfirmSheet
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
