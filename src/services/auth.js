import { supabase } from '../lib/supabase';

export const authService = {
  // Register school
  registerSchool: async (schoolData) => {
    const { data, error } = await supabase.auth.signUp({
      email: schoolData.email,
      password: schoolData.password,
      options: {
        data: {
          full_name: schoolData.contactPerson,
          role: 'school',
          registration_data: {
            name: schoolData.name,
            address: schoolData.address,
            contact_person: schoolData.contactPerson,
            phone: schoolData.phone
          }
        }
      }
    });
    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (!userId) throw new Error("Registration failed to return user ID.");

    // Phase 1: Wait for authenticated session (if auto-confirm is enabled)
    let session = data.session;
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData?.session;
    }

    if (session && session.user.id === userId) {
      // Prevent duplicate insert
      const { data: existing } = await supabase.from('schools').select('id').eq('id', userId).single();
      if (!existing) {
        const { error: schoolError } = await supabase.from('schools').insert([{
          id: userId,
          name: schoolData.name,
          address: schoolData.address,
          contact_person: schoolData.contactPerson,
          phone: schoolData.phone,
          email: schoolData.email.toLowerCase(),
          status: 'pending'
        }]);
        if (schoolError) console.error("Immediate insert failed:", schoolError);
      }
    }

    return { id: userId, email: schoolData.email, status: 'pending', emailConfirmationRequired: !session };
  },

  // Login school
  loginSchool: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { success: false, code: "EMAIL_NOT_VERIFIED" };
      }
      throw new Error(error.message);
    }

    const userId = data.user.id;
    const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', userId).single();
    if (!profile || profile.role !== 'school') {
      await supabase.auth.signOut();
      return { success: false, code: "UNAUTHORIZED" };
    }

    // Check school existence
    const { data: school } = await supabase.from('schools').select('status').eq('id', userId).single();

    let currentStatus = school ? school.status : 'pending';

    if (!school) {
      const meta = data.user.user_metadata?.registration_data;
      if (meta) {
        const { error: insertError } = await supabase.from('schools').insert([{
          id: userId,
          name: meta.name,
          address: meta.address,
          contact_person: meta.contact_person,
          phone: meta.phone,
          email: data.user.email.toLowerCase(),
          status: 'pending'
        }]);

        if (insertError) {
          console.error("Auto-recovery failed:", insertError);
          return { success: false, code: "REGISTRATION_INCOMPLETE" };
        }
      } else {
        return { success: false, code: "REGISTRATION_INCOMPLETE" };
      }
    }

    if (currentStatus === 'rejected') {
      await supabase.auth.signOut();
      return { success: false, code: "ACCOUNT_REJECTED" };
    }

    if (currentStatus === 'pending') {
      await supabase.auth.signOut();
      return { success: false, code: "ACCOUNT_PENDING" };
    }

    return { success: true, data };
  },

  // Register Industry
  registerIndustry: async (indData) => {
    const { data, error } = await supabase.auth.signUp({
      email: indData.email,
      password: indData.password,
      options: {
        data: {
          full_name: indData.contactPerson,
          role: 'industry',
          registration_data: {
            company_name: indData.companyName,
            contact_person: indData.contactPerson,
            phone: indData.phone,
            gst_number: indData.gstNumber,
            address: indData.address,
            industry_type: indData.industryType,
            monthly_requirement_kg: parseFloat(indData.monthlyRequirementKg) || 0
          }
        }
      }
    });
    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (!userId) throw new Error("Registration failed to return user ID.");

    let session = data.session;
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData?.session;
    }

    if (session && session.user.id === userId) {
      const { data: existing } = await supabase.from('industries').select('id').eq('id', userId).single();
      if (!existing) {
        const { error: indError } = await supabase.from('industries').insert([{
          id: userId,
          company_name: indData.companyName,
          contact_person: indData.contactPerson,
          email: indData.email.toLowerCase(),
          phone: indData.phone,
          gst_number: indData.gstNumber,
          address: indData.address,
          industry_type: indData.industryType,
          monthly_requirement_kg: parseFloat(indData.monthlyRequirementKg) || 0,
          status: 'pending'
        }]);
        if (indError) console.error("Immediate insert failed:", indError);
      }
    }

    return { id: userId, email: indData.email, status: 'pending', emailConfirmationRequired: !session };
  },

  // Login Industry
  loginIndustry: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { success: false, code: "EMAIL_NOT_VERIFIED" };
      }
      throw new Error(error.message);
    }

    const userId = data.user.id;
    const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', userId).single();
    if (!profile || profile.role !== 'industry') {
      await supabase.auth.signOut();
      return { success: false, code: "UNAUTHORIZED" };
    }

    // Check industry existence
    const { data: industry } = await supabase.from('industries').select('status').eq('id', userId).single();

    let currentStatus = industry ? industry.status : 'pending';

    if (!industry) {
      const meta = data.user.user_metadata?.registration_data;
      if (meta) {
        const { error: insertError } = await supabase.from('industries').insert([{
          id: userId,
          company_name: meta.company_name,
          contact_person: meta.contact_person,
          email: data.user.email.toLowerCase(),
          phone: meta.phone,
          gst_number: meta.gst_number,
          address: meta.address,
          industry_type: meta.industry_type,
          monthly_requirement_kg: meta.monthly_requirement_kg,
          status: 'pending'
        }]);

        if (insertError) {
          console.error("Auto-recovery failed:", insertError);
          return { success: false, code: "REGISTRATION_INCOMPLETE" };
        }
      } else {
        return { success: false, code: "REGISTRATION_INCOMPLETE" };
      }
    }

    if (currentStatus === 'rejected') {
      await supabase.auth.signOut();
      return { success: false, code: "ACCOUNT_REJECTED" };
    }

    if (currentStatus === 'pending') {
      await supabase.auth.signOut();
      return { success: false, code: "ACCOUNT_PENDING" };
    }

    return { success: true, data };
  },

  // Login Admin
  loginAdmin: async (username, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error("Unauthorized. Not an admin.");
    }
    return { success: true, data };
  },

  // Complete OAuth Registration for users with missing profiles
  completeOAuthRegistration: async (role, data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No active session.");

    // Update profile role and full_name
    const { error: profileError } = await supabase.from('profiles').update({
      role: role,
      full_name: data.contactPerson || data.name
    }).eq('id', user.id);

    if (profileError) throw new Error(profileError.message);

    // Insert into specific role table
    if (role === 'school') {
      const { data: existing } = await supabase.from('schools').select('id').eq('id', user.id).single();
      if (!existing) {
        const { error: schoolError } = await supabase.from('schools').insert([{
          id: user.id,
          name: data.name,
          address: data.address,
          contact_person: data.contactPerson,
          phone: data.phone,
          email: user.email,
          status: 'pending'
        }]);
        if (schoolError) throw new Error("Unable to complete registration. Please try again in a few seconds.");
      }
    } else if (role === 'industry') {
      const { data: existing } = await supabase.from('industries').select('id').eq('id', user.id).single();
      if (!existing) {
        const { error: indError } = await supabase.from('industries').insert([{
          id: user.id,
          company_name: data.name,
          contact_person: data.contactPerson,
          email: user.email,
          phone: data.phone,
          gst_number: data.gstNumber,
          address: data.address,
          industry_type: 'Recycled Paper', // Default
          monthly_requirement_kg: 0,
          status: 'pending'
        }]);
        if (indError) throw new Error("Unable to complete registration. Please try again in a few seconds.");
      }
    }
  },

  // Logout
  logout: async () => {
    await supabase.auth.signOut();
  }
};
