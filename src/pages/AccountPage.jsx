import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiLock, FiLogOut,
  FiMail, FiPackage, FiPhone, FiShield, FiUser,
} from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation.js';
import {
  loginUser, logoutUser, registerUser, selectCurrentUser, selectRegisteredUser,
} from '../redux/authSlice.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  terms: false,
  newsletter: true,
};

const hashPassword = async (password) => {
  const data = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

function AccountPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const registeredUser = useSelector(selectRegisteredUser);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: form.password.length >= 8,
    letter: /[a-zа-я]/i.test(form.password),
    number: /\d/.test(form.password),
  }), [form.password]);

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setMessage('');
    setForm(initialForm);
  };

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(form.email.trim())) nextErrors.email = t('auth.errors.email');
    if (mode === 'register') {
      if (form.name.trim().length < 2) nextErrors.name = t('auth.errors.name');
      if (form.phone.replace(/\D/g, '').length < 7) nextErrors.phone = t('auth.errors.phone');
      if (!Object.values(passwordChecks).every(Boolean)) nextErrors.password = t('auth.errors.password');
      if (form.password !== form.confirmPassword) nextErrors.confirmPassword = t('auth.errors.passwordMatch');
      if (!form.terms) nextErrors.terms = t('auth.errors.terms');
    }
    if (mode === 'login' && !form.password) nextErrors.password = t('auth.errors.passwordRequired');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      if (mode === 'recover') {
        setMessage(t('auth.recoverySent'));
        return;
      }

      const credential = await hashPassword(form.password);
      if (mode === 'register') {
        dispatch(registerUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          credential,
          newsletter: form.newsletter,
        }));
        return;
      }

      const credentialsMatch = registeredUser
        && registeredUser.email === form.email.trim().toLowerCase()
        && registeredUser.credential === credential;
      if (!credentialsMatch) {
        setErrors({ form: t('auth.errors.credentials') });
        return;
      }
      dispatch(loginUser());
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUser) {
    return (
      <motion.section className="account-page shell" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="account-dashboard">
          <aside className="account-profile-card">
            <div className="account-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <span>{t('auth.welcome')}</span>
            <h1>{currentUser.name}</h1>
            <p><FiMail /> {currentUser.email}</p>
            <p><FiPhone /> {currentUser.phone}</p>
            <button type="button" className="button button--ghost account-logout" onClick={() => dispatch(logoutUser())}>
              <FiLogOut /> {t('auth.logout')}
            </button>
          </aside>
          <div className="account-content">
            <span className="eyebrow">{t('auth.personalAccount')}</span>
            <h2>{t('auth.accountTitle')}</h2>
            <p>{t('auth.accountSubtitle')}</p>
            <div className="account-shortcuts">
              <div><FiPackage /><span><strong>{t('auth.orders')}</strong><small>{t('auth.noOrders')}</small></span></div>
              <div><FiShield /><span><strong>{t('auth.security')}</strong><small>{t('auth.securityText')}</small></span></div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="account-page shell">
      <motion.div className="auth-layout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <div className="auth-aside">
          <div className="auth-aside__brand"><span>V</span> Velora</div>
          <div>
            <span className="eyebrow">{t('auth.memberSpace')}</span>
            <h1>{t('auth.asideTitle')}</h1>
            <p>{t('auth.asideText')}</p>
          </div>
          <ul>
            <li><FiCheck /> {t('auth.benefitOrders')}</li>
            <li><FiCheck /> {t('auth.benefitFavorites')}</li>
            <li><FiCheck /> {t('auth.benefitOffers')}</li>
          </ul>
        </div>

        <div className="auth-panel">
          {mode === 'recover' ? (
            <button type="button" className="auth-back" onClick={() => switchMode('login')}><FiArrowLeft /> {t('auth.backToLogin')}</button>
          ) : (
            <div className="auth-tabs" role="tablist">
              <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => switchMode('login')}>{t('auth.login')}</button>
              <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => switchMode('register')}>{t('auth.register')}</button>
            </div>
          )}

          <div className="auth-panel__heading">
            <h2>{t(`auth.${mode}Title`)}</h2>
            <p>{t(`auth.${mode}Subtitle`)}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <label className={errors.name ? 'has-error' : ''}>
                <span>{t('auth.name')}</span>
                <div className="auth-input"><FiUser /><input name="name" value={form.name} onChange={updateField} placeholder={t('auth.namePlaceholder')} autoComplete="name" /></div>
                {errors.name && <small>{errors.name}</small>}
              </label>
            )}

            <label className={errors.email ? 'has-error' : ''}>
              <span>{t('auth.email')}</span>
              <div className="auth-input"><FiMail /><input type="email" name="email" value={form.email} onChange={updateField} placeholder="name@example.com" autoComplete="email" inputMode="email" /></div>
              {errors.email && <small>{errors.email}</small>}
            </label>

            {mode === 'register' && (
              <label className={errors.phone ? 'has-error' : ''}>
                <span>{t('auth.phone')}</span>
                <div className="auth-input"><FiPhone /><input type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="+998 90 123 45 67" autoComplete="tel" inputMode="tel" /></div>
                {errors.phone && <small>{errors.phone}</small>}
              </label>
            )}

            {mode !== 'recover' && (
              <label className={errors.password ? 'has-error' : ''}>
                <span>{t('auth.password')}</span>
                <div className="auth-input"><FiLock /><input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={updateField} placeholder={t('auth.passwordPlaceholder')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={t('auth.togglePassword')}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
                {errors.password && <small>{errors.password}</small>}
              </label>
            )}

            {mode === 'register' && (
              <>
                <div className="password-checks">
                  <span className={passwordChecks.length ? 'is-valid' : ''}><FiCheck /> {t('auth.passwordLength')}</span>
                  <span className={passwordChecks.letter ? 'is-valid' : ''}><FiCheck /> {t('auth.passwordLetter')}</span>
                  <span className={passwordChecks.number ? 'is-valid' : ''}><FiCheck /> {t('auth.passwordNumber')}</span>
                </div>
                <label className={errors.confirmPassword ? 'has-error' : ''}>
                  <span>{t('auth.confirmPassword')}</span>
                  <div className="auth-input"><FiLock /><input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={updateField} placeholder={t('auth.repeatPassword')} autoComplete="new-password" /></div>
                  {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
                </label>
                <label className={`auth-checkbox ${errors.terms ? 'has-error' : ''}`}><input type="checkbox" name="terms" checked={form.terms} onChange={updateField} /><span>{t('auth.acceptTerms')}</span>{errors.terms && <small>{errors.terms}</small>}</label>
                <label className="auth-checkbox"><input type="checkbox" name="newsletter" checked={form.newsletter} onChange={updateField} /><span>{t('auth.newsletter')}</span></label>
              </>
            )}

            {mode === 'login' && <button type="button" className="auth-forgot" onClick={() => switchMode('recover')}>{t('auth.forgotPassword')}</button>}
            {errors.form && <div className="auth-message auth-message--error" role="alert">{errors.form}</div>}
            {message && <div className="auth-message auth-message--success" role="status"><FiCheck /> {message}</div>}
            <button type="submit" className="button button--primary auth-submit" disabled={submitting || Boolean(message)}>{submitting ? t('auth.processing') : t(`auth.${mode}Button`)}</button>
          </form>
          <p className="auth-privacy"><FiShield /> {t('auth.privacy')}</p>
        </div>
      </motion.div>
    </section>
  );
}

export default AccountPage;
