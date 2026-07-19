
import { supabase } from '../lib/supabase';

const providers = [
  {
    id: "google",
    provider: "google",
    label: "Continue with Google",
    enabled: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )
  },
  {
    id: "microsoft",
    provider: "azure",
    label: "Continue with Microsoft",
    enabled: false
  },
  {
    id: "github",
    provider: "github",
    label: "Continue with GitHub",
    enabled: false
  },
  {
    id: "apple",
    provider: "apple",
    label: "Continue with Apple",
    enabled: false
  }
];

export const AuthProviders = ({ intendedRole }) => {
  const handleOAuth = async (providerId) => {
    try {
      const redirectTo = new URL(`${window.location.origin}/auth/callback`);
      redirectTo.searchParams.set('role', intendedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId,
        options: {
          redirectTo: redirectTo.toString()
        }
      });

      if (error) {
        console.error("OAuth error:", error.message);
      }
    } catch (err) {
      console.error("Failed to initiate OAuth:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {providers.filter(p => p.enabled).map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleOAuth(provider.provider)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            width: '100%',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          {provider.icon}
          {provider.label}
        </button>
      ))}
    </div>
  );
};
