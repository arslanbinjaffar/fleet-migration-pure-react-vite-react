import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setCredentials, setLoading, selectAuthLoading, selectAuthError, setError } from '@/stores/slices/authSlice';
import { useLoginMutation } from '@/stores/api/authApiSlice';
import { authNotifications } from '@/utils/notifications';
import type { LoginRequest } from '@/types';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [login] = useLoginMutation();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(setError(null));
  }, [dispatch]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await login(formData).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      }));

      // Store in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
      }

      // Show success notification
      authNotifications.loginSuccess(result.user.name);

      // Navigate based on user role
      const redirectPath = getRedirectPath(result.user.role);
      navigate(redirectPath, { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          'Login failed. Please check your credentials.';
      
      dispatch(setError(errorMessage));
      authNotifications.loginError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRedirectPath = (role: string): string => {
    // If there's a specific route they were trying to access, go there
    if (from !== '/') {
      return from;
    }

    // Otherwise, redirect based on role
    switch (role.toLowerCase()) {
      case 'admin':
      case 'super_admin':
        return '/admin/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'employee':
        return '/employee/dashboard';
      case 'hr':
        return '/hr/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (remembered === 'true' && savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: `var(--color-bg)`,
        backgroundImage: 'url("/rainbow-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0" style={{backgroundColor: 'var(--color-card)', boxShadow: `0 25px 50px -12px var(--color-shadow)`}}>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))`}}>
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center" style={{ color: 'var(--color-text)' }}>Welcome Back</CardTitle>
            <CardDescription className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Login page allows users to enter credentials for authentication
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${
                      validationErrors.email ? 'border-destructive' : ''
                    }`}
                    style={{
                      borderColor: validationErrors.email ? undefined : 'var(--color-border)',
                      backgroundColor: 'var(--color-input)'
                    }}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${
                      validationErrors.password ? 'border-destructive' : ''
                    }`}
                    style={{
                      borderColor: validationErrors.password ? undefined : 'var(--color-border)',
                      backgroundColor: 'var(--color-input)'
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Remember me
                </Label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-white font-medium py-2 px-4 rounded-md transition-opacity hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))`
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                className="text-sm transition-colors"
                style={{
                  color: 'var(--color-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onClick={() => {
                  // TODO: Implement forgot password functionality
                  console.log('Forgot password clicked');
                }}
              >
                Forgot your password?
              </button>
              
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="transition-colors font-medium"
                  style={{
                    color: 'var(--color-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onClick={() => {
                    // TODO: Implement registration navigation
                    console.log('Sign up clicked');
                  }}
                >
                  Sign up
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;