import React, { useEffect, useState } from 'react';
import { Award, Plus, CheckCircle2, Clock, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';

const CredentialSubmissionPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    credentialType: 'MEDICAL_BOARD_LICENSE',
    credentialNumber: '',
    issuingAuthority: 'Kenya Medical Practitioners and Dentists Council (KMPDC)',
    issueDate: '',
    expiryDate: '',
    documentUrl: 'https://storage.mediconnect.ke/docs/license-sample.pdf',
  });

  const loadData = () => {
    providersApi.getMyProfile().then(res => {
      if (res.success && res.data) setProfile(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await providersApi.submitCredentials(form as any);
      setMessage('Credential submitted for review! An administrator will verify it shortly.');
      setForm({
        credentialType: 'MEDICAL_BOARD_LICENSE',
        credentialNumber: '',
        issuingAuthority: 'Kenya Medical Practitioners and Dentists Council (KMPDC)',
        issueDate: '',
        expiryDate: '',
        documentUrl: 'https://storage.mediconnect.ke/docs/license-sample.pdf',
      });
      loadData();
    } catch {
      setMessage('Error submitting credential.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const credentials = profile?.credentials || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Professional Credentials</h1>
        <p className="text-sm text-gray-500">
          Upload and verify your professional medical licenses, degrees, and board registrations.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Submission Form */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Submit New Credential
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Credential Type"
              value={form.credentialType}
              onChange={e => setForm({ ...form, credentialType: e.target.value })}
              options={[
                { value: 'MEDICAL_BOARD_LICENSE', label: 'Medical Board License (KMPDC)' },
                { value: 'NURSING_COUNCIL_LICENSE', label: 'Nursing Council License (NCK)' },
                { value: 'PHARMACY_BOARD_LICENSE', label: 'Pharmacy Board License (PPB)' },
                { value: 'DEGREE_CERTIFICATE', label: 'Medical Degree / Diploma' },
                { value: 'SPECIALIST_RECOGNITION', label: 'Specialist Recognition' },
              ]}
              required
            />
            <Input
              label="Credential / License Number"
              placeholder="e.g. A12345/2026"
              value={form.credentialNumber}
              onChange={e => setForm({ ...form, credentialNumber: e.target.value })}
              required
            />
          </div>

          <Input
            label="Issuing Authority"
            value={form.issuingAuthority}
            onChange={e => setForm({ ...form, issuingAuthority: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Issue"
              type="date"
              value={form.issueDate}
              onChange={e => setForm({ ...form, issueDate: e.target.value })}
              required
            />
            <Input
              label="Expiry Date (If applicable)"
              type="date"
              value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <Input
            label="Document URL / Scan Reference"
            value={form.documentUrl}
            onChange={e => setForm({ ...form, documentUrl: e.target.value })}
            required
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={submitting} className="font-bold">
              Submit Document for Verification
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Credentials List */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Submitted Documents
        </h3>

        {credentials.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No credentials submitted yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {credentials.map((c: any) => (
              <div key={c.id} className="py-4 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-bold text-gray-900 text-sm">{c.credential_type}</span>
                    <span className="text-gray-500 font-mono">#{c.credential_number}</span>
                  </div>
                  <p className="text-gray-500">{c.issuing_authority}</p>
                </div>

                <div>
                  {c.verified_at ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> Under Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CredentialSubmissionPage;
