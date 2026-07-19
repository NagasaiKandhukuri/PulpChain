# Security Policy

## Supported Versions
Only the latest main branch is supported for security updates.

## Reporting a Vulnerability
Please report security vulnerabilities by creating a confidential security advisory on GitHub or contacting the repository owners directly. Do not open public issues for security vulnerabilities.

## Secret Handling
- **Never commit `.env`, `.env.local`, or any file containing real credentials.**
- The `SUPABASE_SERVICE_ROLE_KEY` or database passwords must never be used in the frontend codebase or committed to version control.
- Only the `VITE_SUPABASE_ANON_KEY` is permitted in the client environment.

## Authentication & Authorization
- All user authentication is handled by Supabase Auth.
- Client-side routing (e.g., `ProtectedRoute`) is solely for UX. Real authorization boundaries must be enforced at the database level using Row Level Security (RLS).

## Production Data Handling
- Do not use real user data in development environments.
- Do not commit production database dumps.
- Ensure automated backups are configured within your Supabase project settings.
