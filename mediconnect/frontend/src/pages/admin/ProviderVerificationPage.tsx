import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { adminApi } from '../../api/admin';

const ProviderVerificationPage: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'VERIFY' | 'REJECT' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = () => {
    setLoading(true);
    adminApi
      .getPendingProviders()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setProviders(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async () => {
    if (!selectedProvider || !actionModal) return;
    setSubmitting(true);
    const action: 'APPROVE' | 'REJECT' = actionModal === 'VERIFY' ? 'APPROVE' : 'REJECT';

    try {
      await adminApi.verifyProvider(selectedProvider.profile_id, action, notes);
      setActionModal(null);
      setSelectedProvider(null);
      setNotes('');
      fetchPending();
    } catch {
      alert('Error updating provider verification status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Provider Credential Verification</h1>
        <p className="text-sm text-gray-500">
          Review medical licenses, issuing authorities, and approve doctors/nurses for service dispatch.
        </p>
      </div>

      {providers.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All providers up to date"
          description="There are currently no provider accounts waiting for verification."
        />
      ) : (
        <div className="space-y-6">
          {providers.map(p => (
            <Card key={p.profile_id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {p.first_name} {p.last_name}
                    </h3>
                    <Badge variant="primary">{p.provider_type}</Badge>
                    <Badge variant="warning">{p.verification_status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.email} · {p.phone || 'No phone'} · Registered {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedProvider(p);
                      setActionModal('REJECT');
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                    onClick={() => {
                      setSelectedProvider(p);
                      setActionModal('VERIFY');
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve License
                  </Button>
                </div>
              </div>

              {/* Bio */}
              {p.bio && <p className="text-xs text-gray-600 italic">"{p.bio}"</p>}

              {/* Submitted Credentials */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Submitted Credentials ({p.credentials?.length || 0})
                </span>

                {(!p.credentials || p.credentials.length === 0) ? (
                  <p className="text-xs text-gray-400">No documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {p.credentials.map((c: any) => (
                      <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-gray-900">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            {c.credential_type}
                          </span>
                          <span className="font-mono text-[11px] text-gray-600">#{c.credential_number}</span>
                        </div>
                        <p className="text-gray-500 text-[11px]">{c.issuing_authority}</p>
                        {c.document_url && (
                          <a
                            href={c.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold pt-1"
                          >
                            View Document Scan <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal === 'VERIFY' ? 'Approve Provider Verification' : 'Reject Verification'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600">
            {actionModal === 'VERIFY'
              ? `You are confirming that ${selectedProvider?.first_name} ${selectedProvider?.last_name}'s credentials have been verified with official medical boards. This will activate their account for dispatch.`
              : `Specify reason for rejecting ${selectedProvider?.first_name} ${selectedProvider?.last_name}'s verification request.`}
          </p>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {actionModal === 'VERIFY' ? 'Verification Notes (Optional)' : 'Rejection Reason / Notes'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. KMPDC license verified active on official registry."
              className="w-full px-3 py-2 border rounded-xl"
              required={actionModal === 'REJECT'}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDecision}
              isLoading={submitting}
              className={actionModal === 'VERIFY' ? 'bg-emerald-600 hover:bg-emerald-700 font-bold' : 'bg-red-600 hover:bg-red-700 font-bold'}
            >
              {actionModal === 'VERIFY' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderVerificationPage;
