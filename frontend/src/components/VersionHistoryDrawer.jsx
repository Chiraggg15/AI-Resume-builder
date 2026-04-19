/**
 * VersionHistoryDrawer.jsx
 * Shows a slide-in drawer listing all snapshots for a resume.
 * Users can restore any historical version.
 */

import { useState, useEffect } from 'react';
import { History, RotateCcw, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../services/api';

export default function VersionHistoryDrawer({ resumeId, isOpen, onClose, onRestore }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (!isOpen || !resumeId) return;
    setLoading(true);
    resumeAPI.getHistory(resumeId)
      .then(res => setSnapshots(res.data.snapshots || []))
      .catch(() => toast.error('Could not load history'))
      .finally(() => setLoading(false));
  }, [isOpen, resumeId]);

  const handleRestore = async (snapshotId, index) => {
    if (!window.confirm(`Restore version from ${formatDate(snapshots[index]?.saved_at)}? Current changes will be replaced.`)) return;
    setRestoring(snapshotId);
    try {
      const res = await resumeAPI.restore(resumeId, snapshotId);
      onRestore(res.data.resume);
      toast.success('Version restored successfully!');
      onClose();
    } catch {
      toast.error('Failed to restore version');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <History size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-white font-bold text-base">Version History</h3>
              <p className="text-zinc-500 text-xs">Restore any previous save</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Loading history...</p>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Clock size={24} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium text-sm">No history yet</p>
              <p className="text-zinc-600 text-xs max-w-xs">Snapshots are saved automatically each time you save the resume.</p>
            </div>
          ) : (
            snapshots.map((snap, i) => (
              <div
                key={snap.id}
                className="group flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {i === 0 ? 'Latest save' : `Version ${snapshots.length - i}`}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">{formatDate(snap.saved_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(snap.id, i)}
                  disabled={restoring === snap.id}
                  className="ml-3 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-700 hover:bg-zinc-600 hover:text-white border border-zinc-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  {restoring === snap.id ? (
                    <div className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Restore
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs text-center">Up to 10 versions are stored per resume</p>
        </div>
      </div>
    </>
  );
}
