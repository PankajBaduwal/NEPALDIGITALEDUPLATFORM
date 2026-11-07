import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  NepalLocationHelper,
  NEPAL_LOCATION_DATA,
} from '../../data/nepalLocations';
import {
  X,
  Building2,
  GraduationCap,
  School,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Calendar,
  CreditCard,
  Key,
  Check,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInst: any) => void;
}

export const SuperAdminProvisioningWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kind, setKind] = useState<'SCHOOL' | 'COLLEGE'>('SCHOOL');

  // Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: '',
    nameNepali: '',
    shortName: '',
    emisCode: '',
    registrationNumber: '',
    category: 'COMMUNITY',
    establishedYear: '2050',

    // 2. Location & Contact
    province: 'Lumbini Province',
    district: 'Banke',
    localLevel: 'Nepalgunj Sub-Metropolitan City',
    ward: 2,
    street: 'Dhambojhi Chowk',
    postalCode: '21900',
    contactPerson: '',
    designation: 'Principal',
    email: '',
    phone: '',
    alternativePhone: '',
    website: '',

    // 3. Academic Structure
    academicYearName: '2081/2082',
    educationLevels: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
    sectionsPerGrade: 2,
    mediumOfInstruction: 'BOTH',

    // 4. Admin Account
    adminFullName: '',
    adminFullNameNepali: '',
    adminUsername: '',
    adminPassword: 'Password@123',
    adminEmail: '',
    adminPhone: '',
    adminDesignation: 'Principal / Institutional Administrator',

    // 5. Subscription
    packageCode: 'PACKAGE_3_SECONDARY',
    studentQuota: 1000,
    teacherQuota: 50,
    validMonths: 12,

    // 6. Feature Access
    smartBoardAccess: true,
    simulationAccess: true,
    aiAssistantAccess: true,
    onlineSubmissions: true,
    studentDashboardAccess: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisioningResult, setProvisioningResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Geographic helpers
  const provinces = NepalLocationHelper.getProvinces();
  const districts = NepalLocationHelper.getDistricts(formData.province);
  const localLevels = NepalLocationHelper.getLocalLevels(formData.district);
  const maxWards = NepalLocationHelper.getWardCount(formData.localLevel);

  const handleProvinceChange = (p: string) => {
    const newDistricts = NepalLocationHelper.getDistricts(p);
    const firstDist = newDistricts[0] || '';
    const newLocalLevels = NepalLocationHelper.getLocalLevels(firstDist);
    setFormData((prev) => ({
      ...prev,
      province: p,
      district: firstDist,
      localLevel: newLocalLevels[0] || '',
      ward: 1,
    }));
  };

  const handleDistrictChange = (d: string) => {
    const newLocalLevels = NepalLocationHelper.getLocalLevels(d);
    setFormData((prev) => ({
      ...prev,
      district: d,
      localLevel: newLocalLevels[0] || '',
      ward: 1,
    }));
  };

  const toggleLevel = (lvl: string) => {
    setFormData((prev) => {
      const exists = prev.educationLevels.includes(lvl);
      return {
        ...prev,
        educationLevels: exists
          ? prev.educationLevels.filter((x) => x !== lvl)
          : [...prev.educationLevels, lvl],
      };
    });
  };

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Official Institution Name is required.');
        return false;
      }
      if (!formData.emisCode.trim()) {
        setError('EMIS Code is required.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setError('Contact person, official email, and phone number are required.');
        return false;
      }
    } else if (currentStep === 3) {
      if (kind === 'SCHOOL' && formData.educationLevels.length === 0) {
        setError('Select at least one educational level.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.adminFullName.trim()) {
        setError('Administrator full name is required.');
        return false;
      }
      if (!formData.adminUsername.trim()) {
        setError('Administrator username is required.');
        return false;
      }
      if (!formData.adminPassword || formData.adminPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((p) => Math.min(p + 1, 7));
    }
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleExecuteProvisioning = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        institutionInfo: {
          name: formData.name.trim(),
          nameNepali: formData.nameNepali.trim(),
          shortName: formData.shortName.trim(),
          emisCode: formData.emisCode.trim(),
          registrationNumber: formData.registrationNumber.trim(),
          institutionKind: kind,
          category: formData.category,
          province: formData.province,
          district: formData.district,
          localLevel: formData.localLevel,
          ward: formData.ward,
          street: formData.street,
          postalCode: formData.postalCode,
          phone: formData.phone.trim(),
          alternativePhone: formData.alternativePhone.trim(),
          email: formData.email.trim(),
          website: formData.website.trim(),
          establishedYear: formData.establishedYear,
          contactPerson: formData.contactPerson.trim(),
          mediumOfInstruction: formData.mediumOfInstruction,
        },
        academicConfig: {
          academicYearName: formData.academicYearName,
          educationLevels: formData.educationLevels,
          sectionsPerGrade: formData.sectionsPerGrade,
        },
        adminAccount: {
          fullName: formData.adminFullName.trim(),
          fullNameNepali: formData.adminFullNameNepali.trim(),
          username: formData.adminUsername.trim().toLowerCase(),
          password: formData.adminPassword,
          email: formData.adminEmail.trim() || formData.email.trim(),
          phone: formData.adminPhone.trim() || formData.phone.trim(),
          designation: formData.adminDesignation,
          role: kind === 'COLLEGE' ? 'COLLEGE_ADMIN' : 'SCHOOL_ADMIN',
        },
        subscription: {
          packageCode: formData.packageCode,
          studentQuota: formData.studentQuota,
          teacherQuota: formData.teacherQuota,
          validMonths: formData.validMonths,
          smartBoardAccess: formData.smartBoardAccess,
        },
        featureAccess: {
          smartBoardAccess: formData.smartBoardAccess,
          simulationAccess: formData.simulationAccess,
          aiAssistantAccess: formData.aiAssistantAccess,
          onlineSubmissions: formData.onlineSubmissions,
          studentDashboardAccess: formData.studentDashboardAccess,
        },
      };

      const res = await api.post<any>('/admin/institutions/provision', payload);
      setProvisioningResult(res);
      if (onSuccess) {
        onSuccess(res.institution);
      }
    } catch (err: any) {
      setError(err.message || 'Direct institution provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    'Basic Information',
    'Location & Contact',
    'Academic Config',
    'Admin Account',
    'Subscription Plan',
    'Feature Matrix',
    'Review & Provision',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(14, 62, 59, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #dcebe6',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #dcebe6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f4faf8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#117a6b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                Direct Institution Provisioning Wizard
              </h3>
              <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                Super Admin 12-Step Automated Onboarding Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        {!provisioningResult && (
          <div
            style={{
              padding: '12px 28px',
              background: '#ffffff',
              borderBottom: '1px solid #ebf5f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {stepsList.map((step, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <div
                  key={step}
                  onClick={() => isDone && setCurrentStep(stepNum)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isDone ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: isCurrent ? '#117a6b' : isDone ? '#1fb589' : '#ebf5f1',
                      color: isCurrent || isDone ? '#ffffff' : '#5f736f',
                    }}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isCurrent ? '700' : '500',
                      color: isCurrent ? '#117a6b' : isDone ? '#0e3e3b' : '#8da19d',
                    }}
                  >
                    {step}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <span style={{ color: '#cfdcd8', margin: '0 4px' }}>›</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#991b1b',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {provisioningResult ? (
            /* COMPLETED PROVISIONING SUCCESS STATE */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0e3e3b', marginBottom: '6px' }}>
                Institution Fully Provisioned & Live!
              </h3>
              <p style={{ fontSize: '14px', color: '#4b605b', marginBottom: '24px' }}>
                All 12 atomic steps executed successfully for <strong>{provisioningResult.institution?.name}</strong>.
              </p>

              {/* Activation Credentials Box */}
              <div
                style={{
                  background: '#f4faf8',
                  border: '1px solid #cfdcd8',
                  borderRadius: '12px',
                  padding: '20px',
                  maxWidth: '460px',
                  margin: '0 auto 24px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase', marginBottom: '10px' }}>
                  School Admin Access Credentials
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#5f736f' }}>Admin Username:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{provisioningResult.adminUser?.username}</strong>
                  <span style={{ color: '#5f736f' }}>Role:</span>
                  <strong>{provisioningResult.adminUser?.role}</strong>
                  <span style={{ color: '#5f736f' }}>Initial Password:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{formData.adminPassword}</strong>
                  <span style={{ color: '#5f736f' }}>EMIS Code:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{formData.emisCode}</strong>
                  <span style={{ color: '#5f736f' }}>Job Reference:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#117a6b' }}>{provisioningResult.jobCode}</strong>
                </div>
              </div>

              {/* Execution Steps Log Accordion/Preview */}
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', background: '#ffffff', border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Executed Provisioning Pipeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {provisioningResult.stepLog?.map((s: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2f4f4c' }}>
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
                      <strong style={{ width: '220px' }}>{s.name}</strong>
                      <span style={{ color: '#5f736f' }}>{s.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 1: BASIC INFORMATION */}
              {currentStep === 1 && (
                <div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setKind('SCHOOL')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: `2px solid ${kind === 'SCHOOL' ? '#117a6b' : '#dcebe6'}`,
                        background: kind === 'SCHOOL' ? '#e6f7f0' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '700',
                        color: kind === 'SCHOOL' ? '#1e40af' : '#4b605b',
                      }}
                    >
                      <School size={18} />
                      School (Classes 1–12)
                    </button>

                    <button
                      type="button"
                      onClick={() => setKind('COLLEGE')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: `2px solid ${kind === 'COLLEGE' ? '#117a6b' : '#dcebe6'}`,
                        background: kind === 'COLLEGE' ? '#e6f7f0' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '700',
                        color: kind === 'COLLEGE' ? '#1e40af' : '#4b605b',
                      }}
                    >
                      <GraduationCap size={18} />
                      College / Higher Education
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Institution Name (Official English) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dhambojhi Higher Secondary School"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Devanagari Name (नेपाली नाम)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. धम्बोझी उच्च माध्यमिक विद्यालय"
                        value={formData.nameNepali}
                        onChange={(e) => setFormData({ ...formData, nameNepali: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Short Code / Acronym
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DHSS"
                        value={formData.shortName}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Government EMIS Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 570010001"
                        value={formData.emisCode}
                        onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Institution Classification Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        <option value="COMMUNITY">Community / Public School</option>
                        <option value="INSTITUTIONAL">Institutional / Private</option>
                        <option value="RELIGIOUS">Religious / Gurukul / Madrasa</option>
                        <option value="TECHNICAL">Technical / TVET Stream</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION & CONTACT */}
              {currentStep === 2 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Province (प्रदेश) *
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        District (जिल्ला) *
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Local Level (Municipality) *
                      </label>
                      <select
                        value={formData.localLevel}
                        onChange={(e) => setFormData({ ...formData, localLevel: e.target.value, ward: 1 })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        {localLevels.map((ll) => (
                          <option key={ll} value={ll}>{ll}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Ward Number *
                      </label>
                      <select
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        {Array.from({ length: maxWards }, (_, i) => i + 1).map((w) => (
                          <option key={w} value={w}>Ward No. {w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Contact Person / Principal *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Keshav Prasad Sharma"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Official Email *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. info@dhambojhi.edu.np"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 081-520111"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Street / Chowk Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dhambojhi Chowk"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ACADEMIC CONFIG */}
              {currentStep === 3 && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                      Offered Educational Levels (CDC Curriculum Alignment)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { id: 'BASIC_1_5', label: 'Primary (Classes 1–5)', desc: 'CDC Basic Curriculum' },
                        { id: 'BASIC_6_8', label: 'Middle (Classes 6–8)', desc: 'CDC Middle Curriculum' },
                        { id: 'SECONDARY_9_10', label: 'Secondary (Classes 9–10)', desc: 'SEE Board Curriculum' },
                        { id: 'HIGHER_SECONDARY_11_12', label: 'Higher Secondary (Classes 11–12)', desc: 'NEB Science & Management' },
                      ].map((lvl) => {
                        const checked = formData.educationLevels.includes(lvl.id);
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => toggleLevel(lvl.id)}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: `1.5px solid ${checked ? '#117a6b' : '#dcebe6'}`,
                              background: checked ? '#e6f7f0' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <input type="checkbox" checked={checked} readOnly />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700' }}>{lvl.label}</div>
                              <div style={{ fontSize: '11px', color: '#5f736f' }}>{lvl.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Academic Year Name
                      </label>
                      <input
                        type="text"
                        value={formData.academicYearName}
                        onChange={(e) => setFormData({ ...formData, academicYearName: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Sections per Grade
                      </label>
                      <select
                        value={formData.sectionsPerGrade}
                        onChange={(e) => setFormData({ ...formData, sectionsPerGrade: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        <option value={1}>1 Section (Section A)</option>
                        <option value={2}>2 Sections (Sections A, B)</option>
                        <option value={3}>3 Sections (Sections A, B, C)</option>
                        <option value={4}>4 Sections (Sections A, B, C, D)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Medium of Instruction
                      </label>
                      <select
                        value={formData.mediumOfInstruction}
                        onChange={(e) => setFormData({ ...formData, mediumOfInstruction: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        <option value="BOTH">Bilingual (English & Nepali)</option>
                        <option value="ENGLISH">English Medium</option>
                        <option value="NEPALI">Nepali Medium</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ADMIN ACCOUNT */}
              {currentStep === 4 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Admin Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Keshav Prasad Sharma"
                        value={formData.adminFullName}
                        onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Admin Username * (Unique system handle)
                      </label>
                      <input
                        type="text"
                        placeholder={`admin_${formData.emisCode || 'school'}`}
                        value={formData.adminUsername}
                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Initial Password * (Secure hash generated)
                      </label>
                      <input
                        type="text"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Assigned Administrative Role
                      </label>
                      <input
                        type="text"
                        value={kind === 'COLLEGE' ? 'COLLEGE_ADMIN' : 'SCHOOL_ADMIN'}
                        readOnly
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #dcebe6', background: '#f4faf8', fontSize: '14px', fontWeight: '700' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SUBSCRIPTION PLAN */}
              {currentStep === 5 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    {[
                      { code: 'PACKAGE_1_FOUNDATION', name: 'Foundation Package', grades: 'Classes 1–5' },
                      { code: 'PACKAGE_2_MIDDLE', name: 'Middle School Package', grades: 'Classes 6–8' },
                      { code: 'PACKAGE_3_SECONDARY', name: 'Secondary Package', grades: 'Classes 9–12' },
                      { code: 'K12_ALL', name: 'Complete K-12 Institutional Suite', grades: 'Classes 1–12' },
                    ].map((pkg) => {
                      const selected = formData.packageCode === pkg.code;
                      return (
                        <div
                          key={pkg.code}
                          onClick={() => setFormData({ ...formData, packageCode: pkg.code })}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: `2px solid ${selected ? '#117a6b' : '#dcebe6'}`,
                            background: selected ? '#e6f7f0' : '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#5f736f' }}>{pkg.grades}</span>
                            <input type="radio" checked={selected} readOnly />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
                            {pkg.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Student Quota Limit
                      </label>
                      <input
                        type="number"
                        value={formData.studentQuota}
                        onChange={(e) => setFormData({ ...formData, studentQuota: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Teacher Accounts Quota
                      </label>
                      <input
                        type="number"
                        value={formData.teacherQuota}
                        onChange={(e) => setFormData({ ...formData, teacherQuota: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                        Validity Duration
                      </label>
                      <select
                        value={formData.validMonths}
                        onChange={(e) => setFormData({ ...formData, validMonths: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '14px', background: '#fff' }}
                      >
                        <option value={12}>1 Year (12 Months)</option>
                        <option value={24}>2 Years (24 Months)</option>
                        <option value={36}>3 Years (36 Months)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: FEATURE ACCESS */}
              {currentStep === 6 && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'smartBoardAccess', label: 'Interactive Smart Board & Whiteboard Suite', desc: 'Allows classroom whiteboard casting and teacher presentation tools.' },
                      { key: 'simulationAccess', label: 'Interactive 3D Science & Mathematics Simulations', desc: 'Virtual laboratories for physics, chemistry, biology and maths.' },
                      { key: 'aiAssistantAccess', label: 'AI Learning Assistant (Nepali & English)', desc: 'Context-grounded curriculum AI tutor for students and teachers.' },
                      { key: 'onlineSubmissions', label: 'Online Homework & Student Assignments', desc: 'Permits digital assignment upload and grading.' },
                      { key: 'studentDashboardAccess', label: 'Student Independent Portal Access', desc: 'Allows students to log in from home devices.' },
                    ].map((f) => {
                      const enabled = (formData as any)[f.key];
                      return (
                        <div
                          key={f.key}
                          onClick={() => setFormData({ ...formData, [f.key]: !enabled })}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: `1.5px solid ${enabled ? '#117a6b' : '#dcebe6'}`,
                            background: enabled ? '#f0f9ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: enabled ? '#0369a1' : '#0e3e3b' }}>
                              {f.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#5f736f' }}>{f.desc}</div>
                          </div>
                          <input type="checkbox" checked={enabled} readOnly />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW & EXECUTE PROVISIONING */}
              {currentStep === 7 && (
                <div>
                  <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: '#0e3e3b' }}>
                      Ready to Execute 12-Step Atomic Provisioning
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                      <div><span style={{ color: '#5f736f' }}>Institution:</span> <strong>{formData.name}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>EMIS Code:</span> <strong style={{ fontFamily: 'monospace' }}>{formData.emisCode}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Location:</span> <strong>{formData.localLevel}, Ward {formData.ward}, {formData.district}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Category:</span> <strong>{formData.category}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Admin Account:</span> <strong style={{ fontFamily: 'monospace' }}>{formData.adminUsername}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Assigned Package:</span> <strong>{formData.packageCode}</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Quotas:</span> <strong>{formData.studentQuota} Students • {formData.teacherQuota} Teachers</strong></div>
                      <div><span style={{ color: '#5f736f' }}>Sections/Grade:</span> <strong>{formData.sectionsPerGrade} Sections</strong></div>
                    </div>
                  </div>

                  <div style={{ background: '#e6f7f0', border: '1px solid #bfeede', borderRadius: '10px', padding: '14px', fontSize: '12px', color: '#0f4c4a' }}>
                    ✓ This action will atomically create the Institution document, Academic Year 2081/2082, Classes 1–12, Sections, CDC Curriculum Subject mappings, Default Timetable layout, Feature Access settings, and the Primary Administrator account.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #dcebe6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f4faf8',
          }}
        >
          {provisioningResult ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: '#117a6b',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close & Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cfdcd8',
                    color: '#4b605b',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cfdcd8',
                    color: '#5f736f',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteProvisioning}
                  disabled={loading}
                  style={{
                    padding: '10px 26px',
                    borderRadius: '8px',
                    background: loading ? '#93c5fd' : '#16a34a',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Provisioning Institution...
                    </>
                  ) : (
                    <>
                      Execute Atomic Provisioning <Check size={16} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

