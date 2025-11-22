import React, { useState, useEffect } from 'react';
import { Layout, Car, Wrench, Search, Plus, Phone, ArrowLeft, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { INITIAL_JOBS } from './data';
import { Job, JobStatus, ViewMode, LogEntry, CostItem } from './types';
import { NeoButton } from './components/NeoButton';
import { NeoCard } from './components/NeoCard';
import { StatusBadge } from './components/StatusBadge';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [view, setView] = useState<ViewMode>('LANDING');
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Mechanic New Job Form State
  const [newJobForm, setNewJobForm] = useState({
    plateNumber: '',
    carModel: '',
    ownerName: '',
    primaryIssue: ''
  });

  const activeJob = jobs.find(j => j.id === selectedJobId);

  // Utility to format currency in Uganda Shillings
  const formatCurrency = (amount: number) => {
    return `USh ${amount.toLocaleString()}`;
  };

  const calculateTotal = (items: CostItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  // --- Actions ---

  const handleSearch = () => {
    const job = jobs.find(j => j.plateNumber.toUpperCase().replace(/\s/g, '') === searchPlate.toUpperCase().replace(/\s/g, ''));
    if (job) {
      setSelectedJobId(job.id);
      setView('DRIVER_STATUS');
    } else {
      alert('Plate number not found active in the system.');
    }
  };

  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
  };

  const handleAddLog = (jobId: string, message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleCreateJob = () => {
    const newJob: Job = {
      id: Date.now().toString(),
      plateNumber: newJobForm.plateNumber.toUpperCase(),
      carModel: newJobForm.carModel,
      ownerName: newJobForm.ownerName,
      primaryIssue: newJobForm.primaryIssue,
      status: JobStatus.PENDING,
      entryDate: new Date().toISOString(),
      costItems: [],
      logs: [{
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: 'Job card opened.'
      }],
      visuals: [`https://picsum.photos/400/300?random=${Date.now()}`]
    };
    setJobs([newJob, ...jobs]);
    setView('MECHANIC_DASHBOARD');
    setNewJobForm({ plateNumber: '', carModel: '', ownerName: '', primaryIssue: '' });
  };

  // --- Views ---

  const Header = () => (
    <header className="bg-mk-yellow border-b-4 border-black p-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
          <Car className="w-8 h-8" />
          <h1 className="text-3xl font-black tracking-widest">MAKANIKA</h1>
        </div>
        <div className="flex gap-4 hidden sm:flex">
          <NeoButton 
            size="sm" 
            variant={view.startsWith('DRIVER') ? 'secondary' : 'outline'}
            onClick={() => setView('LANDING')}
          >
            For Drivers
          </NeoButton>
          <NeoButton 
            size="sm" 
            variant={view.startsWith('MECHANIC') ? 'primary' : 'outline'}
            onClick={() => setView('MECHANIC_DASHBOARD')}
          >
            For Mechanics
          </NeoButton>
        </div>
      </div>
    </header>
  );

  const LandingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <NeoCard className="max-w-md w-full text-center">
        <h2 className="text-3xl font-black mb-2">TRACK REPAIR</h2>
        <p className="font-mono text-sm mb-6 text-gray-600">ENTER PLATE NUMBER</p>
        
        <input 
          type="text" 
          placeholder="UBD 888X"
          className="w-full border-4 border-black p-4 text-center text-xl font-bold font-mono mb-4 focus:outline-none focus:ring-4 focus:ring-mk-yellow"
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
        />
        
        <NeoButton fullWidth onClick={handleSearch}>
          <Search className="w-5 h-5" /> TRACK NOW
        </NeoButton>
        
        <div className="mt-4 text-xs text-gray-500">
          Try "UBD 888X" or "UBF 420Z"
        </div>
      </NeoCard>
    </div>
  );

  const DriverStatusView = () => {
    if (!activeJob) return null;
    const total = calculateTotal(activeJob.costItems);

    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Status Header */}
        <div className="bg-mk-blue border-4 border-black shadow-neo p-6 text-white flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <div className="text-xs font-bold opacity-80 mb-1">STATUS</div>
            <div className="text-5xl md:text-6xl font-black uppercase tracking-widest">{activeJob.status}</div>
          </div>
          <div className="text-right md:text-left">
            <div className="text-2xl font-bold">{activeJob.plateNumber}</div>
            <div className="font-mono text-sm opacity-90">{activeJob.carModel}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Work Log */}
          <NeoCard title="WORK LOG" className="h-full">
            <div className="space-y-6">
              {activeJob.logs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="bg-black text-white px-2 py-1 text-xs h-fit font-bold">{log.timestamp}</div>
                  <div className="font-mono text-sm leading-relaxed border-l-2 border-gray-300 pl-4">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          {/* Estimate */}
          <NeoCard title="ESTIMATE" className="h-full flex flex-col">
            <div className="space-y-4 flex-grow">
              {activeJob.costItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-dashed border-gray-400 pb-2">
                  <span>{item.description}</span>
                  <span className="font-bold">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t-4 border-black">
              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <NeoButton variant="success" fullWidth>
                <CheckCircle className="w-5 h-5" /> APPROVED
              </NeoButton>
            </div>
          </NeoCard>
        </div>

        {/* Live Visuals */}
        <NeoCard title="LIVE VISUALS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJob.visuals.length > 0 ? activeJob.visuals.map((url, idx) => (
              <div key={idx} className="relative group overflow-hidden border-2 border-black">
                <img src={url} alt="Repair" className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-xs font-bold">
                  UPDATED JUST NOW
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 font-mono">No images uploaded yet.</div>
            )}
          </div>
        </NeoCard>
      </div>
    );
  };

  const MechanicDashboard = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-black uppercase mb-2">SHOP FLOOR</h2>
          <p className="font-mono text-gray-600">ACTIVE JOBS: {jobs.length}</p>
        </div>
        <NeoButton variant="success" onClick={() => setView('MECHANIC_NEW_JOB')}>
          <Plus className="w-5 h-5" /> NEW JOB
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            onClick={() => { setSelectedJobId(job.id); setView('MECHANIC_JOB_DETAIL'); }}
            className="bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all cursor-pointer relative"
          >
            <div className="absolute top-4 right-4 z-10">
               <StatusBadge status={job.status} />
            </div>
            <img src={job.visuals[0]} className="w-full h-48 object-cover border-b-4 border-black grayscale hover:grayscale-0 transition-all" alt="Car" />
            <div className="p-4 bg-mk-yellow border-b-4 border-black">
               <h3 className="text-2xl font-black">{job.plateNumber}</h3>
               <p className="text-sm font-bold">{job.carModel}</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase block">Client</span>
                <span className="font-bold">{job.ownerName}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-2">
                <span className="text-xs text-gray-500 uppercase block">Issue</span>
                <p className="text-sm truncate">{job.primaryIssue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MechanicJobDetail = () => {
    if (!activeJob) return null;
    const [logInput, setLogInput] = useState('');
    const [costDesc, setCostDesc] = useState('');
    const [costAmount, setCostAmount] = useState('');

    const allStatuses = Object.values(JobStatus);

    return (
      <div className="max-w-5xl mx-auto p-4 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <NeoButton variant="outline" size="sm" onClick={() => setView('MECHANIC_DASHBOARD')}>
            <ArrowLeft className="w-4 h-4" /> BACK TO SHOP
          </NeoButton>
          
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((s) => (
               <button
                 key={s}
                 onClick={() => handleUpdateStatus(activeJob.id, s as JobStatus)}
                 className={`
                    px-3 py-2 text-xs font-bold border-2 border-black transition-all
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
                <h1 className="text-4xl font-black mb-1">{activeJob.plateNumber}</h1>
                <p className="text-lg font-bold mb-6">{activeJob.carModel}</p>
                
                <div className="bg-white border-2 border-black p-3 mb-4">
                  <p className="text-xs font-bold opacity-50 uppercase mb-1">Primary Issue</p>
                  <p className="font-mono text-sm">{activeJob.primaryIssue}</p>
                </div>

                <div className="mt-6 pt-6 border-t-4 border-black">
                   <p className="text-xs font-bold opacity-50 uppercase mb-1">Owner</p>
                   <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">{activeJob.ownerName}</span>
                      <NeoButton size="sm" variant="secondary"><Phone className="w-4 h-4" /> CALL</NeoButton>
                   </div>
                </div>
             </div>
             
             {/* Quick Actions */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-mk-blue text-white p-4 border-4 border-black shadow-neo text-center cursor-pointer hover:opacity-90 active:translate-y-1 transition-all">
                   <RefreshCw className="w-8 h-8 mx-auto mb-2" />
                   <span className="font-bold text-xs">ADD LOG UPDATE</span>
                </div>
                <div className="bg-mk-red text-white p-4 border-4 border-black shadow-neo text-center cursor-pointer hover:opacity-90 active:translate-y-1 transition-all">
                   <Wrench className="w-8 h-8 mx-auto mb-2" />
                   <span className="font-bold text-xs">ADD PART/COST</span>
                </div>
             </div>
          </div>

          {/* Editors */}
          <div className="lg:col-span-2 space-y-6">
            <NeoCard title="JOB CARD COSTS">
               <div className="space-y-2 mb-6">
                 {activeJob.costItems.map((item) => (
                   <div key={item.id} className="flex justify-between py-2 border-b border-gray-200">
                     <span>{item.description}</span>
                     <span className="font-bold">{formatCurrency(item.amount)}</span>
                   </div>
                 ))}
                 <div className="flex justify-between py-4 border-t-4 border-black text-xl font-bold">
                   <span>TOTAL</span>
                   <span>{formatCurrency(calculateTotal(activeJob.costItems))}</span>
                 </div>
               </div>
               
               {/* Add Cost Form */}
               <div className="bg-gray-100 p-4 border-2 border-black">
                 <h4 className="font-bold mb-2 text-sm">ADD NEW ITEM</h4>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <input 
                      type="text" 
                      placeholder="Item Description" 
                      className="flex-grow p-2 border-2 border-black focus:outline-none"
                      value={costDesc}
                      onChange={(e) => setCostDesc(e.target.value)}
                   />
                   <input 
                      type="number" 
                      placeholder="Amount" 
                      className="w-full sm:w-32 p-2 border-2 border-black focus:outline-none"
                      value={costAmount}
                      onChange={(e) => setCostAmount(e.target.value)}
                   />
                   <NeoButton 
                     size="sm" 
                     onClick={() => {
                        if(costDesc && costAmount) {
                          handleAddCost(activeJob.id, costDesc, parseInt(costAmount));
                          setCostDesc('');
                          setCostAmount('');
                        }
                     }}
                   >
                     ADD
                   </NeoButton>
                 </div>
               </div>
            </NeoCard>

            <NeoCard title="WORK LOGS">
               <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                 {activeJob.logs.map((log) => (
                    <div key={log.id} className="flex gap-3 items-start">
                       <span className="bg-black text-white text-xs px-1 py-0.5">{log.timestamp}</span>
                       <span className="text-sm font-mono">{log.message}</span>
                    </div>
                 ))}
               </div>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-grow p-3 border-4 border-black focus:outline-none"
                    placeholder="Type log update..."
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && logInput) {
                        handleAddLog(activeJob.id, logInput);
                        setLogInput('');
                      }
                    }}
                  />
                  <NeoButton onClick={() => {
                     if(logInput) {
                       handleAddLog(activeJob.id, logInput);
                       setLogInput('');
                     }
                  }}>
                    POST
                  </NeoButton>
               </div>
            </NeoCard>
          </div>
        </div>
      </div>
    );
  };

  const NewJobForm = () => (
    <div className="max-w-xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
       <NeoCard title="OPEN NEW JOB CARD" className="w-full relative">
         <button 
           onClick={() => setView('MECHANIC_DASHBOARD')}
           className="absolute top-4 right-4 font-bold text-red-600 hover:text-red-800"
         >X</button>
         
         <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">License Plate</label>
              <input 
                type="text" 
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none uppercase"
                placeholder="e.g. UBA 123A"
                value={newJobForm.plateNumber}
                onChange={(e) => setNewJobForm({...newJobForm, plateNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Car Model</label>
              <input 
                type="text" 
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
                placeholder="e.g. Toyota Spacio"
                value={newJobForm.carModel}
                onChange={(e) => setNewJobForm({...newJobForm, carModel: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Owner Name</label>
              <input 
                type="text" 
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
                value={newJobForm.ownerName}
                onChange={(e) => setNewJobForm({...newJobForm, ownerName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Issue Description</label>
              <textarea 
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none h-24"
                value={newJobForm.primaryIssue}
                onChange={(e) => setNewJobForm({...newJobForm, primaryIssue: e.target.value})}
              />
            </div>

            <NeoButton 
              fullWidth 
              className="bg-black text-white hover:bg-gray-800 mt-4" 
              onClick={handleCreateJob}
            >
              CREATE JOB CARD
            </NeoButton>
         </div>
       </NeoCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-mk-bg text-black pb-10">
      <Header />
      <main className="mt-6">
        {view === 'LANDING' && <LandingView />}
        {view === 'DRIVER_STATUS' && <DriverStatusView />}
        {view === 'MECHANIC_DASHBOARD' && <MechanicDashboard />}
        {view === 'MECHANIC_JOB_DETAIL' && <MechanicJobDetail />}
        {view === 'MECHANIC_NEW_JOB' && <NewJobForm />}
      </main>

      <footer className="text-center py-8 text-xs font-mono text-gray-400">
        <p>BUILT FOR KAMPALA'S HARDEST ROADS.</p>
        <p className="mt-1">CONCEPT BY MAKANIKA LTD.</p>
      </footer>
    </div>
  );
}