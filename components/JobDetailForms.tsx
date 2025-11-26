import React, { useState } from 'react';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';
import { Search, Bike } from 'lucide-react';

interface PhoneSearchFormProps {
  onSearch: (phone: string) => void;
}

export const PhoneSearchForm: React.FC<PhoneSearchFormProps> = ({ onSearch }) => {
  const [searchPhone, setSearchPhone] = useState('');

  const handleSubmit = () => {
    if (searchPhone.trim()) {
      onSearch(searchPhone);
    }
  };

  return (
    <NeoCard className="max-w-md w-full text-center">
      <div className="mb-6">
        <Bike className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-2">TRACK YOUR BODA</h2>
        <p className="font-mono text-sm text-gray-600">Enter your phone number to check repair status</p>
      </div>
      
      <input 
        type="tel" 
        placeholder="0772 123 456"
        className="w-full border-4 border-black p-4 text-center text-xl font-bold font-mono mb-4 focus:outline-none focus:ring-4 focus:ring-mk-yellow"
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      
      <button
        onClick={handleSubmit}
        className="w-full p-4 bg-mk-yellow border-4 border-black font-bold text-lg flex items-center justify-center gap-2 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all"
      >
        <Search className="w-5 h-5" /> CHECK STATUS
      </button>
      
      <div className="mt-6 text-xs text-gray-500 space-y-1">
        <p>Try: "0772123456" or "0701987654"</p>
        <p className="text-gray-400">You'll see all your repairs at this workshop</p>
      </div>
    </NeoCard>
  );
};

interface CostFormProps {
  onAddCost: (description: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

export const CostForm: React.FC<CostFormProps> = ({ onAddCost }) => {
  const [costDesc, setCostDesc] = useState('');
  const [costAmount, setCostAmount] = useState('');

  const handleSubmit = () => {
    if (costDesc && costAmount) {
      onAddCost(costDesc, parseInt(costAmount));
      setCostDesc('');
      setCostAmount('');
    }
  };

  return (
    <div className="bg-gray-100 p-4 border-2 border-black">
      <h4 className="font-bold mb-2 text-sm">ADD PART / COST</h4>
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="text" 
          placeholder="Description" 
          className="flex-grow p-2 border-2 border-black focus:outline-none"
          value={costDesc}
          onChange={(e) => setCostDesc(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Amount (UGX)" 
          className="w-full sm:w-32 p-2 border-2 border-black focus:outline-none"
          value={costAmount}
          onChange={(e) => setCostAmount(e.target.value)}
        />
        <NeoButton size="sm" onClick={handleSubmit}>
          ADD
        </NeoButton>
      </div>
    </div>
  );
};

interface LogFormProps {
  onAddLog: (message: string) => void;
}

export const LogForm: React.FC<LogFormProps> = ({ onAddLog }) => {
  const [logInput, setLogInput] = useState('');

  const handleSubmit = () => {
    if (logInput) {
      onAddLog(logInput);
      setLogInput('');
    }
  };

  return (
    <div className="flex gap-2">
      <input 
        type="text" 
        className="flex-grow p-3 border-4 border-black focus:outline-none"
        placeholder="Add update note..."
        value={logInput}
        onChange={(e) => setLogInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <NeoButton onClick={handleSubmit}>
        POST
      </NeoButton>
    </div>
  );
};

interface NewJobFormFieldsProps {
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    motorcycleModel: string;
    plateNumber: string;
    issueType: string;
    issueDescription: string;
    estimatedCost: string;
    estimatedPickup: string;
  }) => void;
  onCancel: () => void;
  issueTypes: string[];
}

export const NewJobFormFields: React.FC<NewJobFormFieldsProps> = ({ onSubmit, onCancel, issueTypes }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    motorcycleModel: '',
    plateNumber: '',
    issueType: '',
    issueDescription: '',
    estimatedCost: '',
    estimatedPickup: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      customerName: '',
      customerPhone: '',
      motorcycleModel: '',
      plateNumber: '',
      issueType: '',
      issueDescription: '',
      estimatedCost: '',
      estimatedPickup: ''
    });
  };

  const isValid = formData.customerName && formData.customerPhone && formData.motorcycleModel && formData.issueType;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Customer Name *</label>
          <input 
            type="text" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
            placeholder="e.g. John Mukasa"
            value={formData.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Phone Number *</label>
          <input 
            type="tel" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
            placeholder="e.g. 0772 123 456"
            value={formData.customerPhone}
            onChange={(e) => updateField('customerPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Motorcycle Model *</label>
          <input 
            type="text" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
            placeholder="e.g. Boxer 150, TVS Apache"
            value={formData.motorcycleModel}
            onChange={(e) => updateField('motorcycleModel', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Plate Number</label>
          <input 
            type="text" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none uppercase"
            placeholder="e.g. UDJ 234B"
            value={formData.plateNumber}
            onChange={(e) => updateField('plateNumber', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-1">Issue Type *</label>
        <select
          className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none bg-white"
          value={formData.issueType}
          onChange={(e) => updateField('issueType', e.target.value)}
        >
          <option value="">Select issue...</option>
          {issueTypes.map(issue => (
            <option key={issue} value={issue}>{issue}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-1">Issue Description</label>
        <textarea 
          className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none h-20"
          placeholder="Describe the problem..."
          value={formData.issueDescription}
          onChange={(e) => updateField('issueDescription', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Estimated Cost (UGX)</label>
          <input 
            type="number" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
            placeholder="e.g. 25000"
            value={formData.estimatedCost}
            onChange={(e) => updateField('estimatedCost', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Estimated Pickup Time</label>
          <input 
            type="text" 
            className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
            placeholder="e.g. 3:00 PM, Tomorrow"
            value={formData.estimatedPickup}
            onChange={(e) => updateField('estimatedPickup', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 border-t-2 border-gray-200">
        <button 
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full p-4 border-4 border-black font-bold text-lg flex items-center justify-center gap-2 shadow-neo transition-all
            ${isValid ? 'bg-mk-yellow hover:shadow-neo-lg hover:-translate-y-1' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          ✓ CHECK IN MOTORCYCLE
        </button>
        <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
          📱 WhatsApp message will be sent to customer
        </p>
      </div>
    </div>
  );
};
