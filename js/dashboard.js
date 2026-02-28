/**
 * Main Dashboard - Role-based routing and content
 */

let currentUser = null;
let userProfile = null;
let currentView = '';

const NAV_CONFIG = {
  admin: [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'doctors', label: 'Manage Doctors', icon: '👨‍⚕️' },
    { id: 'receptionists', label: 'Manage Receptionists', icon: '👩‍💼' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'subscription', label: 'Subscription Plans', icon: '💳' }
  ],
  doctor: [
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📋' },
    { id: 'analytics', label: 'My Stats', icon: '📊' }
  ],
  receptionist: [
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'schedule', label: 'Daily Schedule', icon: '📋' }
  ],
  patient: [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'appointments', label: 'My Appointments', icon: '📅' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'history', label: 'Medical History', icon: '📜' }
  ]
};

async function init() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  const urlParams = new URLSearchParams(window.location.search);
  let role = urlParams.get('role');

  try {
    userProfile = await api.getProfile(user.id);
    role = userProfile.role;
  } catch (e) {
    role = role || user.user_metadata?.role || 'patient';
  }

  document.getElementById('userName').textContent = userProfile?.name || user.email;
  renderNav(role);
  navigateTo(NAV_CONFIG[role]?.[0]?.id || 'profile', role);

  document.getElementById('sidebarNav').addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (item?.dataset?.view) {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      navigateTo(item.dataset.view, role);
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
}

function renderNav(role) {
  const items = NAV_CONFIG[role] || NAV_CONFIG.patient;
  document.getElementById('sidebarNav').innerHTML = items.map((item, i) => `
    <button class="nav-item ${i === 0 ? 'active' : ''}" data-view="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      ${item.label}
    </button>
  `).join('');
}

async function navigateTo(view, role) {
  currentView = view;
  const content = document.getElementById('contentArea');
  content.innerHTML = '<div class="empty-state"><div class="loader" style="margin: 0 auto;"></div><p>Loading...</p></div>';

  try {
    let html = '';
    switch (view) {
      case 'analytics': html = await renderAnalytics(role); break;
      case 'doctors': html = await renderDoctors(); break;
      case 'receptionists': html = await renderReceptionists(); break;
      case 'patients': html = await renderPatients(role); break;
      case 'appointments': html = await renderAppointments(role); break;
      case 'schedule': html = await renderSchedule(); break;
      case 'profile': html = await renderPatientProfile(); break;
      case 'prescriptions': html = await renderPatientPrescriptions(); break;
      case 'history': html = await renderMedicalHistory(); break;
      case 'subscription': html = renderSubscription(); break;
      default: html = '<p>View not found.</p>';
    }
    content.innerHTML = html;
    attachViewListeners(view, role);
  } catch (err) {
    content.innerHTML = `<div class="error-message">${err.message}</div>`;
  }
}

// ========== Analytics ==========
async function renderAnalytics(role) {
  let stats = {};
  if (role === 'admin') {
    const [aptStats, patientCount] = await Promise.all([
      api.getAppointmentStats(),
      api.getPatientCount()
    ]);
    stats = { ...aptStats, patients: patientCount };
  } else {
    stats = await api.getAppointmentStats(currentUser.id);
  }

  return `
    <div class="page-header">
      <h1>${role === 'admin' ? 'System Analytics' : 'My Statistics'}</h1>
      <p>Overview of clinic performance</p>
    </div>
    <div class="stats-grid">
      ${role === 'admin' ? `<div class="stat-card"><h3>${stats.patients || 0}</h3><p>Total Patients</p></div>` : ''}
      <div class="stat-card"><h3>${stats.total || 0}</h3><p>Total Appointments</p></div>
      <div class="stat-card"><h3>${stats.pending || 0}</h3><p>Pending</p></div>
      <div class="stat-card"><h3>${stats.confirmed || 0}</h3><p>Confirmed</p></div>
      <div class="stat-card"><h3>${stats.completed || 0}</h3><p>Completed</p></div>
    </div>
  `;
}

// ========== Doctors / Receptionists ==========
async function renderDoctors() {
  const doctors = await api.getProfilesByRole('doctor');
  return `
    <div class="page-header">
      <h1>Manage Doctors</h1>
      <p>View and manage doctor accounts</p>
    </div>
    <div class="card">
      <div class="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Joined</th></tr></thead>
          <tbody>
            ${doctors.length ? doctors.map(d => `
              <tr><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.email)}</td>
              <td>${d.subscription_plan || 'basic'}</td><td>${formatDate(d.created_at)}</td></tr>
            `).join('') : '<tr><td colspan="4" class="empty-state">No doctors yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderReceptionists() {
  const receptionists = await api.getProfilesByRole('receptionist');
  return `
    <div class="page-header">
      <h1>Manage Receptionists</h1>
      <p>View and manage receptionist accounts</p>
    </div>
    <div class="card">
      <div class="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
          <tbody>
            ${receptionists.length ? receptionists.map(r => `
              <tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.email)}</td><td>${formatDate(r.created_at)}</td></tr>
            `).join('') : '<tr><td colspan="3" class="empty-state">No receptionists yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== Patients ==========
async function renderPatients(role) {
  const patients = await api.getPatients();
  const doctors = role !== 'receptionist' ? await api.getProfilesByRole('doctor') : [];
  
  return `
    <div class="page-header">
      <h1>Patients</h1>
      <p>Manage patient records</p>
    </div>
    ${['admin', 'receptionist'].includes(role) ? `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Add Patient</h3>
      </div>
      <form id="addPatientForm">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input name="name" required></div>
          <div class="form-group"><label>Age</label><input type="number" name="age" required></div>
          <div class="form-group"><label>Gender</label>
            <select name="gender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
          </div>
          <div class="form-group"><label>Contact</label><input name="contact" required></div>
          <div class="form-group"><label>Email</label><input type="email" name="email"></div>
        </div>
        <button type="submit" class="btn btn-primary">Add Patient</button>
      </form>
    </div>
    ` : ''}
    <div class="card">
      <div class="card-header"><h3 class="card-title">All Patients</h3></div>
      <div class="table-container">
        <table>
          <thead><tr><th>Name</th><th>Age</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>
            ${patients.length ? patients.map(p => `
              <tr>
                <td>${escapeHtml(p.name)}</td><td>${p.age}</td><td>${escapeHtml(p.contact)}</td>
                <td>
                  <button class="btn btn-sm btn-primary view-patient" data-id="${p.id}">View</button>
                  ${['admin', 'receptionist'].includes(role) ? `<button class="btn btn-sm btn-secondary edit-patient" data-id="${p.id}">Edit</button>` : ''}
                  ${role === 'doctor' ? `<button class="btn btn-sm btn-primary add-diagnosis" data-id="${p.id}">Diagnose</button>` : ''}
                </td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="empty-state">No patients yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <div id="patientModal" class="modal-overlay" style="display: none;"></div>
  `;
}

// ========== Appointments ==========
async function renderAppointments(role) {
  let appointments = [];
  const filters = {};
  if (role === 'doctor') filters.doctorId = currentUser.id;
  if (role === 'patient') {
    const patient = await api.getPatientByUserId(currentUser.id);
    if (patient) filters.patientId = patient.id;
    else return `<div class="card"><p>No patient record linked. Please contact reception.</p></div>`;
  }
  appointments = await api.getAppointments(filters);
  const patients = await api.getPatients();
  const doctors = await api.getProfilesByRole('doctor');

  return `
    <div class="page-header">
      <h1>${role === 'patient' ? 'My Appointments' : 'Appointments'}</h1>
      <p>Manage appointments</p>
    </div>
    ${['admin', 'receptionist', 'patient'].includes(role) ? `
    <div class="card">
      <div class="card-header"><h3 class="card-title">Book Appointment</h3></div>
      <form id="bookAppointmentForm">
        <div class="form-row">
          ${role !== 'patient' ? `
          <div class="form-group">
            <label>Patient</label>
            <select name="patientId" required>
              ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          ` : ''}
          <div class="form-group">
            <label>Doctor</label>
            <select name="doctorId" required>${doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Date</label><input type="date" name="date" required></div>
          <div class="form-group"><label>Time</label><input type="time" name="time" required></div>
        </div>
        <button type="submit" class="btn btn-primary">Book</button>
      </form>
    </div>
    ` : ''}
    <div class="card">
      <div class="card-header"><h3 class="card-title">Appointments</h3></div>
      <div class="table-container">
        <table>
          <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${appointments.length ? appointments.map(a => `
              <tr>
                <td>${a.patient?.name || '-'}</td>
                <td>${a.doctor?.name || '-'}</td>
                <td>${formatDate(a.date)}</td>
                <td>${formatTime(a.time)}</td>
                <td><span class="badge badge-${a.status}">${a.status}</span></td>
                <td>
                  ${['admin', 'receptionist'].includes(role) ? `
                    <select class="status-select" data-id="${a.id}">
                      <option value="pending" ${a.status==='pending'?'selected':''}>Pending</option>
                      <option value="confirmed" ${a.status==='confirmed'?'selected':''}>Confirmed</option>
                      <option value="completed" ${a.status==='completed'?'selected':''}>Completed</option>
                      <option value="cancelled" ${a.status==='cancelled'?'selected':''}>Cancelled</option>
                    </select>
                  ` : ''}
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="empty-state">No appointments</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== Schedule ==========
async function renderSchedule() {
  const today = new Date().toISOString().split('T')[0];
  const appointments = await api.getAppointments({ doctorId: currentUser.id, date: today });
  return `
    <div class="page-header">
      <h1>My Schedule</h1>
      <p>Today's appointments - ${formatDate(today)}</p>
    </div>
    <div class="card">
      <div class="table-container">
        <table>
          <thead><tr><th>Time</th><th>Patient</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            ${appointments.length ? appointments.map(a => `
              <tr><td>${formatTime(a.time)}</td><td>${a.patient?.name}</td><td>${a.patient?.contact}</td>
              <td><span class="badge badge-${a.status}">${a.status}</span></td></tr>
            `).join('') : '<tr><td colspan="4" class="empty-state">No appointments today</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== Patient Profile ==========
async function renderPatientProfile() {
  let patient = await api.getPatientByUserId(currentUser.id);
  if (!patient && userProfile?.role === 'patient') {
    const meta = currentUser.user_metadata || {};
    if (meta.age && meta.contact) {
      try {
        patient = await api.createPatient({
          user_id: currentUser.id,
          name: meta.name || userProfile?.name || currentUser.email,
          age: parseInt(meta.age) || 0,
          gender: meta.gender || 'other',
          contact: meta.contact || '',
          email: currentUser.email,
          created_by: currentUser.id
        });
      } catch (e) { /* ignore */ }
    }
  }
  if (!patient) {
    return `<div class="card"><p>No patient record found. Please contact the reception to register, or complete your profile during signup.</p></div>`;
  }
  return `
    <div class="page-header"><h1>My Profile</h1><p>Your medical profile</p></div>
    <div class="card">
      <div class="form-row">
        <div class="form-group"><label>Name</label><input value="${escapeHtml(patient.name)}" readonly></div>
        <div class="form-group"><label>Age</label><input value="${patient.age}" readonly></div>
        <div class="form-group"><label>Gender</label><input value="${patient.gender}" readonly></div>
        <div class="form-group"><label>Contact</label><input value="${escapeHtml(patient.contact)}" readonly></div>
        <div class="form-group"><label>Email</label><input value="${escapeHtml(patient.email || '-')}" readonly></div>
      </div>
    </div>
  `;
}

// ========== Patient Prescriptions ==========
async function renderPatientPrescriptions() {
  const patient = await api.getPatientByUserId(currentUser.id);
  if (!patient) return `<div class="card"><p>No patient record found.</p></div>`;
  const prescriptions = await api.getPrescriptions(patient.id);
  
  return `
    <div class="page-header"><h1>My Prescriptions</h1><p>Download your prescriptions</p></div>
    <div class="card">
      ${prescriptions.length ? prescriptions.map(p => {
        const meds = Array.isArray(p.medicines) ? p.medicines : JSON.parse(p.medicines || '[]');
        return `
          <div class="medicine-item" style="margin-bottom: 16px;">
            <div>
              <strong>${formatDateTime(p.created_at)}</strong> - Dr. ${p.doctor?.name || 'N/A'}<br>
              <small>${meds.map(m => m.name || m.medicine).join(', ')}</small>
            </div>
            <button class="btn btn-sm btn-primary download-rx" data-id="${p.id}">Download PDF</button>
          </div>
        `;
      }).join('') : '<div class="empty-state">No prescriptions yet</div>'}
    </div>
  `;
}

// ========== Medical History ==========
async function renderMedicalHistory() {
  const patient = await api.getPatientByUserId(currentUser.id);
  if (!patient) return `<div class="card"><p>No patient record found.</p></div>`;
  const [appointments, prescriptions, diagnosisLogs] = await Promise.all([
    api.getAppointments({ patientId: patient.id }),
    api.getPrescriptions(patient.id),
    api.getDiagnosisLogs(patient.id)
  ]);

  const timeline = [
    ...appointments.map(a => ({ type: 'appointment', ...a })),
    ...prescriptions.map(p => ({ type: 'prescription', ...p })),
    ...diagnosisLogs.map(d => ({ type: 'diagnosis', ...d }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return `
    <div class="page-header"><h1>Medical History</h1><p>Your complete medical timeline</p></div>
    <div class="card">
      <div class="timeline">
        ${timeline.length ? timeline.map(t => {
          if (t.type === 'appointment') return `
            <div class="timeline-item">
              <small>${formatDateTime(t.date + 'T' + t.time)}</small>
              <h4>Appointment - ${t.doctor?.name || 'Doctor'}</h4>
              <p>Status: ${t.status}</p>
            </div>
          `;
          if (t.type === 'prescription') return `
            <div class="timeline-item">
              <small>${formatDateTime(t.created_at)}</small>
              <h4>Prescription - Dr. ${t.doctor?.name || 'N/A'}</h4>
              <p>${(Array.isArray(t.medicines)?t.medicines:[]).map(m=>m.name||m.medicine).join(', ')}</p>
            </div>
          `;
          return `
            <div class="timeline-item">
              <small>${formatDateTime(t.created_at)}</small>
              <h4>Diagnosis - Dr. ${t.doctor?.name || 'N/A'}</h4>
              <p>${escapeHtml(t.symptoms || '')} ${t.diagnosis ? '- ' + t.diagnosis : ''}</p>
            </div>
          `;
        }).join('') : '<div class="empty-state">No history yet</div>'}
      </div>
    </div>
  `;
}

// ========== Subscription ==========
function renderSubscription() {
  return `
    <div class="page-header"><h1>Subscription Plans</h1><p>Manage clinic subscription (simulation)</p></div>
    <div class="stats-grid">
      <div class="stat-card"><h3>Basic</h3><p>$29/mo - 100 patients</p></div>
      <div class="stat-card"><h3>Pro</h3><p>$79/mo - 500 patients</p></div>
      <div class="stat-card"><h3>Enterprise</h3><p>$199/mo - Unlimited</p></div>
    </div>
  `;
}

// ========== Event Listeners ==========
function attachViewListeners(view, role) {
  if (view === 'patients') {
    const form = document.getElementById('addPatientForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await api.createPatient({
          name: fd.get('name'),
          age: parseInt(fd.get('age')),
          gender: fd.get('gender'),
          contact: fd.get('contact'),
          email: fd.get('email') || null,
          created_by: currentUser.id
        });
        showToast('Patient added!');
        navigateTo('patients', role);
      } catch (err) { showToast(err.message, 'error'); }
    });
    document.querySelectorAll('.view-patient').forEach(btn => btn.addEventListener('click', () => showPatientModal(btn.dataset.id, role)));
    document.querySelectorAll('.edit-patient').forEach(btn => btn.addEventListener('click', () => showPatientModal(btn.dataset.id, role, true)));
    document.querySelectorAll('.add-diagnosis').forEach(btn => btn.addEventListener('click', () => showDiagnosisModal(btn.dataset.id, role)));
  }

  if (view === 'appointments') {
    const form = document.getElementById('bookAppointmentForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      let patientId = fd.get('patientId');
      if (role === 'patient') {
        const patient = await api.getPatientByUserId(currentUser.id);
        patientId = patient?.id;
      }
      if (!patientId) { showToast('No patient record', 'error'); return; }
      try {
        await api.createAppointment({
          patient_id: patientId,
          doctor_id: fd.get('doctorId'),
          date: fd.get('date'),
          time: fd.get('time'),
          status: 'pending',
          created_by: currentUser.id
        });
        showToast('Appointment booked!');
        navigateTo('appointments', role);
      } catch (err) { showToast(err.message, 'error'); }
    });
    document.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', async () => {
      try {
        await api.updateAppointment(sel.dataset.id, { status: sel.value });
        showToast('Status updated');
        navigateTo('appointments', role);
      } catch (err) { showToast(err.message, 'error'); }
    }));
  }

  if (view === 'prescriptions') {
    document.querySelectorAll('.download-rx').forEach(btn => btn.addEventListener('click', async () => {
      const patient = await api.getPatientByUserId(currentUser.id);
      const prescriptions = await api.getPrescriptions(patient.id);
      const p = prescriptions.find(x => x.id === btn.dataset.id);
      if (p) downloadPrescriptionPDF(p, patient, p.doctor);
    }));
  }
}

async function showPatientModal(patientId, role, edit = false) {
  const patient = await api.getPatient(patientId);
  const modal = document.getElementById('patientModal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${edit ? 'Edit' : 'View'} Patient</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="patientModalForm">
          <div class="form-group"><label>Name</label><input name="name" value="${escapeHtml(patient.name)}" ${!edit?'readonly':''}></div>
          <div class="form-group"><label>Age</label><input type="number" name="age" value="${patient.age}" ${!edit?'readonly':''}></div>
          <div class="form-group"><label>Gender</label>
            ${edit ? `<select name="gender"><option value="male" ${patient.gender==='male'?'selected':''}>Male</option><option value="female" ${patient.gender==='female'?'selected':''}>Female</option><option value="other" ${patient.gender==='other'?'selected':''}>Other</option></select>` : `<input value="${patient.gender}" readonly>`}
          </div>
          <div class="form-group"><label>Contact</label><input name="contact" value="${escapeHtml(patient.contact)}" ${!edit?'readonly':''}></div>
          <div class="form-group"><label>Email</label><input name="email" value="${escapeHtml(patient.email||'')}" ${!edit?'readonly':''}></div>
          ${role === 'doctor' ? `
            <hr>
            <h4>Add Diagnosis / Prescription</h4>
            <div class="form-group"><label>Symptoms</label><textarea name="symptoms" placeholder="Patient symptoms"></textarea></div>
            <div class="form-group"><label>Diagnosis</label><textarea name="diagnosis" placeholder="Diagnosis notes"></textarea></div>
            <div class="form-group">
              <label>Medicines</label>
              <div id="medicinesList"></div>
              <div class="form-row" style="margin-top:8px">
                <input type="text" id="medName" placeholder="Medicine name" style="flex:1">
                <input type="text" id="medDosage" placeholder="Dosage (e.g. 500mg)">
                <input type="text" id="medFreq" placeholder="Frequency (e.g. 2x daily)">
                <button type="button" class="btn btn-sm btn-primary" id="addMedicineBtn">Add</button>
              </div>
            </div>
            <div class="form-group"><label>Instructions</label><textarea name="instructions" placeholder="Additional instructions"></textarea></div>
            <button type="button" class="btn btn-primary" id="saveDiagnosisBtn">Save Diagnosis & Prescription</button>
          ` : ''}
        </form>
      </div>
      <div class="modal-footer">
        ${edit ? `<button class="btn btn-primary" id="savePatientBtn">Save</button>` : ''}
        <button class="btn btn-secondary modal-close-btn">Close</button>
      </div>
    </div>
  `;
  modal.querySelector('.modal-close').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('.modal-close-btn').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  
    if (edit) {
    modal.querySelector('#savePatientBtn').onclick = async () => {
      const fd = new FormData(modal.querySelector('#patientModalForm'));
      await api.updatePatient(patientId, { name: fd.get('name'), age: fd.get('age'), gender: fd.get('gender'), contact: fd.get('contact'), email: fd.get('email') });
      showToast('Patient updated');
      modal.style.display = 'none';
      navigateTo('patients', role);
    };
  }
  if (role === 'doctor') {
    const medicines = [];
    modal.querySelector('#addMedicineBtn')?.addEventListener('click', () => {
      const name = modal.querySelector('#medName').value.trim();
      const dosage = modal.querySelector('#medDosage').value.trim();
      const freq = modal.querySelector('#medFreq').value.trim();
      if (!name) return;
      medicines.push({ name, dosage, frequency: freq });
      modal.querySelector('#medName').value = modal.querySelector('#medDosage').value = modal.querySelector('#medFreq').value = '';
      renderMedicinesList();
    });
    function renderMedicinesList() {
      const list = modal.querySelector('#medicinesList');
      list.innerHTML = medicines.map((m, i) => `<div class="medicine-item"><span>${escapeHtml(m.name)} - ${escapeHtml(m.dosage)} ${escapeHtml(m.frequency)}</span><button type="button" class="btn btn-sm btn-danger" data-i="${i}">Remove</button></div>`).join('');
      list.querySelectorAll('[data-i]').forEach(btn => btn.onclick = () => { medicines.splice(+btn.dataset.i, 1); renderMedicinesList(); });
    }
    modal.querySelector('#saveDiagnosisBtn').onclick = async () => {
      const fd = new FormData(modal.querySelector('#patientModalForm'));
      await api.createDiagnosisLog({ patient_id: patientId, doctor_id: currentUser.id, symptoms: fd.get('symptoms'), diagnosis: fd.get('diagnosis') });
      await api.createPrescription({ patient_id: patientId, doctor_id: currentUser.id, medicines, instructions: fd.get('instructions') });
      showToast('Diagnosis and prescription saved');
      modal.style.display = 'none';
      navigateTo('patients', role);
    };
  }
}

async function showDiagnosisModal(patientId, role) {
  showPatientModal(patientId, role, false);
  const modal = document.getElementById('patientModal');
  if (modal.querySelector('#saveDiagnosisBtn')) {
    modal.querySelector('#saveDiagnosisBtn').style.display = 'block';
  }
}

// Run on load
document.addEventListener('DOMContentLoaded', init);
