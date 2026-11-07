import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, Save, UserCog } from 'lucide-react';
import { useStore } from '../lib/store';
import { fmtDate } from '../lib/time';
import { Button, Card, CardHeader, Field, Input, Modal, PageHeader, useToast } from '../components/ui';
import { TermsLink } from '../components/Terms';

export default function Settings() {
  const { user, updateAccount, resetDemo, signOut } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(user?.displayName ?? '');
  const [confirmReset, setConfirmReset] = useState(false);
  if (!user) return null;

  return (
    <div>
      <PageHeader eyebrow="Account Settings" title="Account Settings" />
      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader title="Account" icon={<UserCog className="h-4 w-4" />} />
          <div className="space-y-4 p-6">
            <Field label="Display Name" htmlFor="dn"><Input id="dn" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email" htmlFor="em"><Input id="em" value={user.email} disabled /></Field>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div><p className="label-mono">Account Type</p><p className="mt-1">{user.role === 'family' ? 'Family Member / Guardian' : 'Student Volunteer'}</p></div>
              <div><p className="label-mono">Member Since</p><p className="mt-1">{fmtDate(user.createdAt)}</p></div>
            </div>
            <p className="text-[13px] text-ink-soft"><TermsLink /></p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button icon={<Save className="h-4 w-4" />} disabled={!name.trim() || name === user.displayName} onClick={() => { updateAccount({ displayName: name.trim() }); toast('Account updated.'); }}>Save</Button>
              <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={() => { signOut(); navigate('/'); }}>Sign Out</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold">Start Over</p>
              <p className="text-[13px] text-muted">Clears every account, request, and visit and restores the starting data.</p>
            </div>
            <Button variant="danger" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>Reset App Data</Button>
          </div>
        </Card>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset App Data?"
        footer={<><Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="danger" icon={<RotateCcw className="h-4 w-4" />} onClick={() => { resetDemo(); setConfirmReset(false); navigate('/'); toast('Everything is back to the starting point.', 'info'); }}>Reset Everything</Button></>}>
        <p className="text-[14px] text-ink-soft">This removes all new accounts, requests, commitments, and visits, and restores Alex, Sarah, and the original residents. You'll be signed out.</p>
      </Modal>
    </div>
  );
}
