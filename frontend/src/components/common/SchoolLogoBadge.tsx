import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Pub = { _id?: string; id?: string; emisCode: string; logoUrl?: string };
let cache: Promise<Pub[]> | null = null;
const loadPublic = () => {
  if (!cache) {
    cache = api
      .get<any>('/auth/institutions')
      .then((r) => (Array.isArray(r) ? r : r?.data || []))
      .catch(() => { cache = null; return []; });
  }
  return cache;
};

/** The signed-in user's school logo URL (null while loading or when none is set). */
export const useSchoolLogo = (): string | null => {
  const { user } = useAuth() as any;
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    loadPublic().then((list) => {
      const hit = list.find((i) => (user?.institutionCode && i.emisCode === user.institutionCode) || (user?.institutionId && (i._id === user.institutionId || i.id === user.institutionId)));
      if (live) setLogo(hit?.logoUrl || null);
    });
    return () => { live = false; };
  }, [user?.institutionCode, user?.institutionId]);
  return logo;
};

/** School logo in a rounded white tile; renders `fallback` when the school has no logo. */
export const SchoolLogoBadge: React.FC<{ size?: number; radius?: number; fallback: React.ReactNode }> = ({ size = 38, radius = 10, fallback }) => {
  const logo = useSchoolLogo();
  if (!logo) return <>{fallback}</>;
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: '#fff', border: '1px solid #dcebe6', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
      <img src={logo} alt="School logo" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
    </div>
  );
};
