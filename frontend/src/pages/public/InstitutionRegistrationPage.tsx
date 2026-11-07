import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { NepalEduLogo } from '../../components/common/NepalEduLogo';
import { LogoUpload } from '../../components/common/LogoUpload';
import {
  NepalLocationHelper,
  NEPAL_LOCATION_DATA,
} from '../../data/nepalLocations';
import {
  School,
  Building,
  GraduationCap,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';

export const InstitutionRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  // 3-Step Wizard: 1 = Institution Details, 2 = Admin Account, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [emisCode, setEmisCode] = useState('610128001');
  const [institutionName, setInstitutionName] = useState('Dhambojhi Higher Secondary School');
  const [nameNepali, setNameNepali] = useState('धम्बोज्ही उच्च माध्यमिक विद्यालय');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [province, setProvince] = useState('Lumbini Province');
  const [district, setDistrict] = useState('Banke');
  const [localLevel, setLocalLevel] = useState('Nepalgunj Sub-Metropolitan City');
  const [institutionType, setInstitutionType] = useState('Secondary School (Class 1–12)');
  const [mediumEnglish, setMediumEnglish] = useState(true);
  const [mediumNepali, setMediumNepali] = useState(true);

  // Admin Account Details
  const [adminFullName, setAdminFullName] = useState('Ram Chandra Sharma');
  const [adminDesignation, setAdminDesignation] = useState('Principal');
  const [adminEmail, setAdminEmail] = useState('principal@dhambojhi.edu.np');
  const [adminPhone, setAdminPhone] = useState('9858021000');
  const [adminUsername, setAdminUsername] = useState('dhambojhi_admin');
  const [adminPassword, setAdminPassword] = useState('Nepal@123');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('Nepal@123');
  const [showPassword, setShowPassword] = useState(false);

  // Terms Acceptance
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Status & Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Location helpers
  const provinces = NepalLocationHelper.getProvinces();
  const districts = NepalLocationHelper.getDistricts(province);
  const localLevels = NepalLocationHelper.getLocalLevels(district);

  const handleProvinceChange = (p: string) => {
    setProvince(p);
    const newDistricts = NepalLocationHelper.getDistricts(p);
    const firstDist = newDistricts[0] || '';
    setDistrict(firstDist);
    const newLocals = NepalLocationHelper.getLocalLevels(firstDist);
    setLocalLevel(newLocals[0] || '');
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    const newLocals = NepalLocationHelper.getLocalLevels(d);
    setLocalLevel(newLocals[0] || '');
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!emisCode.trim()) {
        setError('Government EMIS Code is required.');
        return false;
      }
      if (!institutionName.trim()) {
        setError('Institution Name (English) is required.');
        return false;
      }
      if (!province || !district || !localLevel) {
        setError('Province, District, and Municipality are required.');
        return false;
      }
      if (!mediumEnglish && !mediumNepali) {
        setError('Please select at least one medium of instruction.');
        return false;
      }
    } else if (step === 2) {
      if (!adminFullName.trim()) {
        setError('Administrator full name is required.');
        return false;
      }
      if (!adminEmail.trim() || !adminEmail.includes('@')) {
        setError('Valid official email address is required.');
        return false;
      }
      if (!adminPhone.trim()) {
        setError('Contact mobile phone number is required.');
        return false;
      }
      if (!adminUsername.trim()) {
        setError('Administrator username is required.');
        return false;
      }
      if (!adminPassword || adminPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (adminPassword !== adminConfirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev));
    }
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setError('Please accept the Nepal Education Platform terms & CDC compliance.');
      return;
    }

    setLoading(true);
    setError(null);

    const medium = mediumEnglish && mediumNepali ? 'BOTH' : mediumEnglish ? 'ENGLISH' : 'NEPALI';

    const payload = {
      institutionName,
      nameNepali,
      logoDataUrl: logoDataUrl || undefined,
      emisCode,
      province,
      district,
      localLevel,
      institutionType: 'COMMUNITY',
      institutionKind: institutionType.includes('College') ? 'COLLEGE' : 'SCHOOL',
      category: 'COMMUNITY',
      mediumOfInstruction: medium,
      contactPerson: adminFullName,
      designation: adminDesignation,
      email: adminEmail,
      phone: adminPhone,
      adminFullName,
      adminUsername,
      adminPassword,
      adminEmail,
      adminPhone,
      academicYear: '2083',
      educationLevels: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
      requestedPackages: ['PACKAGE_3_SECONDARY'],
    };

    try {
      const res = await api.post<{ requestCode: string; message: string }>('/auth/register-institution', payload);
      setSubmittedCode(res.requestCode || `REQ-${emisCode}`);
    } catch (err: any) {
      setError(err.message || 'Institution registration request failed. Please review details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e9f6f1',
        color: '#0e3e3b',
        fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <NepalEduLogo size="md" onClick={() => navigate('/')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>Already registered?</span>
            <Link
              to="/login"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1.5px solid #0f4c4a',
                color: '#0f4c4a',
                fontWeight: 700,
              }}
            >
              Institution Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '36px auto',
          padding: '0 20px',
        }}
      >
        {submittedCode ? (
          /* SUCCESS SCREEN */
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(15, 81, 50, 0.08)',
              border: '1.5px solid #bfeede',
              maxWidth: '600px',
              margin: '40px auto',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#e9f6f1',
                color: '#0f4c4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0e3e3b', marginBottom: '10px' }}>
              Institution Application Submitted!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              Your application for <strong>{institutionName}</strong> (EMIS: {emisCode}) has been received and queued for Super Admin review.
            </p>

            <div
              style={{
                background: '#f8fcfb',
                borderRadius: '12px',
                border: '1.5px dashed #CBD5E1',
                padding: '16px',
                marginBottom: '28px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Application Tracking Reference
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f4c4a', letterSpacing: '1px', marginTop: '4px' }}>
                {submittedCode}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <Link
                to={`/institution-registration-status?code=${submittedCode}`}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: '#0f4c4a',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                Track Status Online
              </Link>
              <Link
                to="/"
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  color: '#0e3e3b',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION WIZARD FORM */
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(15, 81, 50, 0.08)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
            }}
          >
            {/* Left Decorative Illustration Column (Matching screenshot) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #e9f6f1 0%, #D1FAE5 100%)',
                padding: '40px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRight: '1px solid #E2E8F0',
              }}
            >
              <div>
                <NepalEduLogo size="md" />

                <div style={{ marginTop: '40px' }}>
                  <div
                    style={{
                      width: '100%',
                      padding: '24px 16px',
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      textAlign: 'center',
                      boxShadow: '0 8px 20px rgba(15, 81, 50, 0.08)',
                      border: '1px solid #bfeede',
                    }}
                  >
                    {/* Supplied Reference School Building Illustration */}
                    <img
                      src="/assets/brand/nepali_school_illustration_reference.png"
                      alt="Nepali School Campus"
                      style={{
                        width: '180px',
                        height: 'auto',
                        maxHeight: '130px',
                        margin: '0 auto',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                    />
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f4c4a', marginTop: '12px' }}>
                      Certified Digital Campus
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Instant Smart Board & CDC Books Provisioning
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: '#0f4c4a', marginBottom: '4px' }}>
                  Why Register Your School?
                </div>
                • Free access to CDC interactive e-textbooks<br />
                • Automated attendance & marks recording<br />
                • AI Assignment & Quiz generators
              </div>
            </div>

            {/* Right Form Wizard Column */}
            <div style={{ padding: '40px 36px' }}>

              {/* Title & Subtitle */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0e3e3b', letterSpacing: '-0.4px', marginBottom: '4px' }}>
                  Register Your School / College
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B' }}>
                  Create an institutional account to bring your school/college on Nepal Education Platform.
                </p>
              </div>

              {/* 3-STEP STEPPER (Matches screenshot 1. Institution Details -> 2. Admin Account -> 3. Confirmation) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: currentStep >= 1 ? '#0f4c4a' : '#CBD5E1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 1 ? '#0f4c4a' : '#64748B' }}>
                    Institution Details
                  </span>
                </div>

                <div style={{ flex: 1, height: '2px', background: currentStep >= 2 ? '#0f4c4a' : '#E2E8F0', margin: '0 10px' }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: currentStep >= 2 ? '#0f4c4a' : '#CBD5E1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {currentStep > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 2 ? '#0f4c4a' : '#64748B' }}>
                    Admin Account
                  </span>
                </div>

                <div style={{ flex: 1, height: '2px', background: currentStep >= 3 ? '#0f4c4a' : '#E2E8F0', margin: '0 10px' }} />

                {/* Step 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: currentStep === 3 ? '#0f4c4a' : '#CBD5E1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    3
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: currentStep === 3 ? '#0f4c4a' : '#64748B' }}>
                    Confirmation
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '13px',
                    marginBottom: '18px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: INSTITUTION DETAILS (Matches screenshot fields) */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* EMIS Code */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      EMIS Code *
                    </label>
                    <input
                      type="text"
                      value={emisCode}
                      onChange={(e) => setEmisCode(e.target.value)}
                      placeholder="e.g. 610128001 or 570010001"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0e3e3b',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Name (English) & Name (Nepali) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Institution Name (English) *
                      </label>
                      <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        placeholder="e.g. Dhambojhi Higher Secondary School"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0e3e3b',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Institution Name (Nepali) *
                      </label>
                      <input
                        type="text"
                        value={nameNepali}
                        onChange={(e) => setNameNepali(e.target.value)}
                        placeholder="धम्बोज्ही उच्च माध्यमिक विद्यालय"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0e3e3b',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <LogoUpload value={logoDataUrl} onChange={setLogoDataUrl} label="School / College logo (optional)" />
                  </div>

                  {/* Province & District (Cascading) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Province *
                      </label>
                      <select
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13.5px',
                          color: '#0e3e3b',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13.5px',
                          color: '#0e3e3b',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Municipality */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Municipality / Local Level *
                    </label>
                    <select
                      value={localLevel}
                      onChange={(e) => setLocalLevel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '13.5px',
                        color: '#0e3e3b',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {localLevels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Institution Type & Medium */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Institution Type *
                      </label>
                      <select
                        value={institutionType}
                        onChange={(e) => setInstitutionType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13.5px',
                          color: '#0e3e3b',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="Secondary School (Class 1–12)">Secondary School (Class 1–12)</option>
                        <option value="Basic School (Class 1–8)">Basic School (Class 1–8)</option>
                        <option value="Higher Secondary (11–12)">Higher Secondary (11–12)</option>
                        <option value="College (Degree/Diploma)">College (Degree/Diploma)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Medium *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={mediumEnglish}
                            onChange={(e) => setMediumEnglish(e.target.checked)}
                            style={{ accentColor: '#0f4c4a' }}
                          />
                          <span>English</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={mediumNepali}
                            onChange={(e) => setMediumNepali(e.target.checked)}
                            style={{ accentColor: '#0f4c4a' }}
                          />
                          <span>नेपाली</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Cancel & Next */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        background: '#0f4c4a',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(15, 81, 50, 0.25)',
                      }}
                    >
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADMIN ACCOUNT */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Administrator Full Name *
                      </label>
                      <input
                        type="text"
                        value={adminFullName}
                        onChange={(e) => setAdminFullName(e.target.value)}
                        placeholder="e.g. Ram Chandra Sharma"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Designation *
                      </label>
                      <select
                        value={adminDesignation}
                        onChange={(e) => setAdminDesignation(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="Principal">Principal / Headmaster</option>
                        <option value="School Administrator">School Administrator</option>
                        <option value="ICT Coordinator">ICT Coordinator</option>
                        <option value="Vice Principal">Vice Principal</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="principal@dhambojhi.edu.np"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Mobile Phone Number *
                      </label>
                      <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="9858021000"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Login Username *
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. dhambojhi_admin"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Account Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Buttons: Prev & Next */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        background: '#0f4c4a',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Review & Confirm</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION & REVIEW */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: '#f8fcfb',
                      borderRadius: '12px',
                      padding: '18px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f4c4a', marginBottom: '12px' }}>
                      Institution Overview
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div><strong>School Name:</strong> {institutionName}</div>
                      <div><strong>Nepali Name:</strong> {nameNepali || '—'}</div>
                      <div><strong>EMIS Code:</strong> {emisCode}</div>
                      <div><strong>Type:</strong> {institutionType}</div>
                      <div><strong>Location:</strong> {localLevel}, {district}, {province}</div>
                      <div><strong>Medium:</strong> {mediumEnglish && mediumNepali ? 'English & Nepali' : mediumEnglish ? 'English' : 'Nepali'}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f8fcfb',
                      borderRadius: '12px',
                      padding: '18px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f4c4a', marginBottom: '12px' }}>
                      Authorized Administrator
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div><strong>Name:</strong> {adminFullName}</div>
                      <div><strong>Designation:</strong> {adminDesignation}</div>
                      <div><strong>Email:</strong> {adminEmail}</div>
                      <div><strong>Phone:</strong> {adminPhone}</div>
                      <div><strong>Username:</strong> {adminUsername}</div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      style={{ marginTop: '3px', accentColor: '#0f4c4a' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
                      I certify that I am the authorized institutional lead for this school/college. I accept the Nepal Education Platform operating charter and CDC digital content guidelines.
                    </label>
                  </div>

                  {/* Buttons: Back & Submit */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSubmit}
                      style={{
                        padding: '11px 26px',
                        borderRadius: '8px',
                        background: '#0f4c4a',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 10px rgba(15, 81, 50, 0.25)',
                      }}
                    >
                      {loading ? 'Submitting Application...' : 'Submit Application →'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionRegistrationPage;
