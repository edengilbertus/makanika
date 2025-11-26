import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bike, Wrench, Search, Plus, Phone, ArrowLeft, CheckCircle, Clock, History, User, Bell, Copy, MessageCircle, Send, LogOut, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { INITIAL_JOBS, INITIAL_CUSTOMERS, ISSUE_TYPES } from './data';
import { Job, JobStatus, ViewMode, LogEntry, CostItem, Customer, SMSNotification } from './types';
import { NeoButton } from './components/NeoButton';
import { NeoCard } from './components/NeoCard';
import { StatusBadge } from './components/StatusBadge';
import { LoginForm, RegisterForm } from './components/AuthForms';
import { CostForm, LogForm, NewJobFormFields, PhoneSearchForm } from './components/JobDetailForms';
import { useAuth } from './contexts/AuthContext';
import { sparePartsAPI } from './services/api';

// LocalStorage keys
const STORAGE_KEYS = {
  JOBS: 'mototrackr_jobs',
  CUSTOMERS: 'mototrackr_customers',
  SMS: 'mototrackr_sms'
};

// Storage key for platform selection
const PLATFORM_KEY = 'mototrackr_platform';

export default function App() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Platform state - determines which app the user sees
  const [platform, setPlatform] = useState<'customer' | 'mechanic' | null>(() => {
    const saved = localStorage.getItem(PLATFORM_KEY);
    return saved as 'customer' | 'mechanic' | null;
  });
  
  // Spare parts state
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsSearchQuery, setPartsSearchQuery] = useState('');
  
  // Load from localStorage or use initial data
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });
  
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [smsNotifications, setSmsNotifications] = useState<SMSNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SMS);
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<ViewMode>(() => {
    const savedPlatform = localStorage.getItem(PLATFORM_KEY);
    if (savedPlatform === 'customer') return 'LANDING';
    if (savedPlatform === 'mechanic') return 'MECHANIC_LOGIN';
    return 'PLATFORM_SELECT';
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
  const [showSMSPanel, setShowSMSPanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPartsPanel, setShowPartsPanel] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(smsNotifications));
  }, [smsNotifications]);

  // Save platform selection
  useEffect(() => {
    if (platform) {
      localStorage.setItem(PLATFORM_KEY, platform);
    }
  }, [platform]);

  // Platform selection handlers
  const selectCustomerPlatform = () => {
    setPlatform('customer');
    setView('LANDING');
  };

  const selectMechanicPlatform = () => {
    setPlatform('mechanic');
    setView('MECHANIC_LOGIN');
  };

  const switchPlatform = () => {
    localStorage.removeItem(PLATFORM_KEY);
    setPlatform(null);
    setView('PLATFORM_SELECT');
    logout();
  };

  // Load spare parts from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSpareParts();
      loadLowStockAlerts();
    }
  }, [isAuthenticated]);

  const loadSpareParts = async () => {
    setPartsLoading(true);
    try {
      const data = await sparePartsAPI.getAll();
      setSpareParts(data.items || []);
    } catch (error) {
      console.error('Failed to load spare parts:', error);
    } finally {
      setPartsLoading(false);
    }
  };

  const loadLowStockAlerts = async () => {
    try {
      const alerts = await sparePartsAPI.getLowStockAlerts();
      setLowStockAlerts(alerts || []);
    } catch (error) {
      console.error('Failed to load low stock alerts:', error);
    }
  };

  const searchParts = async (query: string) => {
    if (!query.trim()) {
      loadSpareParts();
      return;
    }
    setPartsLoading(true);
    try {
      const results = await sparePartsAPI.quickSearch(query);
      setSpareParts(results || []);
    } catch (error) {
      console.error('Failed to search parts:', error);
    } finally {
      setPartsLoading(false);
    }
  };

  const activeJob = jobs.find(j => j.id === selectedJobId);
  const customerJobs = selectedCustomerPhone 
    ? jobs.filter(j => j.customerPhone === selectedCustomerPhone)
    : [];

  // Format currency in Uganda Shillings
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} UGX`;
  };

  const calculateTotal = (items: CostItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Generate tracking link
  const generateTrackingLink = (jobId: string) => {
    return `${window.location.origin}?track=${jobId}`;
  };

  // Format phone for WhatsApp (Uganda format)
  const formatPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/\s/g, '').replace(/^0/, '');
    if (!cleaned.startsWith('256')) {
      cleaned = '256' + cleaned;
    }
    return cleaned;
  };

  // Open WhatsApp with message
  const sendWhatsAppMessage = (phone: string, message: string) => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Log notification and open WhatsApp
  const sendNotification = useCallback((phone: string, message: string, jobId: string, autoOpen: boolean = false) => {
    const notification: SMSNotification = {
      id: Date.now().toString(),
      phone,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      jobId
    };
    setSmsNotifications(prev => [notification, ...prev]);
    
    if (autoOpen) {
      sendWhatsAppMessage(phone, message);
    }
  }, []);

  // Handle URL tracking parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('track');
    if (trackId) {
      const job = jobs.find(j => j.id === trackId);
      if (job) {
        // Auto-switch to customer platform when accessing via tracking link
        setPlatform('customer');
        localStorage.setItem(PLATFORM_KEY, 'customer');
        setSelectedJobId(trackId);
        setView('CUSTOMER_STATUS');
      }
    }
  }, []);

  // --- Actions ---

  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    
    // Send SMS notification based on status change
    let message = '';
    switch (newStatus) {
      case JobStatus.DIAGNOSING:
        message = `🔧 MotoTrackr: Your motorcycle is now being diagnosed. We'll update you soon!`;
        break;
      case JobStatus.REPAIRING:
        message = `⚙️ MotoTrackr: Good news! We're now repairing your motorcycle.`;
        break;
      case JobStatus.WAITING_PARTS:
        message = `📦 MotoTrackr: We're waiting for parts for your motorcycle. We'll notify you when they arrive.`;
        break;
      case JobStatus.READY:
        message = `✅ MotoTrackr: Your motorcycle is READY FOR PICKUP! Come collect it at the workshop.`;
        break;
    }
    
    if (message) {
      const trackingLink = generateTrackingLink(jobId);
      const fullMessage = `${message}\n\nTrack your repair: ${trackingLink}`;
      sendNotification(job.customerPhone, fullMessage, jobId, true);
    }
  };

  const handleAddLog = (jobId: string, message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      message
    };
    setJobs(jobs.map(j => j.id === jobId ? { ...j, logs: [newLog, ...j.logs] } : j));
  };

  const handleAddCost = (jobId: string, description: string, amount: number) => {
    const newCost: CostItem = {
      id: Date.now().toString(),
      description,
      amount
    };
    setJobs(jobs.map(j => j.id === jobId ? { ...j, costItems: [...j.costItems, newCost] } : j));
  };

  const copyTrackingLink = (jobId: string) => {
    navigator.clipboard.writeText(generateTrackingLink(jobId));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- Views ---

  // Customer-only Header
  const CustomerHeader = () => (
    <header className="bg-mk-green border-b-4 border-black p-4 md:p-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
          <Bike className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wider">MOTOTRACKR</h1>
            <p className="text-xs font-mono opacity-70 hidden sm:block">Track Your Boda Repair</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={switchPlatform}
            className="text-xs font-mono opacity-70 hover:opacity-100 underline"
          >
            Switch App
          </button>
        </div>
      </div>
    </header>
  );

  // Mechanic-only Header
  const MechanicHeader = () => (
    <header className="bg-mk-yellow border-b-4 border-black p-4 md:p-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => isAuthenticated && setView('MECHANIC_DASHBOARD')}>
          <Wrench className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wider">MOTOTRACKR</h1>
            <p className="text-xs font-mono opacity-70 hidden sm:block">Workshop Management</p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          {isAuthenticated && (
            <>
              <button 
                className={`relative p-2 border-2 border-black transition-colors ${showPartsPanel ? 'bg-mk-blue text-white' : 'bg-white hover:bg-gray-100'}`}
                onClick={() => { setShowPartsPanel(!showPartsPanel); setShowSMSPanel(false); }}
                title="Spare Parts Inventory"
              >
                <Package className="w-5 h-5" />
                {lowStockAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-mk-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {lowStockAlerts.length}
                  </span>
                )}
              </button>
              <button 
                className={`relative p-2 border-2 border-black transition-colors ${showSMSPanel ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                onClick={() => { setShowSMSPanel(!showSMSPanel); setShowPartsPanel(false); }}
              >
                <MessageCircle className="w-5 h-5" />
                {smsNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-mk-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {smsNotifications.length}
                  </span>
                )}
              </button>
              <button 
                className="p-2 border-2 border-black bg-white hover:bg-gray-100"
                onClick={() => { logout(); setView('MECHANIC_LOGIN'); }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              {user && (
                <div className="hidden md:block text-right ml-2">
                  <p className="text-xs font-bold">{user.name}</p>
                  <p className="text-xs opacity-70">{user.role}</p>
                </div>
              )}
            </>
          )}
          <button 
            onClick={switchPlatform}
            className="text-xs font-mono opacity-70 hover:opacity-100 underline ml-2"
          >
            Switch App
          </button>
        </div>
      </div>
    </header>
  );

  // Platform Selection Screen
  const PlatformSelectView = () => (
    <div className="min-h-screen bg-gradient-to-br from-mk-yellow via-white to-mk-green flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <Bike className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-2">MOTOTRACKR</h1>
          <p className="text-lg font-mono text-gray-600">Uganda's Boda Boda Workshop Platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer App */}
          <div 
            onClick={selectCustomerPlatform}
            className="bg-mk-green border-4 border-black shadow-neo p-8 cursor-pointer hover:shadow-neo-lg hover:-translate-y-2 transition-all"
          >
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">RIDER APP</h2>
              <p className="font-mono text-sm mb-6">For Boda Boda Owners</p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Track your repair status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> View cost breakdown
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> See repair history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Get WhatsApp updates
                </li>
              </ul>
              <div className="bg-black text-white py-3 px-6 font-bold text-lg">
                ENTER RIDER APP →
              </div>
            </div>
          </div>

          {/* Mechanic App */}
          <div 
            onClick={selectMechanicPlatform}
            className="bg-mk-yellow border-4 border-black shadow-neo p-8 cursor-pointer hover:shadow-neo-lg hover:-translate-y-2 transition-all"
          >
            <div className="text-center">
              <Wrench className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">MECHANIC APP</h2>
              <p className="font-mono text-sm mb-6">For Workshop Staff</p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Manage repair jobs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Track spare parts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Send customer updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Workshop dashboard
                </li>
              </ul>
              <div className="bg-black text-white py-3 px-6 font-bold text-lg">
                ENTER MECHANIC APP →
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm font-mono text-gray-500">
          🏍️ Choose your app to get started
        </p>
      </div>
    </div>
  );

  const SMSPanel = () => (
    <div className="fixed right-0 top-20 w-80 max-h-96 bg-white border-4 border-black shadow-neo z-50 overflow-hidden">
      <div className="bg-green-500 text-white p-3 flex justify-between items-center">
        <span className="font-bold text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Messages</span>
        <button onClick={() => setShowSMSPanel(false)} className="font-bold">×</button>
      </div>
      <div className="overflow-y-auto max-h-72">
        {smsNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No messages sent yet</div>
        ) : (
          smsNotifications.map(sms => (
            <div key={sms.id} className="p-3 border-b border-gray-200 hover:bg-gray-50">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>To: {sms.phone}</span>
                <span>{sms.timestamp}</span>
              </div>
              <p className="text-sm mb-2 whitespace-pre-line">{sms.message.substring(0, 100)}...</p>
              <button 
                onClick={() => sendWhatsAppMessage(sms.phone, sms.message)}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-600"
              >
                <Send className="w-3 h-3" /> Resend via WhatsApp
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const SparePartsPanel = () => (
    <div className="fixed right-0 top-20 w-96 max-h-[500px] bg-white border-4 border-black shadow-neo z-50 overflow-hidden">
      <div className="bg-mk-blue text-white p-3 flex justify-between items-center">
        <span className="font-bold text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Spare Parts Inventory</span>
        <button onClick={() => setShowPartsPanel(false)} className="font-bold">×</button>
      </div>
      
      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-mk-red/10 border-b-2 border-mk-red p-2">
          <p className="text-xs font-bold text-mk-red flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {lowStockAlerts.length} items low on stock
          </p>
        </div>
      )}
      
      {/* Search */}
      <div className="p-3 border-b-2 border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search parts..."
            className="flex-grow p-2 border-2 border-black text-sm font-mono"
            value={partsSearchQuery}
            onChange={(e) => setPartsSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchParts(partsSearchQuery)}
          />
          <button 
            onClick={() => searchParts(partsSearchQuery)}
            className="p-2 border-2 border-black bg-mk-yellow hover:bg-yellow-400"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Parts List */}
      <div className="overflow-y-auto max-h-80">
        {partsLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading parts...</p>
          </div>
        ) : spareParts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No spare parts found</p>
            <p className="text-xs mt-1">Add parts from the backend</p>
          </div>
        ) : (
          spareParts.map((part: any) => (
            <div key={part.id || part.sku} className="p-3 border-b border-gray-200 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="font-bold text-sm">{part.name}</p>
                  <p className="text-xs text-gray-500 font-mono">SKU: {part.sku}</p>
                  {part.category && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 mt-1 inline-block">{part.category}</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(part.price || 0)}</p>
                  <p className={`text-xs font-mono ${(part.quantity || 0) < 5 ? 'text-mk-red font-bold' : 'text-gray-600'}`}>
                    Stock: {part.quantity || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (activeJob) {
                    handleAddCost(activeJob.id, part.name, part.price || 0);
                    setShowPartsPanel(false);
                  }
                }}
                disabled={!activeJob || view !== 'MECHANIC_JOB_DETAIL'}
                className={`mt-2 w-full text-xs p-1.5 border-2 border-black font-bold 
                  ${activeJob && view === 'MECHANIC_JOB_DETAIL' 
                    ? 'bg-mk-green hover:bg-green-500 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {activeJob && view === 'MECHANIC_JOB_DETAIL' ? 'ADD TO JOB' : 'Select a job first'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const LandingView = () => {
    const handlePhoneSearch = (phone: string) => {
      const normalizedPhone = phone.replace(/\s/g, '');
      const customerJobsList = jobs.filter(j => 
        j.customerPhone.replace(/\s/g, '') === normalizedPhone
      );
      
      if (customerJobsList.length > 0) {
        setSelectedCustomerPhone(normalizedPhone);
        if (customerJobsList.length === 1) {
          setSelectedJobId(customerJobsList[0].id);
          setView('CUSTOMER_STATUS');
        } else {
          setView('CUSTOMER_HISTORY');
        }
      } else {
        alert('No repairs found for this phone number.');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <PhoneSearchForm onSearch={handlePhoneSearch} />
      </div>
    );
  };

  const CustomerHistoryView = () => {
    const historyJobs = jobs.filter(j => j.customerPhone === selectedCustomerPhone);
    const customerName = historyJobs[0]?.customerName || 'Customer';

    return (
      <div className="max-w-4xl mx-auto p-4">
        <NeoButton variant="outline" size="sm" onClick={() => setView('LANDING')} className="mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </NeoButton>

        <div className="mb-6">
          <h2 className="text-2xl font-black">Welcome back, {customerName}!</h2>
          <p className="font-mono text-sm text-gray-600">Your repair history at this workshop</p>
        </div>

        <div className="space-y-4">
          {historyJobs.map(job => (
            <div 
              key={job.id}
              onClick={() => { setSelectedJobId(job.id); setView('CUSTOMER_STATUS'); }}
              className="bg-white border-4 border-black shadow-neo p-4 cursor-pointer hover:shadow-neo-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{job.issueType}</h3>
                  <p className="text-sm text-gray-600">{job.motorcycleModel} • {job.plateNumber}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{formatDate(job.entryDate)}</span>
                <span className="font-bold">{formatCurrency(calculateTotal(job.costItems))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CustomerStatusView = () => {
    if (!activeJob) return null;
    const total = calculateTotal(activeJob.costItems);

    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <NeoButton 
          variant="outline" 
          size="sm" 
          onClick={() => selectedCustomerPhone ? setView('CUSTOMER_HISTORY') : setView('LANDING')}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </NeoButton>

        {/* Status Header */}
        <div className="bg-mk-blue border-4 border-black shadow-neo p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-xs font-bold opacity-80 mb-1">CURRENT STATUS</div>
              <div className="text-3xl md:text-4xl font-black uppercase tracking-wider">{activeJob.status}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{activeJob.motorcycleModel}</div>
              <div className="font-mono text-sm opacity-90">{activeJob.plateNumber}</div>
            </div>
          </div>
          {activeJob.status === JobStatus.READY && (
            <div className="mt-4 bg-mk-green text-black p-3 border-2 border-black font-bold text-center">
              ✅ Your motorcycle is ready! Come pick it up.
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NeoCard>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Issue</span>
                <p className="font-bold">{activeJob.issueType}</p>
                <p className="text-sm text-gray-600">{activeJob.issueDescription}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Estimated Pickup</span>
                  <p className="font-bold flex items-center gap-1"><Clock className="w-4 h-4" /> {activeJob.estimatedPickup}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Date</span>
                  <p className="font-bold">{formatDate(activeJob.entryDate)}</p>
                </div>
              </div>
            </div>
          </NeoCard>

          {/* Cost Summary */}
          <NeoCard title="COST BREAKDOWN">
            <div className="space-y-2">
              {activeJob.costItems.length === 0 ? (
                <p className="text-gray-500 text-sm">Cost will be updated soon...</p>
              ) : (
                activeJob.costItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm border-b border-dashed border-gray-300 pb-2">
                    <span>{item.description}</span>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t-4 border-black flex justify-between text-xl font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </NeoCard>
        </div>

        {/* Work Log */}
        <NeoCard title="UPDATES">
          <div className="space-y-4">
            {activeJob.logs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start">
                <div className="bg-black text-white px-2 py-1 text-xs font-bold whitespace-nowrap">{log.timestamp}</div>
                <p className="font-mono text-sm">{log.message}</p>
              </div>
            ))}
          </div>
        </NeoCard>
      </div>
    );
  };

  const MechanicDashboard = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">WORKSHOP</h2>
          <p className="font-mono text-gray-600">ACTIVE JOBS: {jobs.filter(j => j.status !== JobStatus.READY).length} | READY: {jobs.filter(j => j.status === JobStatus.READY).length}</p>
        </div>
        <NeoButton variant="success" onClick={() => setView('MECHANIC_NEW_JOB')}>
          <Plus className="w-5 h-5" /> NEW JOB
        </NeoButton>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.values(JobStatus).map(status => (
          <div key={status} className="bg-white border-4 border-black p-4 text-center">
            <div className="text-3xl font-black">{jobs.filter(j => j.status === status).length}</div>
            <div className="text-xs font-bold uppercase text-gray-500">{status}</div>
          </div>
        ))}
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            onClick={() => { setSelectedJobId(job.id); setView('MECHANIC_JOB_DETAIL'); }}
            className="bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="p-4 bg-mk-yellow border-b-4 border-black flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black">{job.motorcycleModel}</h3>
                <p className="text-sm font-mono">{job.plateNumber}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase block">Customer</span>
                <span className="font-bold">{job.customerName}</span>
                <span className="text-sm text-gray-600 block">{job.customerPhone}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-2">
                <span className="text-xs text-gray-500 uppercase block">Issue</span>
                <p className="font-bold">{job.issueType}</p>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500">Est: {job.estimatedPickup}</span>
                <span className="font-bold">{formatCurrency(calculateTotal(job.costItems))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MechanicJobDetail = () => {
    if (!activeJob) return null;

    const allStatuses = Object.values(JobStatus);
    const customerHistory = jobs.filter(j => j.customerPhone === activeJob.customerPhone && j.id !== activeJob.id);

    return (
      <div className="max-w-5xl mx-auto p-4 pb-20">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <NeoButton variant="outline" size="sm" onClick={() => setView('MECHANIC_DASHBOARD')}>
            <ArrowLeft className="w-4 h-4" /> BACK
          </NeoButton>
          
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((s) => (
               <button
                 key={s}
                 onClick={() => handleUpdateStatus(activeJob.id, s as JobStatus)}
                 className={`
                    px-2 py-1 text-xs font-bold border-2 border-black transition-all
                    ${activeJob.status === s ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}
                 `}
               >
                 {s}
               </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-1 space-y-6">
             <div className="border-4 border-black shadow-neo bg-mk-yellow p-6">
                <StatusBadge status={activeJob.status} />
                <h1 className="text-3xl font-black mt-4 mb-1">{activeJob.motorcycleModel}</h1>
                <p className="text-lg font-mono mb-4">{activeJob.plateNumber}</p>
                
                <div className="bg-white border-2 border-black p-3 mb-4">
                  <p className="text-xs font-bold opacity-50 uppercase mb-1">{activeJob.issueType}</p>
                  <p className="font-mono text-sm">{activeJob.issueDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-white border-2 border-black p-2">
                    <span className="text-xs text-gray-500 block">Est. Cost</span>
                    <span className="font-bold">{formatCurrency(activeJob.estimatedCost)}</span>
                  </div>
                  <div className="bg-white border-2 border-black p-2">
                    <span className="text-xs text-gray-500 block">Pickup</span>
                    <span className="font-bold">{activeJob.estimatedPickup}</span>
                  </div>
                </div>

                <div className="pt-4 border-t-4 border-black">
                   <p className="text-xs font-bold opacity-50 uppercase mb-1">Customer</p>
                   <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold block">{activeJob.customerName}</span>
                        <span className="text-sm font-mono">{activeJob.customerPhone}</span>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${activeJob.customerPhone}`}
                          className="p-2 border-2 border-black bg-white hover:bg-gray-100"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => sendWhatsAppMessage(activeJob.customerPhone, `Hi ${activeJob.customerName}, this is about your ${activeJob.motorcycleModel} at MotoTrackr.`)}
                          className="p-2 border-2 border-black bg-green-500 text-white hover:bg-green-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Tracking Link & WhatsApp */}
             <div className="border-4 border-black bg-white p-4">
               <p className="text-xs font-bold uppercase mb-2">📱 Customer Tracking Link</p>
               <div className="flex gap-2 mb-3">
                 <input 
                   type="text" 
                   readOnly 
                   value={generateTrackingLink(activeJob.id)} 
                   className="flex-grow p-2 border-2 border-black text-xs font-mono bg-gray-50"
                 />
                 <NeoButton size="sm" onClick={() => copyTrackingLink(activeJob.id)}>
                   {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </NeoButton>
               </div>
               <button 
                 onClick={() => {
                   const link = generateTrackingLink(activeJob.id);
                   const msg = `🏍️ *MotoTrackr Update*\n\nHi ${activeJob.customerName}!\n\nTrack your ${activeJob.motorcycleModel} repair status here:\n${link}\n\nCurrent Status: *${activeJob.status}*`;
                   sendWhatsAppMessage(activeJob.customerPhone, msg);
                 }}
                 className="w-full bg-green-500 text-white p-3 border-2 border-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
               >
                 <MessageCircle className="w-5 h-5" /> SEND VIA WHATSAPP
               </button>
             </div>
             
             {/* Customer History */}
             {customerHistory.length > 0 && (
               <div className="border-4 border-black bg-white p-4">
                 <p className="text-xs font-bold uppercase mb-3 flex items-center gap-2">
                   <History className="w-4 h-4" /> Past Repairs ({customerHistory.length})
                 </p>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                   {customerHistory.map(job => (
                     <div key={job.id} className="text-sm border-b border-gray-200 pb-2">
                       <div className="flex justify-between">
                         <span className="font-bold">{job.issueType}</span>
                         <span className="text-gray-500">{formatDate(job.entryDate)}</span>
                       </div>
                       <span className="text-xs text-gray-600">{formatCurrency(calculateTotal(job.costItems))}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>

          {/* Editors */}
          <div className="lg:col-span-2 space-y-6">
            <NeoCard title="COSTS & PARTS">
               <div className="space-y-2 mb-6">
                 {activeJob.costItems.length === 0 ? (
                   <p className="text-gray-400 text-sm py-4">No costs added yet</p>
                 ) : (
                   activeJob.costItems.map((item) => (
                     <div key={item.id} className="flex justify-between py-2 border-b border-gray-200">
                       <span>{item.description}</span>
                       <span className="font-bold">{formatCurrency(item.amount)}</span>
                     </div>
                   ))
                 )}
                 <div className="flex justify-between py-4 border-t-4 border-black text-xl font-bold">
                   <span>TOTAL</span>
                   <span>{formatCurrency(calculateTotal(activeJob.costItems))}</span>
                 </div>
               </div>
               
               {/* Add Cost Form */}
               <CostForm 
                 onAddCost={(desc, amount) => handleAddCost(activeJob.id, desc, amount)}
                 formatCurrency={formatCurrency}
               />
            </NeoCard>

            <NeoCard title="WORK LOG">
               <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                 {activeJob.logs.map((log) => (
                    <div key={log.id} className="flex gap-3 items-start">
                       <span className="bg-black text-white text-xs px-2 py-1 whitespace-nowrap">{log.timestamp}</span>
                       <span className="text-sm font-mono">{log.message}</span>
                    </div>
                 ))}
               </div>
               <LogForm onAddLog={(msg) => handleAddLog(activeJob.id, msg)} />
            </NeoCard>
          </div>
        </div>
      </div>
    );
  };

  const NewJobForm = () => {
    const handleFormSubmit = (formData: any) => {
      // Create job with form data
      const newJob: Job = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone.replace(/\s/g, ''),
        motorcycleModel: formData.motorcycleModel,
        plateNumber: formData.plateNumber.toUpperCase(),
        issueType: formData.issueType,
        issueDescription: formData.issueDescription,
        status: JobStatus.CHECKED_IN,
        estimatedCost: parseInt(formData.estimatedCost) || 0,
        estimatedPickup: formData.estimatedPickup,
        entryDate: new Date().toISOString(),
        costItems: [],
        logs: [{
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          message: 'Motorcycle checked in. Job created.'
        }],
        visuals: []
      };

      setJobs([newJob, ...jobs]);

      // Add or update customer
      const existingCustomer = customers.find(c => c.phone === newJob.customerPhone);
      if (existingCustomer) {
        setCustomers(customers.map(c => 
          c.phone === newJob.customerPhone 
            ? { ...c, jobs: [...c.jobs, newJob.id] }
            : c
        ));
      } else {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          name: newJob.customerName,
          phone: newJob.customerPhone,
          jobs: [newJob.id]
        };
        setCustomers([...customers, newCustomer]);
      }

      // Send initial WhatsApp with tracking link
      const trackingLink = generateTrackingLink(newJob.id);
      const whatsappMessage = `🏍️ *MotoTrackr*\n\nHello ${newJob.customerName}!\n\nYour *${newJob.issueType}* job has been logged.\n\n📋 *Details:*\n• Motorcycle: ${newJob.motorcycleModel}\n• Est. Cost: ${formatCurrency(newJob.estimatedCost)}\n• Pickup: ${newJob.estimatedPickup}\n\n🔗 Track your repair status:\n${trackingLink}\n\nWe'll update you on progress!`;
      sendNotification(newJob.customerPhone, whatsappMessage, newJob.id, true);

      setView('MECHANIC_DASHBOARD');
    };

    return (
      <div className="max-w-xl mx-auto p-4">
        <NeoCard title="CHECK IN NEW MOTORCYCLE" className="w-full relative">
          <button 
            onClick={() => setView('MECHANIC_DASHBOARD')}
            className="absolute top-4 right-4 font-bold text-red-600 hover:text-red-800 text-xl"
          >×</button>
          
          <NewJobFormFields 
            onSubmit={handleFormSubmit}
            onCancel={() => setView('MECHANIC_DASHBOARD')}
            issueTypes={ISSUE_TYPES}
          />
        </NeoCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mk-bg text-black pb-10">
      {/* Platform Selection - No header */}
      {view === 'PLATFORM_SELECT' && <PlatformSelectView />}
      
      {/* Customer Platform */}
      {platform === 'customer' && view !== 'PLATFORM_SELECT' && (
        <>
          <CustomerHeader />
          <main className="mt-6">
            {view === 'LANDING' && <LandingView />}
            {view === 'CUSTOMER_STATUS' && <CustomerStatusView />}
            {view === 'CUSTOMER_HISTORY' && <CustomerHistoryView />}
          </main>
          <footer className="text-center py-8 text-xs font-mono text-gray-400">
            <p>🏍️ MOTOTRACKR — RIDER APP</p>
            <p className="mt-1">Track your boda repairs easily.</p>
          </footer>
        </>
      )}

      {/* Mechanic Platform */}
      {platform === 'mechanic' && view !== 'PLATFORM_SELECT' && (
        <>
          <MechanicHeader />
          {showSMSPanel && <SMSPanel />}
          {showPartsPanel && <SparePartsPanel />}
          <main className="mt-6">
            {view === 'MECHANIC_LOGIN' && !isAuthenticated && (
              authView === 'login' 
                ? <LoginForm onSuccess={() => setView('MECHANIC_DASHBOARD')} onSwitchToRegister={() => setAuthView('register')} />
                : <RegisterForm onSuccess={() => setView('MECHANIC_DASHBOARD')} onSwitchToLogin={() => setAuthView('login')} />
            )}
            {view === 'MECHANIC_DASHBOARD' && (isAuthenticated ? <MechanicDashboard /> : <LoginForm onSuccess={() => setView('MECHANIC_DASHBOARD')} onSwitchToRegister={() => setAuthView('register')} />)}
            {view === 'MECHANIC_JOB_DETAIL' && (isAuthenticated ? <MechanicJobDetail /> : <LoginForm onSuccess={() => {}} />)}
            {view === 'MECHANIC_NEW_JOB' && (isAuthenticated ? <NewJobForm /> : <LoginForm onSuccess={() => {}} />)}
          </main>
          <footer className="text-center py-8 text-xs font-mono text-gray-400">
            <p>🔧 MOTOTRACKR — MECHANIC APP</p>
            <p className="mt-1">Workshop management made easy.</p>
          </footer>
        </>
      )}
    </div>
  );
}