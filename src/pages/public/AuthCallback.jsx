import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for OAuth errors returned in the URL or Hash
      const hash = window.location.hash;
      let error = searchParams.get('error');
      let errorDescription = searchParams.get('error_description');

      if (hash && hash.includes('error=')) {
         const hashParams = new URLSearchParams(hash.substring(1));
         error = error || hashParams.get('error');
         errorDescription = errorDescription || hashParams.get('error_description');
      }

      if (error) {
        console.error("OAuth Error:", error, errorDescription);
        navigate('/login', { replace: true, state: { error: `Authentication failed: ${errorDescription?.replace(/\+/g, ' ') || error}` } });
        return;
      }

      // Supabase handles the session creation in the background
      // We just need to wait for it to be available
      const { data: { session: activeSession } } = await supabase.auth.getSession();

      if (!activeSession) {
        // If we still don't have a session, maybe it's just slow, or maybe it failed without URL params
        // For now, if no session, we can't proceed.
        // In a real app we might retry, but let's just bail after a delay or immediately.
        console.warn("No active session found during callback.");
        navigate('/login', { replace: true, state: { error: 'Failed to establish session.' } });
        return;
      }

      const intendedRole = searchParams.get('role') || 'school'; // fallback
      const userId = activeSession.user.id;
      const user = activeSession.user;

      // Fetch the profile created by the trigger
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        navigate('/login', { replace: true, state: { error: 'Profile creation failed.' } });
        return;
      }

      // Check if they are fully registered in their intended organization table
      let isFullyRegistered = false;
      let orgStatus = 'pending';
      const actualRole = profile.role === 'admin' ? 'admin' : intendedRole;

      if (actualRole === 'admin') {
         navigate('/admin/dashboard', { replace: true });
         return;
      }

      if (actualRole === 'school') {
        const { data: school } = await supabase.from('schools').select('status').eq('id', userId).single();
        if (school) {
          isFullyRegistered = true;
          orgStatus = school.status;
        } else if (user.user_metadata?.registration_data) {
          // Recover from metadata
          const meta = user.user_metadata.registration_data;
          const { error: insertError } = await supabase.from('schools').insert([{
            id: userId,
            name: meta.name,
            address: meta.address,
            contact_person: meta.contact_person,
            phone: meta.phone,
            email: user.email.toLowerCase(),
            status: 'pending'
          }]);

          if (!insertError) {
            isFullyRegistered = true;
            orgStatus = 'pending';
          }
        }
      } else if (actualRole === 'industry') {
        const { data: industry } = await supabase.from('industries').select('status').eq('id', userId).single();
        if (industry) {
          isFullyRegistered = true;
          orgStatus = industry.status;
        } else if (user.user_metadata?.registration_data) {
          // Recover from metadata
          const meta = user.user_metadata.registration_data;
          const { error: insertError } = await supabase.from('industries').insert([{
            id: userId,
            company_name: meta.company_name,
            contact_person: meta.contact_person,
            email: user.email.toLowerCase(),
            phone: meta.phone,
            gst_number: meta.gst_number,
            address: meta.address,
            industry_type: meta.industry_type,
            monthly_requirement_kg: meta.monthly_requirement_kg,
            status: 'pending'
          }]);

          if (!insertError) {
            isFullyRegistered = true;
            orgStatus = 'pending';
          }
        }
      }

      if (isFullyRegistered) {
        // Case A, B, C: Profile exists
        if (orgStatus === 'approved') {
          navigate(`/${actualRole}/dashboard`, { replace: true });
        } else if (orgStatus === 'rejected') {
          await supabase.auth.signOut();
          const loginPath = actualRole === 'industry' ? '/industry/login' : '/login';
          navigate(loginPath, { replace: true, state: { error: 'Your account registration was rejected by the administrator.' } });
        } else {
          // Pending
          await supabase.auth.signOut();
          const loginPath = actualRole === 'industry' ? '/industry/login' : '/login';
          navigate(loginPath, { replace: true, state: { error: 'Your account is awaiting administrator approval.' } });
        }
      } else {
        // Case D: No organization record exists and metadata recovery failed -> redirect to Complete Registration
        navigate(`/complete-registration?role=${actualRole}`, { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, session]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--text-muted)' }}>Completing authentication...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
