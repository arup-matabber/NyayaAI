import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ScaleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v18" />
    <path d="M3 7h18" />
    <path d="M6 7l-3 7s1 3 3 3 3-3 3-3-3-7" />
    <path d="M18 7l-3 7s1 3 3 3 3-3 3-3-3-7" />
    <path d="M9 21h6" />
  </svg>
);

const StudentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const BriefcaseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const AuthPage = ({ initialMode = 'login', onAuthSuccess }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(initialMode); // 'login', 'signup', or 'roleSelection'
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    barId: '',
    enrollmentId: '',
    licenseNumber: '',
  });

  const roles = [
    {
      id: 'lawyer',
      title: 'Lawyer',
      description: 'Access high-fidelity case law analysis, predictive drafting, and sophisticated litigation management.',
      icon: <ScaleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      color: 'from-teal to-teal-light',
    },
    {
      id: 'student',
      title: 'Law Student',
      description: 'Master the curriculum with interactive citations, foundational research tools, and AI study partners.',
      icon: <StudentIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      color: 'from-gold to-gold-light',
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Empowering paralegals, notaries, and legal clerks with automated compliance and document auditing.',
      icon: <BriefcaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-ink" />,
      color: 'from-cream-dark to-cream-mid',
    },
  ];

  const getRoleInfo = () => {
    const roleMap = {
      lawyer: {
        title: 'Lawyer',
        icon: <ScaleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
        colors: 'from-teal to-teal-light',
      },
      student: {
        title: 'Law Student',
        icon: <StudentIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
        colors: 'from-gold to-gold-light',
      },
      professional: {
        title: 'Professional',
        icon: <BriefcaseIcon className="w-8 h-8 sm:w-10 sm:h-10 text-ink" />,
        colors: 'from-cream-dark to-cream-mid',
      },
    };
    return roleMap[selectedRole] || roleMap['lawyer'];
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value,
    }));
    setLoginError('');
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      // Mocking the backend login delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (loginData.email && loginData.password) {
        // Retrieve credentials from mock database if they exist
        const mockDbStr = localStorage.getItem("nyaya_mock_db");
        const mockDb = mockDbStr ? JSON.parse(mockDbStr) : {};
        
        let fakeUser;
        const searchEmail = loginData.email.toLowerCase();
        const foundKey = Object.keys(mockDb).find(k => k.toLowerCase() === searchEmail);
        
        if (foundKey) {
          fakeUser = mockDb[foundKey];
          // Allow the dropdown 'selectedRole' to override the signup role for mock testing
          fakeUser.role = selectedRole || fakeUser.role || 'lawyer';
        } else {
          // generic fallback if name doesn't exist
          let fakeRole = selectedRole || 'lawyer';
          let defaultName = fakeRole === 'student' ? 'Student' : 'Advocate';
          fakeUser = { name: defaultName, role: fakeRole };
        }
        
        // Set Active User
        localStorage.setItem("nyaya_user", JSON.stringify(fakeUser));
        
        if (onAuthSuccess) {
          onAuthSuccess('fake-jwt-token', fakeUser.role);
        } else {
          // Default behavior: navigate to dashboard
          navigate('/dashboard');
        }
      } else {
        setLoginError('Please enter both email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setAuthMode('signup');
    // Clear previous signup data
    setSignupData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      barId: '',
      enrollmentId: '',
      licenseNumber: '',
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Mocking the backend signup delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful signup
      const fakeUser = { name: signupData.fullName || 'User', role: selectedRole };
      
      // Store user safely behind email key in our mock DB map
      const mockDbStr = localStorage.getItem("nyaya_mock_db");
      const mockDb = mockDbStr ? JSON.parse(mockDbStr) : {};
      mockDb[signupData.email] = fakeUser;
      localStorage.setItem("nyaya_mock_db", JSON.stringify(mockDb));

      // Set active user
      localStorage.setItem("nyaya_user", JSON.stringify(fakeUser));

      if (onAuthSuccess) {
        onAuthSuccess('fake-jwt-token', selectedRole);
      } else {
        // Default behavior: navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setAuthMode('roleSelection');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/70 backdrop-blur-md border-b border-color-border">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <ScaleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-teal" />
            <span className="text-xl sm:text-2xl font-headline tracking-tight text-ink">NyayaAI</span>
          </div>
          <div className="hidden sm:flex gap-6 sm:gap-8">
            <a href="#" className="text-ink-muted hover:text-teal transition-colors text-sm font-dm-sans">Solutions</a>
            <a href="#" className="text-ink-muted hover:text-teal transition-colors text-sm font-dm-sans">Methodology</a>
          </div>
        </div>
      </header>

      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-teal rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-gold rounded-full blur-[80px] sm:blur-[150px]"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-8 sm:pt-12 pb-20 px-4 sm:px-6 flex flex-col items-center justify-center relative">
        {/* ROLE SELECTION SCREEN */}
        {authMode === 'roleSelection' && (
          <div className="w-full max-w-5xl animate-fade-in">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-12 gap-3">
              <div className="h-1.5 w-12 sm:w-16 bg-teal rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-cream-dark rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-cream-dark rounded-full"></div>
            </div>

            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline tracking-tight mb-4 sm:mb-6">Define your perspective.</h1>
              <p className="text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-dm-sans">
                Select your professional domain to tailor the NyayaAI research engine to your specific jurisdictional needs.
              </p>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="group relative flex flex-col items-start p-6 sm:p-8 rounded-xl bg-white ghost-border transition-all duration-300 hover:bg-cream-dark hover:shadow-lg text-left focus:outline-none focus:ring-2 focus:ring-teal/50 h-full"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mb-6 sm:mb-8 shadow-lg text-xl sm:text-3xl`}>
                    {role.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-headline mb-3">{role.title}</h3>
                  <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-6 flex-grow font-dm-sans">{role.description}</p>
                  <div className="mt-auto flex items-center text-teal font-dm-sans font-semibold text-sm">
                    Continue
                    <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-ink-muted text-sm font-dm-sans mb-3">Already have an account?</p>
              <button
                onClick={() => setAuthMode('login')}
                className="text-teal hover:text-teal-light font-dm-sans font-semibold text-base transition-colors"
              >
                Login instead
              </button>
            </div>
          </div>
        )}

        {/* LOGIN SCREEN */}
        {authMode === 'login' && (
          <div className="w-full max-w-md animate-fade-in">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-12 gap-3">
              <div className="h-1.5 w-12 sm:w-16 bg-teal rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-cream-dark rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-cream-dark rounded-full"></div>
            </div>

            {/* Icon & Title */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal to-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <ScaleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-headline mb-2">Welcome Back</h1>
              <p className="text-ink-muted text-sm sm:text-base font-dm-sans">Log in to your account</p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 ghost-border shadow-lg animate-slide-down">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Error Message */}
                {loginError && (
                  <div className="p-4 bg-cream-dark border border-color-border-strong rounded-lg flex flex-col gap-2">
                    <p className="text-ink text-sm font-dm-sans font-semibold">{loginError}</p>
                    <button
                      type="button"
                      onClick={() => setAuthMode('roleSelection')}
                      className="text-teal hover:text-teal-light text-sm font-dm-sans font-semibold hover:underline text-left w-fit transition-all"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                )}

                {/* Login Role */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Login As</label>
                  <select
                    name="role"
                    value={selectedRole || 'lawyer'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong cursor-pointer"
                  >
                    <option value="lawyer">Lawyer</option>
                    <option value="student">Law Student</option>
                    <option value="professional">Legal Professional</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <a href="#" className="text-teal hover:text-teal-light text-xs sm:text-sm font-dm-sans font-semibold transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-accent text-white px-6 py-3 sm:py-4 rounded-lg font-headline text-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-6 border-t border-color-border">
                  <p className="text-ink-muted text-sm font-dm-sans mb-2">Don't have an account yet?</p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('roleSelection')}
                    className="text-teal hover:text-teal-light font-dm-sans font-bold text-base transition-colors"
                  >
                    Sign up instead
                  </button>
                </div>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 sm:p-6 bg-white/50 rounded-xl ghost-border backdrop-blur-sm">
              <p className="text-ink-muted text-xs sm:text-sm font-dm-sans leading-relaxed">
                <span className="font-semibold text-ink">Secure Login:</span> All data is encrypted and processed locally. Your information never leaves your device.
              </p>
            </div>
          </div>
        )}

        {/* SIGNUP SCREEN */}
        {authMode === 'signup' && (
          <div className="w-full max-w-2xl animate-fade-in">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-12 gap-3">
              <div className="h-1.5 w-12 sm:w-16 bg-teal rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-teal rounded-full"></div>
              <div className="h-1.5 w-12 sm:w-16 bg-cream-dark rounded-full"></div>
            </div>

            {/* Role Icon & Title */}
            <div className="text-center mb-8 sm:mb-10">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${getRoleInfo().colors} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                {getRoleInfo().icon}
              </div>
              <h1 className="text-3xl sm:text-4xl font-headline mb-2">Create Your {getRoleInfo().title} Account</h1>
              <p className="text-ink-muted text-sm sm:text-base font-dm-sans">Join NyayaAI and start your legal journey</p>
            </div>

            {/* Signup Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 ghost-border shadow-lg animate-slide-down">
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a strong password"
                      required
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      placeholder="Re-enter your password"
                      required
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Role-Specific Fields */}
                {selectedRole === 'lawyer' && (
                  <div>
                    <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Bar ID <span className="text-ink-faint">(Optional)</span></label>
                    <input
                      type="text"
                      name="barId"
                      value={signupData.barId}
                      onChange={handleSignupChange}
                      placeholder="e.g., AP1234567"
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                    />
                  </div>
                )}

                {selectedRole === 'student' && (
                  <div>
                    <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">Enrollment ID <span className="text-ink-faint">(Optional)</span></label>
                    <input
                      type="text"
                      name="enrollmentId"
                      value={signupData.enrollmentId}
                      onChange={handleSignupChange}
                      placeholder="e.g., ENROL2024001"
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                    />
                  </div>
                )}

                {selectedRole === 'professional' && (
                  <div>
                    <label className="text-xs sm:text-sm font-dm-sans font-semibold text-ink-muted tracking-wider uppercase mb-2 block">License Number <span className="text-ink-faint">(Optional)</span></label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={signupData.licenseNumber}
                      onChange={handleSignupChange}
                      placeholder="e.g., LIC123456"
                      className="w-full px-4 py-3 border border-color-border rounded-lg font-dm-sans text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-transparent transition-all bg-white hover:border-color-border-strong"
                    />
                  </div>
                )}

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 gradient-accent text-white px-6 py-3 sm:py-4 rounded-lg font-headline font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>

                {/* Links */}
                <div className="flex flex-col items-center pt-6 border-t border-color-border space-y-4">
                  <p className="text-ink-muted text-sm font-dm-sans">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-teal hover:text-teal-light font-dm-sans font-bold transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={handleBackToRoleSelection}
                    className="text-teal hover:text-teal-light font-dm-sans font-semibold text-sm transition-colors"
                  >
                    ← Back to role selection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Side Decorator */}
      <div className="hidden lg:block fixed right-[-80px] top-1/2 -translate-y-1/2 rotate-90 pointer-events-none">
        <span className="text-xs font-dm-sans font-bold tracking-[2px] text-ink-faint/20 uppercase select-none">
          JURISDICTIONAL AUTHORITY · EST {new Date().getFullYear()}
        </span>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-color-border bg-white relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto gap-3 sm:gap-0">
          <div className="font-headline font-bold text-ink text-sm sm:text-base">NyayaAI Jurisdictional Systems</div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-ink-muted font-dm-sans text-xs sm:text-sm uppercase tracking-widest">
            <a href="#" className="hover:text-teal transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-teal transition-colors">Legal Disclaimer</a>
          </div>
          <div className="text-ink-faint text-xs text-center sm:text-right">
            © {new Date().getFullYear()} NyayaAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;