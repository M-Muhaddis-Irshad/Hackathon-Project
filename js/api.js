/**
 * API Module - Supabase CRUD operations
 */

const api = {
  // Profiles
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getProfilesByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, subscription_plan, created_at')
      .eq('role', role)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async updateProfile(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Patients
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPatient(id) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getPatientByUserId(userId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createPatient(patient) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async linkPatientToUser(patientId, userId) {
    return this.updatePatient(patientId, { user_id: userId });
  },

  // Appointments
  async getAppointments(filters = {}) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(id, name, contact, email),
        doctor:profiles!doctor_id(id, name, email)
      `)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (filters.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters.doctorId) query = query.eq('doctor_id', filters.doctorId);
    if (filters.date) query = query.eq('date', filters.date);
    if (filters.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createAppointment(apt) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([apt])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Prescriptions
  async getPrescriptions(patientId) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:profiles!doctor_id(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createPrescription(prescription) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescription])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Diagnosis logs
  async getDiagnosisLogs(patientId) {
    const { data, error } = await supabase
      .from('diagnosis_logs')
      .select(`
        *,
        doctor:profiles!doctor_id(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createDiagnosisLog(log) {
    const { data, error } = await supabase
      .from('diagnosis_logs')
      .insert([log])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Analytics
  async getAppointmentStats(doctorId = null) {
    let query = supabase.from('appointments').select('status, date');
    if (doctorId) query = query.eq('doctor_id', doctorId);
    const { data, error } = await query;
    if (error) throw error;
    
    const stats = { total: data.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    data.forEach(a => {
      if (stats[a.status] !== undefined) stats[a.status]++;
    });
    return stats;
  },

  async getPatientCount() {
    const { count, error } = await supabase.from('patients').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
};
