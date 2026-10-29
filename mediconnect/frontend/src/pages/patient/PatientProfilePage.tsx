import React, { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Home,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { patientsApi } from '../../api/patients';

const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    addressLine: '',
    latitude: -1.2921,
    longitude: 36.8219,
    isDefault: true,
  });

  const loadData = () => {
    Promise.all([
      patientsApi.getProfile().catch(() => ({ data: null })),
      patientsApi.getAddresses().catch(() => ({ data: [] })),
    ])
      .then(([pRes, aRes]: any) => {
        if (pRes?.data) setProfile(pRes.data);
        if (aRes?.data) setAddresses(Array.isArray(aRes.data) ? aRes.data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await patientsApi.updateProfile({
        emergencyContact: {
          name: profile.emergency_contact_name || '',
          phone: profile.emergency_contact_phone || '',
          relationship: profile.emergency_contact_relationship || 'Other',
        },
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
      } as any);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientsApi.addAddress({
        label: newAddress.label,
        street: newAddress.addressLine,
        city: 'Nairobi',
        county: 'Nairobi',
        country: 'Kenya',
        latitude: newAddress.latitude,
        longitude: newAddress.longitude,
        isDefault: newAddress.isDefault,
      });
      setIsAddressModalOpen(false);
      loadData();
    } catch (err: unknown) {
      alert('Error saving address');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Patient Profile & Settings</h1>
        <p className="text-sm text-gray-500">Manage your personal healthcare details and service delivery addresses.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Personal Info Form */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Personal Information
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile?.first_name || ''}
              onChange={e => setProfile({ ...profile, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={profile?.last_name || ''}
              onChange={e => setProfile({ ...profile, last_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <Input
              label="Mobile Number (M-Pesa)"
              value={profile?.phone || ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Emergency Contact (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                placeholder="e.g. Next of Kin / Spouse"
                value={profile?.emergency_contact_name || ''}
                onChange={e => setProfile({ ...profile, emergency_contact_name: e.target.value })}
              />
              <Input
                label="Emergency Contact Phone"
                placeholder="+254 700 000 000"
                value={profile?.emergency_contact_phone || ''}
                onChange={e => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={saving} className="font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Saved Addresses */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Saved Delivery Addresses
          </h2>
          <Button size="sm" variant="outline" onClick={() => setIsAddressModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No saved addresses yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-primary" /> {addr.label}
                  </span>
                  {addr.is_default ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{addr.address_line}</p>
                <p className="text-[10px] text-gray-400">
                  {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Add Service Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <Input
            label="Address Label"
            value={newAddress.label}
            onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
            placeholder="Home, Office, Parents, etc."
            required
          />
          <Input
            label="Street & Building Details"
            value={newAddress.addressLine}
            onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })}
            placeholder="e.g. Apartment 4B, Woodvale Grove, Westlands"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={newAddress.latitude}
              onChange={e => setNewAddress({ ...newAddress, latitude: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={newAddress.longitude}
              onChange={e => setNewAddress({ ...newAddress, longitude: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientProfilePage;
