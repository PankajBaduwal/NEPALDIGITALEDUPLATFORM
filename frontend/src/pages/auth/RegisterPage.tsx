import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  School,
  MapPin,
  User,
  Package,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionName: '',
    nameNepali: '',
    emisCode: '',
    institutionType: 'COMMUNITY',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    localLevel: 'Kathmandu Metropolitan City',
    ward: 1,
    contactPerson: '',
    designation: 'Principal',
    email: '',
    phone: '',
    requestedPackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
    estimatedStudents: 350,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const provinces = [
    'Koshi Province',
    'Madhesh Province',
    'Bagmati Province',
    'Gandaki Province',
    'Lumbini Province',
    'Karnali Province',
    'Sudurpashchim Province',
  ];

  const handlePackageToggle = (pkg: string) => {
    setFormData((prev) => {
      const exists = prev.requestedPackages.includes(pkg);
      return {
        ...prev,
        requestedPackages: exists
          ? prev.requestedPackages.filter((p) => p !== pkg)
          : [...prev.requestedPackages, pkg],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionName || !formData.emisCode || !formData.contactPerson || !formData.email || !formData.phone) {
      setError('Please fill in all required institutional details.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ requestCode: string; message: string }>('/auth/register-institution', formData);
      setSubmittedCode(res.requestCode);
    } catch (err: any) {
      setError(err.message || 'Registration request could not be processed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fcfb', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0f4c4a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🇳🇵
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>Nepal Digital Education</h2>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Institution Onboarding Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Already have an account?</span>
          <Link
            to="/login"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: '600',
              background: '#ffffff',
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          
          {submittedCode ? (
            /* SUCCESS STATE */
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Onboarding Request Submitted Successfully!
              </h2>
              <p style={{ fontSize: '15px', color: '#475569', maxWidth: '560px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Your institution registration for <strong>{formData.institutionName}</strong> has been logged in the Central Nepal Education Registry.
              </p>

              <div style={{ background: '#f8fcfb', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '20px', maxWidth: '420px', margin: '0 auto 32px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                  Request Tracking Code
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f4c4a', letterSpacing: '1px', fontFamily: 'monospace' }}>
                  {submittedCode}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                  Keep this code for follow-up and license provisioning.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link
                  to="/"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: '#0f4c4a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Return to Home
                </Link>
                <Link
                  to="/login"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Explore Demo Role
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: '#e9f6f1', color: '#0f4c4a', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <Building2 size={14} /> INSTITUTION ONBOARDING
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Register Your School or College
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Connect your school with Nepal's centralized digital curriculum, interactive smart boards, and academic analytics.
                </p>
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#dc2626', fontSize: '13px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. School Information */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <School size={16} color="#0f4c4a" /> 1. School Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Institution Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shree Shanti Secondary School"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Institution Name (नेपाली)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: श्री शान्ति माध्यमिक विद्यालय"
                        value={formData.nameNepali}
                        onChange={(e) => setFormData({ ...formData, nameNepali: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        EMIS Code (MoEST 9-digit) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 270010001"
                        value={formData.emisCode}
                        onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Institution Type
                      </label>
                      <select
                        value={formData.institutionType}
                        onChange={(e) => setFormData({ ...formData, institutionType: e.target.value as any })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                      >
                        <option value="COMMUNITY">Community / Government School (सामुदायिक)</option>
                        <option value="INSTITUTIONAL">Institutional / Private School (संस्थागत)</option>
                        <option value="RELIGIOUS">Religious School (धार्मिक / गुरुकुल / मदरसा)</option>
                        <option value="TECHNICAL">Technical / TVET Institute (प्राविधिक)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Location */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <MapPin size={16} color="#0f766e" /> 2. Location & Jurisdiction
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Province *
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                      >
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kathmandu, Kaski, Morang"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Municipality / Rural Municipality *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pokhara Metropolitan"
                        value={formData.localLevel}
                        onChange={(e) => setFormData({ ...formData, localLevel: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Ward No.
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: parseInt(e.target.value) || 1 })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Official Contact Person */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <User size={16} color="#7c3aed" /> 3. Principal / Administrator Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Ramesh Prasad Sharma"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Designation
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="school.admin@domain.edu.np"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        Official Phone / Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="01-4412345 or 9851000000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Packages of Interest */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Package size={16} color="#6d5bd0" /> 4. Curriculum Packages of Interest
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {[
                      { key: 'PACKAGE_1_FOUNDATION', label: 'Foundation (Classes 1–5)', desc: 'Early learning & primary textbooks' },
                      { key: 'PACKAGE_2_MIDDLE', label: 'Middle School (Classes 6–8)', desc: 'BLE exam prep & science labs' },
                      { key: 'PACKAGE_3_SECONDARY', label: 'Secondary (Classes 9–12)', desc: 'SEE, +2 labs & AI RAG assistant' },
                    ].map((pkg) => {
                      const isSelected = formData.requestedPackages.includes(pkg.key);
                      return (
                        <div
                          key={pkg.key}
                          onClick={() => handlePackageToggle(pkg.key)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #0f4c4a' : '1px solid #cbd5e1',
                            background: isSelected ? '#e9f6f1' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{pkg.label}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ accentColor: '#0f4c4a' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{pkg.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#0f4c4a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '15px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '12px',
                  }}
                >
                  <Building2 size={18} />
                  {loading ? 'Submitting Registration...' : 'Submit Institutional Registration Request'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

