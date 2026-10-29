import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, User, Stethoscope, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { UserRole, ProviderType } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const initialRole = searchParams.get('role') === 'PROVIDER' ? 'PROVIDER' : 'PATIENT';
  const [role, setRole] = useState<'PATIENT' | 'PROVIDER'>(initialRole);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    providerType: 'DOCTOR',
    businessName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      if (role === 'PATIENT') {
        await register({
          role: UserRole.PATIENT,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        navigate('/dashboard');
      } else {
        await register({
          role: UserRole.PROVIDER,
          providerType: formData.providerType as ProviderType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        navigate('/provider/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const providerTypes = [
    { value: 'DOCTOR', label: 'Doctor / Medical Officer' },
    { value: 'NURSE', label: 'Registered Nurse' },
    { value: 'LABORATORY', label: 'Laboratory / Diagnostic Center' },
    { value: 'PHARMACY', label: 'Licensed Pharmacy' },
    { value: 'AMBULANCE', label: 'Ambulance Operator' },
    { value: 'PHYSIOTHERAPIST', label: 'Physiotherapist' },
    { value: 'HOME_CARE', label: 'Home & Elderly Care Specialist' },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary items-center justify-center text-white shadow-md shadow-primary/20 mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Join MEDICONNECT</h2>
          <p className="text-sm text-gray-500">Create your account to get started</p>
        </div>

        <Card className="p-8 shadow-md">
          {/* Tab selector */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'PATIENT' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'PROVIDER' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Medical Provider
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Amina"
              />
              <Input
                label="Last Name"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Kamau"
              />
            </div>

            {role === 'PROVIDER' && (
              <>
                <Select
                  label="Provider Profession"
                  name="providerType"
                  required
                  value={formData.providerType}
                  onChange={handleChange}
                  options={providerTypes}
                />
                <Input
                  label="Clinic or Practice Name (Optional)"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Westlands Care Clinic"
                />
              </>
            )}

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="amina@example.com"
            />

            <Input
              label="Phone Number (M-Pesa enabled)"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 712 345 678"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>

            <Button type="submit" fullWidth isLoading={loading} size="lg" className="mt-2">
              {role === 'PATIENT' ? 'Register as Patient' : 'Register as Provider'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
