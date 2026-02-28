/**
 * Authentication Module
 * Handles login, signup, and session management
 */

const authForm = document.getElementById('authForm');
const authToggle = document.getElementById('authToggle');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const nameField = document.getElementById('nameField');
const roleField = document.getElementById('roleField');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

let isLoginMode = true;

// Toggle between login and signup
authToggle?.addEventListener('click', (e) => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  
  isLoginMode = btn.dataset.mode === 'login';
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  nameField.style.display = isLoginMode ? 'none' : 'block';
  roleField.style.display = isLoginMode ? 'none' : 'block';
  const patientFields = document.getElementById('patientFields');
  patientFields.style.display = (!isLoginMode && document.getElementById('role').value === 'patient') ? 'block' : 'none';
  submitBtn.querySelector('#btnText').textContent = isLoginMode ? 'Login' : 'Sign Up';
  hideMessages();
});

document.getElementById('role')?.addEventListener('change', () => {
  const role = document.getElementById('role').value;
  const patientFields = document.getElementById('patientFields');
  patientFields.style.display = (!isLoginMode && role === 'patient') ? 'block' : 'none';
});

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
}

function showSuccess(msg) {
  successMessage.textContent = msg;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

function hideMessages() {
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display = loading ? 'none' : 'inline';
  btnLoader.style.display = loading ? 'inline-block' : 'none';
}

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showError('Please fill in all required fields.');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);

  try {
    if (isLoginMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => redirectByRole(data.user), 500);
    } else {
      const name = document.getElementById('name').value.trim();
      const role = document.getElementById('role').value;
      const age = document.getElementById('age')?.value;
      const gender = document.getElementById('gender')?.value;
      const contact = document.getElementById('contact')?.value;
      if (!name) {
        showError('Please enter your name.');
        setLoading(false);
        return;
      }
      if (role === 'patient' && (!age || !contact)) {
        showError('Age and contact are required for patient registration.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, age, gender, contact }
        }
      });
      if (error) throw error;
      showSuccess('Account created! Please check your email to verify, or login if already verified.');
      if (data.user) {
        setTimeout(() => redirectByRole(data.user), 1500);
      }
    }
  } catch (err) {
    showError(err.message || 'An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
});

async function redirectByRole(user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  const role = profile?.role || user.user_metadata?.role || 'patient';
  window.location.href = `dashboard.html?role=${role}`;
}
