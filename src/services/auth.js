import { db } from './db';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../lib/features';

export const authService = {
  // Register school
  registerSchool: async (schoolData) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
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
    }

    const schools = db.getSchools();
    if (schools.some(s => s.email.toLowerCase() === schoolData.email.toLowerCase())) {
      throw new Error('Email is already registered.');
    }
    const newSchool = {
      id: 'sch_' + Math.random().toString(36).substr(2, 9),
      name: schoolData.name,
      address: schoolData.address,
      contactPerson: schoolData.contactPerson,
      email: schoolData.email.toLowerCase(),
      phone: schoolData.phone,
      password: schoolData.password,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    db.addSchool(newSchool);
    return newSchool;
  },

  // Login school
  loginSchool: async (email, password) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
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
    }

    const schools = db.getSchools();
    const school = schools.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
    if (!school) throw new Error('Invalid email or password.');
    if (school.status !== 'approved') throw new Error(`Your login is disabled. Current status: ${school.status}. Please contact support.`);

    const session = {
      user: { id: school.id, name: school.name, email: school.email, role: 'school' },
      token: 'sch_token_' + Math.random().toString(36).substr(2, 9)
    };
    db.setSession(session);
    return session;
  },

  // Register Industry
  registerIndustry: async (indData) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
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
    }

    const industries = db.getIndustries();
    if (industries.some(i => i.email.toLowerCase() === indData.email.toLowerCase())) {
      throw new Error('Email is already registered.');
    }
    const newIndustry = {
      id: 'ind_' + Math.random().toString(36).substr(2, 9),
      companyName: indData.companyName,
      contactPerson: indData.contactPerson,
      email: indData.email.toLowerCase(),
      password: indData.password,
      phone: indData.phone,
      gstNumber: indData.gstNumber,
      address: indData.address,
      industryType: indData.industryType,
      monthlyRequirementKg: parseFloat(indData.monthlyRequirementKg) || 0,
      preferredTypes: indData.preferredTypes || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    db.addIndustry(newIndustry);
    return newIndustry;
  },

  // Login Industry
  loginIndustry: async (email, password) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
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
    }

    const industries = db.getIndustries();
    const ind = industries.find(i => i.email.toLowerCase() === email.toLowerCase() && i.password === password);
    if (!ind) throw new Error('Invalid email or password.');
    if (ind.status !== 'approved') throw new Error(`Your login is disabled. Current status: ${ind.status}. Please contact support.`);

    const session = {
      user: { id: ind.id, name: ind.companyName, email: ind.email, role: 'industry' },
      token: 'ind_token_' + Math.random().toString(36).substr(2, 9)
    };
    db.setSession(session);
    return session;
  },

  // Login Admin
  loginAdmin: async (username, password) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      // Admin should use email as username in Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
      if (error) throw new Error(error.message);

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Unauthorized. Not an admin.");
      }
      return data;
    }

    if (username === 'admin' && password === 'admin123') {
      const session = {
        user: { id: 'admin', name: 'Administrator', email: 'admin@pulpchain.com', role: 'admin' },
        token: 'admin_token_' + Math.random().toString(36).substr(2, 9)
      };
      db.setSession(session);
      return session;
    } else {
      throw new Error('Invalid admin credentials.');
    }
  },

  // Get current user session (legacy synchronous access only)
  getCurrentUser: () => {
    const session = db.getSession();
    return session ? session.user : null;
  },

  // Logout
  logout: async () => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      await supabase.auth.signOut();
    } else {
      db.setSession(null);
    }
  }
};
