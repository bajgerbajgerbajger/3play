import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/Button';
import { 
  Mail, Smartphone, Lock, Facebook, Chrome, Instagram 
} from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login, verify2FA } = useAuthStore();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Logging in with', email, password);
    // Move to 2FA step
    setStep('2fa');
    // Simulate sending code
    console.log(`Sending code via ${method} to ${email}`);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verify2FA(code);
    if (isValid) {
      login({
        id: '1',
        username: email.split('@')[0],
        email: email,
        avatar: '',
        subscribers: 0,
        isVerified: true,
        createdAt: new Date().toISOString(),
        chatColor: '#000000',
        twoFactorEnabled: true
      });
      navigate('/');
    } else {
      alert('Neplatný kód (zkuste 123456)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">3Play</h1>
          <p className="text-gray-500 mt-2">
            {step === 'credentials' ? 'Přihlaste se ke svému účtu' : 'Dvoufázové ověření'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="vas@email.cz"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Pokračovat
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nebo pokračujte přes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="gap-2">
                <Chrome className="h-4 w-4" /> Google
              </Button>
              <Button type="button" variant="outline" className="gap-2">
                <Facebook className="h-4 w-4" /> Facebook
              </Button>
              <Button type="button" variant="outline" className="gap-2">
                <span className="font-bold">S</span> Seznam
              </Button>
              <Button type="button" variant="outline" className="gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-3">
               <Button type="button" variant="ghost" size="sm" className="text-xs">Apple ID</Button>
               <Button type="button" variant="ghost" size="sm" className="text-xs">TikTok</Button>
               <Button type="button" variant="ghost" size="sm" className="text-xs">Microsoft</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
              Odeslali jsme ověřovací kód na váš {method === 'email' ? 'email' : 'telefon'}.
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${method === 'email' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
              >
                <Mail className="h-4 w-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => setMethod('sms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${method === 'sms' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
              >
                <Smartphone className="h-4 w-4" /> SMS
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ověřovací kód</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Ověřit a přihlásit
            </Button>

            <button 
              type="button" 
              onClick={() => setStep('credentials')}
              className="w-full text-sm text-gray-500 hover:text-gray-900"
            >
              Zpět na přihlášení
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
