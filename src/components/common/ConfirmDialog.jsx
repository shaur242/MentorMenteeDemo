import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-rose-100' : 'bg-amber-100'}`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-rose-600' : 'text-amber-600'}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-navy-900">{title || 'Are you sure?'}</h3>
          {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            className="flex-1"
            onClick={() => { onConfirm?.(); onClose?.(); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
