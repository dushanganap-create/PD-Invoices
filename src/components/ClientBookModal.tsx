import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ClientContact } from '../types/auth';
import { ClientInfo } from '../types/invoice';
import {
  getClientDirectory,
  saveClientContact,
  deleteClientContact,
} from '../utils/authStorage';

interface ClientBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyClient: (client: ClientInfo) => void;
}

export const ClientBookModal: React.FC<ClientBookModalProps> = ({
  isOpen,
  onClose,
  onApplyClient,
}) => {
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // New client form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [vatNumber, setVatNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setClients(getClientDirectory());
      setIsAddingNew(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !company) return;

    const newContact: ClientContact = {
      id: `cli_${Date.now()}`,
      name: name || company,
      company: company || name,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      vatNumber,
    };

    const updated = saveClientContact(newContact);
    setClients(updated);
    setIsAddingNew(false);
    // Reset form
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setPostalCode('');
    setVatNumber('');
  };

  const handleApply = (c: ClientContact) => {
    const clientInfo: ClientInfo = {
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      postalCode: c.postalCode,
      country: c.country,
      poNumber: c.vatNumber,
    };
    onApplyClient(clientInfo);
    setAppliedId(c.id);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteClientContact(id);
    setClients(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Client Address Book (CRM)
              </h2>
              <p className="text-[11px] text-neutral-400">
                1-click auto-fill client details into your current invoice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isAddingNew ? (
            <form onSubmit={handleSaveNewClient} className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-white">Add New Client Contact</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Horizon Labs Inc."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@horizonlabs.com"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-neutral-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="100 Innovation Way, Suite 400"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
              >
                Save Contact
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleApply(c)}
                  className="p-4 bg-neutral-950 border border-neutral-800 hover:border-emerald-500/70 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {c.name}
                      </span>
                      {c.company && (
                        <span className="text-xs text-neutral-400 font-medium">
                          ({c.company})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-3">
                      {c.email && (
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-neutral-500" />
                          {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          {c.phone}
                        </span>
                      )}
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          {c.city}, {c.country}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(c);
                      }}
                      className="px-3 py-1.5 bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      {appliedId === c.id ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{appliedId === c.id ? 'Applied!' : 'Use on Invoice'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Credit & Watermark */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Address Book Directory
          </span>
          <span className="font-semibold text-neutral-300">
            Made By Pasindu Dushangana
          </span>
        </div>
      </div>
    </div>
  );
};
