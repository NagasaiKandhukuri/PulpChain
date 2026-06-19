
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
          role: 'school'
        }
      }
    });
    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (!userId) throw new Error("Registration failed to return user ID.");

    // The postgres trigger handles the 'profiles' row creation automatically.
    // Now create the corresponding school profile.
    const { error: schoolError } = await supabase.from('schools').insert([{
      id: userId,
      name: schoolData.name,
      address: schoolData.address,
      contact_person: schoolData.contactPerson,
      phone: schoolData.phone,
      email: schoolData.email.toLowerCase(),
      status: 'pending'
    }]);

    if (schoolError) throw new Error(schoolError.message);
    return { id: userId, email: schoolData.email, status: 'pending' };
  },

  // Login school
  loginSchool: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', data.user.id).single();
    if (!profile || profile.role !== 'school') {
      await supabase.auth.signOut();
      throw new Error("Unauthorized access. This account is not a registered school.");
    }
    
    if (profile.status !== 'approved') {
      await supabase.auth.signOut();
      throw new Error("Your school account is awaiting administrator approval.");
    }
    return data;
  },

  // Register Industry
  registerIndustry: async (indData) => {
    const { data, error } = await supabase.auth.signUp({
      email: indData.email,
      password: indData.password,
      options: {
        data: {
          full_name: indData.contactPerson,
          role: 'industry'
        }
      }
    });
    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (!userId) throw new Error("Registration failed to return user ID.");

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

    if (indError) throw new Error(indError.message);
    return { id: userId, email: indData.email, status: 'pending' };
  },

  // Login Industry
  loginIndustry: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', data.user.id).single();
    if (!profile || profile.role !== 'industry') {
      await supabase.auth.signOut();
      throw new Error("Unauthorized access. This account is not a registered industry.");
    }
    
    if (profile.status !== 'approved') {
      await supabase.auth.signOut();
      throw new Error("Your industry account is awaiting administrator approval.");
    }
    return data;
  },

  // Login Admin
  loginAdmin: async (username, password) => {
    // Admin should use email as username in Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error("Unauthorized. Not an admin.");
    }
    return data;
  },


  // Logout
  logout: async () => {
    await supabase.auth.signOut();
  }
};
