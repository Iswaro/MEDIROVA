import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, AlertCircle, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';

const VerificationStatusPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providersApi.getMyProfile().then(res => {
      if (res.success && res.data) setProfile(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner size="lg" />;

  const status = profile?.verification_status || 'PENDING';

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Account Verification Status</h1>
        <p className="text-sm text-gray-500">Official accreditation and compliance review by MEDICONNECT Medical Board.</p>
      </div>

      <Card className="p-8 text-center space-y-6">
        {status === 'VERIFIED' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Account Verified & Active</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Your medical practice license and credentials have been approved. You are eligible to receive patient dispatches across your designated coverage radius.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-left max-w-sm mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Professional Type:</span>
                <span className="font-bold text-gray-800">{profile?.provider_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-bold text-emerald-600">VERIFIED</span>
              </div>
            </div>
          </>
        ) : status === 'REJECTED' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verification Declined</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {profile?.verification_notes || 'Your credentials could not be verified with the official board registry.'}
              </p>
            </div>
            <Link to="/provider/credentials">
              <Button>Re-submit Credentials</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verification Under Review</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Our medical compliance team is checking your license with the regulatory board. Reviews typically take 12 to 24 hours.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/provider/credentials">
                <Button variant="outline">View Submitted Documents</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerificationStatusPage;
