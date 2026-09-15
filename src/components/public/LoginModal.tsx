import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Shield,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  X,
  UserPlus,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { Student, MembershipPlan, AdminAccount } from '../../types';
import { FIXED_OWNER_EMAIL, DEFAULT_OWNER_PASSWORD } from '../../data/initialData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: 'owner' | 'admin' | 'student';
  onLoginSuccess: (
    role: 'owner' | 'admin' | 'student',
    studentData?: Student,
    adminData?: AdminAccount
  ) => void;
  students?: Student[];
  plans?: MembershipPlan[];
  admins?: AdminAccount[];
  ownerPassword?: string;
  onUpdateOwnerPassword?: (newPass: string) => void;
  onSignUpStudent?: (newStudent: Partial<Student>) => Student;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onLoginSuccess,
  students = [],
  plans = [],
  admins = [],
  ownerPassword = DEFAULT_OWNER_PASSWORD,
  onUpdateOwnerPassword,
  onSignUpStudent
}) => {
  const [loginType, setLoginType] = useState<'owner' | 'admin' | 'student'>(activeRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Reset via OTP State (Owner)
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [simulatedEmailNotification, setSimulatedEmailNotification] = useState<string | null>(null);

  // Student Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetExam: 'UPSC Civil Services',
    planId: plans[0]?.id || 'slot_fullday',
    shift: 'fullday',
    gender: 'male' as 'male' | 'female' | 'other',
    emergencyContact: '',
    aadhaarNumber: '',
    aadhaarDocUrl: '',
    photoUrl: ''
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Synchronize when modal opens or activeRole changes
  useEffect(() => {
    setLoginType(activeRole);
    setAuthMode('login');
    setIsResetMode(false);
    setResetStep('request');
    setErrorMsg('');
    setSuccessMsg('');
    setSimulatedEmailNotification(null);
    setEnteredOtp('');
    setNewPassword('');
    setConfirmNewPassword('');

    if (activeRole === 'owner') {
      setEmailOrPhone(FIXED_OWNER_EMAIL);
      setPassword('');
    } else if (activeRole === 'admin') {
      setEmailOrPhone('');
      setPassword('');
    } else {
      setEmailOrPhone('');
      setPassword('');
    }
  }, [activeRole, isOpen]);

  if (!isOpen) return null;

  // Handle Send OTP to Owner Email
  const handleSendOtp = () => {
    setErrorMsg('');
    // Generate a random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(60);
    setResetStep('verify');
    setSimulatedEmailNotification(code);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Invalid 6-digit OTP. Please check the code and try again.');
      return;
    }

    setResetStep('new_password');
    setErrorMsg('');
  };

  // Handle Set New Password for Owner
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (onUpdateOwnerPassword) {
      onUpdateOwnerPassword(newPassword);
    }

    setSuccessMsg('Owner password reset successfully! You can now log in.');
    setIsResetMode(false);
    setPassword(newPassword);
    setEmailOrPhone(FIXED_OWNER_EMAIL);
    setSimulatedEmailNotification(null);
  };

  // Handle Login Submissions
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (loginType === 'owner') {
      const cleanEmail = emailOrPhone.trim().toLowerCase();
      const cleanOwnerEmail = FIXED_OWNER_EMAIL.toLowerCase();

      // Check owner user ID
      const isOwnerIdValid =
        cleanEmail === cleanOwnerEmail ||
        cleanEmail.replace(/[^0-9]/g, '') === '6209332827';

      if (!isOwnerIdValid) {
        setErrorMsg(`Invalid Owner User ID. Only authorized owner (${FIXED_OWNER_EMAIL}) can access this portal.`);
        return;
      }

      // Check current owner password
      if (password === ownerPassword) {
        onLoginSuccess('owner');
      } else {
        setErrorMsg('Incorrect owner password. Click "Reset Password via OTP" below if you forgot your password.');
      }
    } else if (loginType === 'admin') {
      const cleanEmail = emailOrPhone.trim().toLowerCase();
      const matchedAdmin = admins.find(
        (a) => a.email.toLowerCase() === cleanEmail
      );

      if (!matchedAdmin) {
        setErrorMsg('No Admin account found with this email. Please ask the Library Owner to create your account in Admin Management.');
        return;
      }

      // Check if restricted
      if (matchedAdmin.status === 'restricted') {
        setErrorMsg('⚠️ Your Admin account has been restricted by the Library Owner. Please contact the owner.');
        return;
      }

      // Check password
      if (matchedAdmin.password === password) {
        onLoginSuccess('admin', undefined, matchedAdmin);
      } else {
        setErrorMsg('Incorrect Admin password. Please contact the owner if you need your password reset.');
      }
    } else {
      // Student Login
      const inputClean = emailOrPhone.trim().toLowerCase();
      const digitsClean = emailOrPhone.replace(/[^0-9]/g, '');

      const matchedStudent = students.find((s) => {
        const sPhoneDigits = s.phone.replace(/[^0-9]/g, '');
        return (
          (digitsClean && sPhoneDigits === digitsClean) ||
          s.studentCode.toLowerCase() === inputClean ||
          (s.email && s.email.toLowerCase() === inputClean)
        );
      });

      if (matchedStudent) {
        const expectedPass = matchedStudent.password || '123456';
        if (password === expectedPass) {
          onLoginSuccess('student', matchedStudent);
        } else {
          setErrorMsg('Incorrect password. Please enter the password assigned to your student account.');
        }
      } else {
        setErrorMsg('No student account found with this Phone/Code. Click "New Student Sign Up" to register.');
      }
    }
  };

  // Handle Student Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signupData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = signupData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const exists = students.some((s) => s.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (exists) {
      setErrorMsg('A student with this mobile number already exists! Please switch to Login.');
      return;
    }

    if (!signupData.password || signupData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === signupData.planId) || plans[0];

    if (onSignUpStudent) {
      const createdStudent = onSignUpStudent({
        name: signupData.name.trim(),
        phone: signupData.phone.trim(),
        email: signupData.email.trim() || `${cleanPhone}@studyzone.com`,
        password: signupData.password,
        targetExam: signupData.targetExam,
        gender: signupData.gender,
        emergencyContact: signupData.emergencyContact || signupData.phone,
        planId: selectedPlan?.id || 'slot_fullday',
        planName: selectedPlan?.title || 'Full Day Pass',
        shift: selectedPlan?.shift || 'fullday',
        aadhaarNumber: signupData.aadhaarNumber.trim() || '4589-XXXX-8890',
        aadhaarDocUrl:
          signupData.aadhaarDocUrl ||
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
        photoUrl:
          signupData.photoUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        totalPaid: 0,
        pendingFee: selectedPlan?.price || 1500,
        status: 'active'
      });

      onLoginSuccess('student', createdStudent);
    } else {
      setErrorMsg('Registration service unavailable.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative my-auto animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3-Way Portal Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 pr-10 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setIsResetMode(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              loginType === 'student'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setIsResetMode(false);
              setEmailOrPhone('');
              setPassword('');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              loginType === 'admin'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType('owner');
              setIsResetMode(false);
              setEmailOrPhone(FIXED_OWNER_EMAIL);
              setPassword('');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
              loginType === 'owner'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Owner Portal</span>
          </button>
        </div>

        {/* Student Auth Mode Switcher */}
        {loginType === 'student' && (
          <div className="px-6 pt-4">
            <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl flex text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>New Student Sign Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6 space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <div
              className={`w-11 h-11 rounded-2xl mx-auto flex items-center justify-center ${
                loginType === 'owner'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : loginType === 'admin'
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : authMode === 'signup'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}
            >
              {loginType === 'owner' ? (
                <Crown className="w-5 h-5" />
              ) : loginType === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : authMode === 'signup' ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {loginType === 'owner'
                ? isResetMode
                  ? 'Reset Owner Password'
                  : 'Owner Management Portal'
                : loginType === 'admin'
                ? 'Library Admin & Staff Login'
                : authMode === 'signup'
                ? 'Create Student Account'
                : 'Student Portal Login'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {loginType === 'owner'
                ? isResetMode
                  ? 'Verify OTP sent to your registered email to set a new password.'
                  : 'Exclusive access for library owner. Create admins, configure permissions & full library controls.'
                : loginType === 'admin'
                ? 'Sign in using the admin email and password provided by the Library Owner.'
                : authMode === 'signup'
                ? 'Register now to access seat bookings, digital ID card & payment receipts.'
                : 'Log in with your phone or student code to view your desk & pass.'}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIMULATED EMAIL INBOX NOTIFICATION ALERT */}
          {simulatedEmailNotification && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center space-x-1.5 font-black text-amber-800 dark:text-amber-300">
                <Mail className="w-4 h-4" />
                <span>Simulated Email Sent to {FIXED_OWNER_EMAIL}</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Your 6-Digit Password Reset OTP is:{' '}
                <strong className="text-sm font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 tracking-widest text-amber-900 dark:text-amber-200">
                  {simulatedEmailNotification}
                </strong>
              </p>
              <p className="text-[10px] text-amber-600/90 dark:text-amber-400/80 italic">
                (Valid for 10 minutes. Copy and paste this code in the OTP field below.)
              </p>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: OWNER PASSWORD RESET VIA OTP FLOW
          ========================================================================= */}
          {loginType === 'owner' && isResetMode && (
            <div className="space-y-4 text-xs">
              {resetStep === 'request' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Registered Owner Email ID:
                    </span>
                    <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-mono font-black text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{FIXED_OWNER_EMAIL}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Click below to generate and send a 6-digit verification OTP to this email address.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold shadow-md shadow-amber-600/20 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Verification OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setErrorMsg('');
                    }}
                    className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold cursor-pointer"
                  >
                    ← Back to Owner Login
                  </button>
                </div>
              )}

              {resetStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Enter 6-Digit Verification OTP *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 849201"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono font-bold text-center tracking-widest text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Didn't receive code?</span>
                    {otpTimer > 0 ? (
                      <span className="text-slate-400 font-bold">Resend in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold shadow-md shadow-amber-600/20 cursor-pointer"
                  >
                    Verify OTP & Set New Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setErrorMsg('');
                    }}
                    className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {resetStep === 'new_password' && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Save & Update Password
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: REGULAR LOGIN FORM (Owner, Admin, or Student)
          ========================================================================= */}
          {(!isResetMode && authMode === 'login') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {loginType === 'owner'
                    ? 'Owner Email ID (User ID)'
                    : loginType === 'admin'
                    ? 'Admin Email Address (User ID)'
                    : 'Mobile Number or Student Code'}
                </label>
                <div className="relative">
                  {loginType === 'student' ? (
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  ) : (
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  )}
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={
                      loginType === 'owner'
                        ? FIXED_OWNER_EMAIL
                        : loginType === 'admin'
                        ? 'e.g. admin@studyzone.com'
                        : 'e.g. 9811223344 or SZ-2026-001'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Password</label>
                  {loginType === 'owner' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setResetStep('request');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-extrabold cursor-pointer"
                    >
                      Reset Password via OTP?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Student Help Guide */}
              {loginType === 'student' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Login Help:</span>
                  </p>
                  <p>
                    Log in with your registered phone number or ID code. Default pass is <strong>123456</strong> unless changed.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-extrabold shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                    loginType === 'owner'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-600/20'
                      : loginType === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/20'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                  }`}
                >
                  <span>
                    {loginType === 'owner'
                      ? 'Login as Owner'
                      : loginType === 'admin'
                      ? 'Login as Admin'
                      : 'Login to Student Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              VIEW 3: STUDENT SIGNUP FORM
          ========================================================================= */}
          {loginType === 'student' && authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Min 4 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Exam / Goal</label>
                <input
                  type="text"
                  value={signupData.targetExam}
                  onChange={(e) => setSignupData({ ...signupData, targetExam: e.target.value })}
                  placeholder="e.g. UPSC, NEET, CA, JEE, Banking"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
