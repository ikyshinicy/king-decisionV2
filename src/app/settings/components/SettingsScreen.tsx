'use client';

import React, { useState, useEffect } from 'react';

import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import {
  saveApiKey,
  fetchApiKeyStatuses,
  deleteApiKey,
  maskKey,
  type AIProvider,
  type ApiKeyStatus,
} from '@/lib/apiKeyService';
import { useLanguage } from '@/components/LanguageProvider';

type SettingsTab = 'workspace' | 'aiconfig' | 'audio' | 'apikeys' | 'about';

// TABS are now defined inside SettingsScreen using t translations

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      style={{
        background: checked ? 'var(--gold)' : 'var(--muted)',
      }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  );
}

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
}

function Slider({ value, onChange, min, max, step = 1, color = 'var(--gold)' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-full h-4 flex items-center">
      <div
        className="w-full h-1.5 rounded-full relative"
        style={{ background: 'var(--muted)' }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute w-3.5 h-3.5 rounded-full border-2 shadow-sm"
        style={{
          left: `calc(${pct}% - 7px)`,
          background: 'var(--card)',
          borderColor: color,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 last:border-0" style={{ borderBottom: '1px solid #e8e0d0' }}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold" style={{ color: '#111111' }}>{label}</div>
        {description && (
          <div className="text-[11px] font-semibold mt-0.5 leading-relaxed" style={{ color: '#888888' }}>
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-5"
      style={{ background: '#ffffff', border: '3px solid #111111', boxShadow: '4px 4px 0px #111111' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '2px solid #111111', background: '#f5c800' }}>
        <h3 className="text-sm font-extrabold" style={{ color: '#111111' }}>{title}</h3>
        {subtitle && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#444444' }}>{subtitle}</p>
        )}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Auto/Custom Mode Toggle Banner
// ─────────────────────────────────────────────
interface AutoToggleBannerProps {
  isAuto: boolean;
  onChange: (v: boolean) => void;
  autoLabel?: string;
  autoDesc?: string;
}

function AutoToggleBanner({ isAuto, onChange, autoLabel = 'Mode Auto', autoDesc = 'Sistem mengatur otomatis' }: AutoToggleBannerProps) {
  const { t } = useLanguage();
  return (
    <div
      className="rounded-2xl overflow-hidden mb-5"
      style={{ background: '#ffffff', border: '3px solid #111111', boxShadow: '4px 4px 0px #111111' }}
    >
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isAuto ? '#f5c800' : '#f0f0f0', border: '2px solid #111111' }}
          >
            {isAuto ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-[13px] font-extrabold" style={{ color: '#111111' }}>
              {isAuto ? autoLabel : t.customMode}
            </div>
            <div className="text-[10px] font-semibold" style={{ color: '#888888' }}>
              {isAuto ? autoDesc : t.customModeDesc}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold" style={{ color: isAuto ? '#888' : '#111' }}>Custom</span>
          <Toggle checked={isAuto} onChange={onChange} />
          <span className="text-[10px] font-bold" style={{ color: isAuto ? '#111' : '#888' }}>Auto</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// API Keys Tab Component
// ─────────────────────────────────────────────

const PROVIDER_META: Record<string, { name: string; color: string; placeholder: string; hint: string }> = {
  openai: {
    name: 'OpenAI',
    color: 'var(--gpt)',
    placeholder: 'sk-...',
    hint: 'Mulai dengan sk- atau sk-proj-',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    color: 'var(--claude)',
    placeholder: 'sk-ant-...',
    hint: 'Mulai dengan sk-ant-',
  },
  gemini: {
    name: 'Google Gemini',
    color: 'var(--gemini)',
    placeholder: 'AIza...',
    hint: 'Mulai dengan AIza',
  },
};

interface MinisterConfig {
  personality: number;
  verbosity: number;
  boldness: number;
  enabled: boolean;
}

// ─────────────────────────────────────────────
// AI Character Types
// ─────────────────────────────────────────────
interface AICharacter {
  id: string;
  name: string;
  role: string;
  model: string;
  provider: string;
  color: string;
  description: string;
  traits: string[];
  isBuiltIn: boolean;
}

const DEFAULT_CHARACTERS: AICharacter[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    role: 'Menteri Inovasi',
    model: 'gemini-1.5-pro',
    provider: 'gemini',
    color: '#1a73e8',
    description: 'Spesialis ide kreatif dan peluang inovasi',
    traits: ['Kreatif', 'Optimistis', 'Visioner'],
    isBuiltIn: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    role: 'Menteri Realitas',
    model: 'claude-3-5-sonnet',
    provider: 'anthropic',
    color: '#c0392b',
    description: 'Analis risiko dan evaluasi kritis',
    traits: ['Analitis', 'Hati-hati', 'Detail'],
    isBuiltIn: true,
  },
  {
    id: 'gpt',
    name: 'GPT',
    role: 'Menteri Eksekusi',
    model: 'gpt-4o',
    provider: 'openai',
    color: '#10b981',
    description: 'Perencana aksi dan langkah konkret',
    traits: ['Pragmatis', 'Terstruktur', 'Cepat'],
    isBuiltIn: true,
  },
];

const COLOR_PRESETS = [
  '#f5c800', '#1a73e8', '#c0392b', '#10b981', '#8b5cf6',
  '#f97316', '#ec4899', '#06b6d4', '#84cc16', '#6366f1',
];

// ─────────────────────────────────────────────
// Character Form Modal
// ─────────────────────────────────────────────
interface CharacterFormProps {
  character?: AICharacter | null;
  onSave: (char: AICharacter) => void;
  onClose: () => void;
}

function CharacterForm({ character, onSave, onClose }: CharacterFormProps) {
  const { t } = useLanguage();
  const isEdit = !!character;
  const [name, setName] = useState(character?.name ?? '');
  const [role, setRole] = useState(character?.role ?? '');
  const [model, setModel] = useState(character?.model ?? '');
  const [provider, setProvider] = useState(character?.provider ?? '');
  const [color, setColor] = useState(character?.color ?? '#f5c800');
  const [description, setDescription] = useState(character?.description ?? '');
  const [traitsInput, setTraitsInput] = useState(character?.traits.join(', ') ?? '');

  const handleSubmit = () => {
    if (!name.trim() || !model.trim() || !provider.trim()) {
      toast.error(t.characterName.replace(' *', '') + ', ' + t.characterModel.replace(' *', '') + ', ' + t.characterProvider.replace(' *', ''));
      return;
    }
    const traits = traitsInput.split(',').map((tr) => tr.trim()).filter(Boolean);
    onSave({
      id: character?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Menteri AI',
      model: model.trim(),
      provider: provider.trim().toLowerCase(),
      color,
      description: description.trim(),
      traits: traits.length > 0 ? traits : ['AI'],
      isBuiltIn: character?.isBuiltIn ?? false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '3px solid #111111', boxShadow: '6px 6px 0px #111111' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '2px solid #111111', background: '#f5c800' }}>
          <h3 className="text-sm font-extrabold" style={{ color: '#111111' }}>
            {isEdit ? t.editCharacterTitle : t.createCharacterTitle}
          </h3>
          <button onClick={onClose} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.characterNamePlaceholder}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterRole}</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t.characterRolePlaceholder}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
          </div>

          {/* Provider */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterProvider}</label>
            <input
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder={t.characterProviderPlaceholder}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
            <p className="text-[10px] mt-1" style={{ color: '#aaa' }}>
              {t.characterProviderHint}
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterModel}</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t.characterModelPlaceholder}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterDescription}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.characterDescriptionPlaceholder}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all resize-none"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
          </div>

          {/* Traits */}
          <div>
            <label className="text-[11px] font-extrabold block mb-1" style={{ color: '#111111' }}>{t.characterTraits}</label>
            <input
              value={traitsInput}
              onChange={(e) => setTraitsInput(e.target.value)}
              placeholder={t.characterTraitsPlaceholder}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
              style={{ background: '#faf6ee', border: '2px solid #e8e0d0', color: '#111111' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f5c800'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-extrabold block mb-2" style={{ color: '#111111' }}>{t.characterColor}</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-lg transition-all cursor-pointer"
                  style={{
                    background: c,
                    border: color === c ? '3px solid #111111' : '2px solid transparent',
                    boxShadow: color === c ? '2px 2px 0px #111111' : 'none',
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                style={{ border: '2px solid #e8e0d0' }}
                title={t.characterColor}
              />
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#faf6ee', border: '2px solid #e8e0d0' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
              style={{ background: color, color: '#fff', border: '2px solid #111111' }}
            >
              {name ? name[0].toUpperCase() : '?'}
            </div>
            <div>
              <div className="text-[12px] font-extrabold" style={{ color }}>
                {name || t.characterPreview}
              </div>
              <div className="text-[10px]" style={{ color: '#888' }}>
                {role || t.characterRole} · {model || 'model'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2" style={{ borderTop: '2px solid #e8e0d0' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-extrabold cursor-pointer transition-all"
            style={{ background: '#f0f0f0', border: '2px solid #111111', color: '#111111' }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-extrabold cursor-pointer transition-all"
            style={{ background: '#f5c800', border: '2px solid #111111', color: '#111111', boxShadow: '3px 3px 0px #111111' }}
          >
            {isEdit ? t.saveChanges : t.createCharacterBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace');
  const [isSaving, setIsSaving] = useState(false);

  // Workspace settings
  const [autoSave, setAutoSave] = useState(true);
  const [responseLanguage, setResponseLanguage] = useState('id');
  const [sessionNaming, setSessionNaming] = useState('auto');
  const [showParticles, setShowParticles] = useState(true);
  const [tableAnimation, setTableAnimation] = useState(true);

  // Minister configs
  const [ministers, setMinisters] = useState<Record<string, MinisterConfig>>({
    gemini: { personality: 75, verbosity: 60, boldness: 80, enabled: true },
    claude: { personality: 65, verbosity: 70, boldness: 55, enabled: true },
    gpt: { personality: 70, verbosity: 55, boldness: 85, enabled: true },
  });

  // AI Config — Auto/Custom mode toggles
  const [ministerAutoMode, setMinisterAutoMode] = useState(false);
  const [debateAutoMode, setDebateAutoMode] = useState(false);

  // Debate settings
  const [debateRounds, setDebateRounds] = useState(3);
  const [autoVerdict, setAutoVerdict] = useState(true);
  const [allowDisagreement, setAllowDisagreement] = useState(true);
  const [responseDelay, setResponseDelay] = useState(800);
  const [debateIntensity, setDebateIntensity] = useState(65);

  // Audio settings
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notifyOnVerdict, setNotifyOnVerdict] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(50);

  // AI Characters
  const [characters, setCharacters] = useState<AICharacter[]>(DEFAULT_CHARACTERS);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AICharacter | null>(null);

  // API Key state — dynamic, supports custom providers
  const [apiKeyStatuses, setApiKeyStatuses] = useState<ApiKeyStatus[]>([
    { provider: 'openai', isSet: false },
    { provider: 'anthropic', isSet: false },
    { provider: 'gemini', isSet: false },
  ]);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({
    openai: '',
    anthropic: '',
    gemini: '',
  });
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [apiKeySaving, setApiKeySaving] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [apiKeyDeleting, setApiKeyDeleting] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'apikeys') {
      loadApiKeyStatuses();
    }
  }, [activeTab]);

  const loadApiKeyStatuses = async () => {
    setApiKeyLoading(true);
    try {
      const statuses = await fetchApiKeyStatuses();
      // Merge with custom provider statuses
      const customProviders = characters
        .filter((c) => !c.isBuiltIn)
        .map((c) => c.provider)
        .filter((p, i, arr) => arr.indexOf(p) === i);
      const allStatuses = [...statuses];
      customProviders.forEach((p) => {
        if (!allStatuses.find((s) => s.provider === p)) {
          allStatuses.push({ provider: p as AIProvider, isSet: false });
        }
      });
      setApiKeyStatuses(allStatuses);
    } catch {
      toast.error('Gagal memuat status API key');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const handleSaveApiKey = async (provider: string) => {
    const key = apiKeyInputs[provider]?.trim();
    if (!key) {
      toast.error('Masukkan API key terlebih dahulu');
      return;
    }
    setApiKeySaving((prev) => ({ ...prev, [provider]: true }));
    try {
      await saveApiKey({ provider: provider as AIProvider, apiKey: key });
      setApiKeyInputs((prev) => ({ ...prev, [provider]: '' }));
      setApiKeyStatuses((prev) =>
        prev.map((s) =>
          s.provider === provider
            ? { ...s, isSet: true, maskedKey: maskKey(key), updatedAt: new Date().toISOString() }
            : s
        )
      );
      const providerName = PROVIDER_META[provider]?.name ?? provider.toUpperCase();
      toast.success(`API key ${providerName} berhasil disimpan`);
    } catch {
      toast.error('Gagal menyimpan API key. Coba lagi.');
    } finally {
      setApiKeySaving((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleDeleteApiKey = async (provider: string) => {
    setApiKeyDeleting((prev) => ({ ...prev, [provider]: true }));
    try {
      await deleteApiKey(provider as AIProvider);
      setApiKeyStatuses((prev) =>
        prev.map((s) =>
          s.provider === provider ? { ...s, isSet: false, maskedKey: undefined, updatedAt: undefined } : s
        )
      );
      const providerName = PROVIDER_META[provider]?.name ?? provider.toUpperCase();
      toast.success(`API key ${providerName} dihapus`);
    } catch {
      toast.error('Gagal menghapus API key');
    } finally {
      setApiKeyDeleting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Handle saving a new or edited character
  const handleSaveCharacter = (char: AICharacter) => {
    setCharacters((prev) => {
      const exists = prev.find((c) => c.id === char.id);
      if (exists) {
        return prev.map((c) => (c.id === char.id ? char : c));
      }
      return [...prev, char];
    });

    // Auto-add API key entry for new provider if not already present
    const providerExists = apiKeyStatuses.find((s) => s.provider === char.provider);
    if (!providerExists) {
      setApiKeyStatuses((prev) => [...prev, { provider: char.provider as AIProvider, isSet: false }]);
      setApiKeyInputs((prev) => ({ ...prev, [char.provider]: '' }));
      setApiKeyVisible((prev) => ({ ...prev, [char.provider]: false }));
      setApiKeySaving((prev) => ({ ...prev, [char.provider]: false }));
      setApiKeyDeleting((prev) => ({ ...prev, [char.provider]: false }));
      toast.success(`Karakter "${char.name}" dibuat! API key untuk provider "${char.provider}" otomatis ditambahkan di tab API Keys.`);
    } else {
      toast.success(`Karakter "${char.name}" ${editingCharacter ? 'diperbarui' : 'dibuat'}!`);
    }

    setShowCharacterForm(false);
    setEditingCharacter(null);
  };

  const handleDeleteCharacter = (charId: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== charId));
    toast.success('Karakter dihapus');
  };

  const updateMinister = (
    minister: string,
    field: keyof MinisterConfig,
    value: number | boolean
  ) => {
    setMinisters((prev) => ({
      ...prev,
      [minister]: { ...prev[minister], [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success('Pengaturan berhasil disimpan');
  };

  // Build minister display from characters
  const MINISTER_DISPLAY = characters.map((c) => ({
    key: c.id,
    name: c.name,
    role: c.role,
    color: c.color,
    traits: c.traits,
  }));

  // Ensure minister config exists for all characters
  useEffect(() => {
    setMinisters((prev) => {
      const updated = { ...prev };
      characters.forEach((c) => {
        if (!updated[c.id]) {
          updated[c.id] = { personality: 70, verbosity: 60, boldness: 70, enabled: true };
        }
      });
      return updated;
    });
  }, [characters]);

  const TABS: { key: SettingsTab; icon: string; labelKey: keyof typeof t }[] = [
    { key: 'workspace', icon: 'LayoutDashboardIcon', labelKey: 'tabWorkspace' },
    { key: 'aiconfig', icon: 'BotIcon', labelKey: 'tabAiConfig' },
    { key: 'audio', icon: 'Volume2Icon', labelKey: 'tabAudio' },
    { key: 'apikeys', icon: 'KeyIcon', labelKey: 'tabApiKeys' },
    { key: 'about', icon: 'InfoIcon', labelKey: 'tabAbout' },
  ];

  return (
    <div className="h-screen flex overflow-hidden halftone-bg" style={{ background: '#faf6ee' }}>
      {/* Settings sidebar */}
      <div
        className="w-[220px] min-w-[220px] h-full flex flex-col overflow-hidden"
        style={{ background: '#ffffff', borderRight: '3px solid #111111' }}
      >
        <div className="px-4 py-5" style={{ borderBottom: '3px solid #111111', background: '#f5c800' }}>
          <h2 className="text-sm font-extrabold" style={{ color: '#111111' }}>{t.settingsTitle}</h2>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#444444' }}>
            {t.settingsSubtitle}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-royal px-2 py-3">
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <li key={`settings-tab-${tab.key}`}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-150 cursor-pointer text-left"
                    style={{
                      background: isActive ? '#f5c800' : 'transparent',
                      color: isActive ? '#111111' : '#666666',
                      border: isActive ? '2px solid #111111' : '2px solid transparent',
                      boxShadow: isActive ? '2px 2px 0px #111111' : 'none',
                    }}
                  >
                    <Icon
                      name={tab.icon as Parameters<typeof Icon>[0]['name']}
                      size={14}
                      className="text-current flex-shrink-0"
                    />
                    {t[tab.labelKey] as string}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3" style={{ borderTop: '3px solid #111111' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl text-[12px] font-extrabold btn-royal transition-all duration-150 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div
                  className="w-3 h-3 rounded-full border-2 border-current border-t-transparent"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
                {t.saving}
              </>
            ) : (
              <>
                <Icon name="CheckIcon" size={13} className="text-current" />
                {t.saveAll}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto scrollbar-royal px-8 py-6">
        <div className="max-w-2xl">
          {/* Workspace tab */}
          {activeTab === 'workspace' && (
            <div>
              <div className="mb-6">
                <h2 className="font-comic text-2xl font-bold mb-1" style={{ color: '#111111' }}>{t.workspaceTitle}</h2>
                <p className="text-sm font-semibold" style={{ color: '#666666' }}>
                  {t.workspaceDesc}
                </p>
              </div>

              <SectionCard title={t.sectionSessionStorage}>
                <SettingRow label={t.autoSave} description={t.autoSaveDesc}>
                  <Toggle checked={autoSave} onChange={setAutoSave} />
                </SettingRow>
                <SettingRow label={t.sessionNaming} description={t.sessionNamingDesc}>
                  <select
                    value={sessionNaming}
                    onChange={(e) => setSessionNaming(e.target.value)}
                    className="bg-input border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="auto">{t.namingAuto}</option>
                    <option value="manual">{t.namingManual}</option>
                    <option value="date">{t.namingDate}</option>
                  </select>
                </SettingRow>
                <SettingRow label={t.responseLanguage} description={t.responseLanguageDesc}>
                  <select
                    value={responseLanguage}
                    onChange={(e) => setResponseLanguage(e.target.value)}
                    className="bg-input border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="id">{t.langIndonesia}</option>
                    <option value="en">{t.langEnglish}</option>
                    <option value="mixed">{t.langMixed}</option>
                  </select>
                </SettingRow>
              </SectionCard>

              <SectionCard title={t.sectionDisplay}>
                <SettingRow label={t.ambientParticles} description={t.ambientParticlesDesc}>
                  <Toggle checked={showParticles} onChange={setShowParticles} />
                </SettingRow>
                <SettingRow label={t.tableAnimation} description={t.tableAnimationDesc}>
                  <Toggle checked={tableAnimation} onChange={setTableAnimation} />
                </SettingRow>
              </SectionCard>

              <SectionCard title={t.sectionDataPrivacy} subtitle={t.sectionDataPrivacySubtitle}>
                <SettingRow label={t.saveHistory} description={t.saveHistoryDesc}>
                  <Toggle checked onChange={() => {}} />
                </SettingRow>
                <SettingRow label={t.deleteAllHistory} description={t.deleteAllHistoryDesc}>
                  <button
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      background: 'rgba(192,57,43,0.1)',
                      border: '1px solid rgba(192,57,43,0.25)',
                      color: 'var(--claude)',
                    }}
                    onClick={() => toast.error(t.deleteHistory)}
                  >
                    {t.deleteHistory}
                  </button>
                </SettingRow>
              </SectionCard>
            </div>
          )}

          {/* AI Config tab (merged ministers + debate + character management) */}
          {activeTab === 'aiconfig' && (
            <div>
              <div className="mb-6">
                <h2 className="font-comic text-2xl font-bold mb-1" style={{ color: '#111111' }}>{t.aiConfigTitle}</h2>
                <p className="text-sm font-semibold" style={{ color: '#666666' }}>
                  {t.aiConfigDesc}
                </p>
              </div>

              {/* ── Section 1: AI Characters ── */}
              <div
                className="rounded-2xl overflow-hidden mb-5"
                style={{ background: '#ffffff', border: '3px solid #111111', boxShadow: '4px 4px 0px #111111' }}
              >
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '2px solid #111111', background: '#f5c800' }}
                >
                  <div>
                    <h3 className="text-sm font-extrabold" style={{ color: '#111111' }}>{t.aiCharacters}</h3>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#444444' }}>
                      {t.aiCharactersDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditingCharacter(null); setShowCharacterForm(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all"
                    style={{ background: '#111111', color: '#f5c800', border: '2px solid #111111', boxShadow: '2px 2px 0px #555' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {t.createCharacter}
                  </button>
                </div>
                <div className="px-5 py-3 space-y-3">
                  {characters.map((char) => (
                    <div
                      key={`char-${char.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: '#faf6ee', border: '2px solid #e8e0d0' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                        style={{ background: char.color, color: '#fff', border: '2px solid #111111' }}
                      >
                        {char.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-extrabold" style={{ color: char.color }}>{char.name}</span>
                          {char.isBuiltIn && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                              style={{ background: '#f5c800', color: '#111', border: '1px solid #111' }}
                            >
                              {t.builtIn}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px]" style={{ color: '#888' }}>
                          {char.role} · {char.model} · {char.provider}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => { setEditingCharacter(char); setShowCharacterForm(true); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                          style={{ background: '#f0f0f0', border: '1.5px solid #ccc' }}
                          title={t.editCharacter}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {!char.isBuiltIn && (
                          <button
                            onClick={() => handleDeleteCharacter(char.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                            style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.3)' }}
                            title={t.deleteCharacter}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section 2: Konfigurasi Menteri (Auto/Custom) ── */}
              <div className="mb-2">
                <h3 className="text-[13px] font-extrabold mb-3" style={{ color: '#111111' }}>{t.ministerPersonality}</h3>
              </div>

              <AutoToggleBanner
                isAuto={ministerAutoMode}
                onChange={setMinisterAutoMode}
                autoLabel={t.autoModePersonality}
                autoDesc={t.autoModePersonalityDesc}
              />

              {!ministerAutoMode && (
                <div>
                  {MINISTER_DISPLAY.map((m) => {
                    const cfg = ministers[m.key] ?? { personality: 70, verbosity: 60, boldness: 70, enabled: true };
                    return (
                      <div
                        key={`minister-cfg-${m.key}`}
                        className="rounded-2xl overflow-hidden mb-4"
                        style={{
                          background: '#ffffff',
                          border: '3px solid #111111',
                          boxShadow: '4px 4px 0px #111111',
                        }}
                      >
                        <div
                          className="px-5 py-4 flex items-center justify-between"
                          style={{ borderBottom: '2px solid #111111', background: '#faf6ee' }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{
                                background: m.color,
                                border: '2px solid #111111',
                                color: '#fff',
                              }}
                            >
                              {m.name[0]}
                            </div>
                            <div>
                              <div className="text-sm font-bold" style={{ color: m.color }}>
                                {m.name}
                              </div>
                              <div className="text-[10px]" style={{ color: '#888' }}>{m.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {m.traits.map((trait) => (
                                <span
                                  key={`trait-${m.key}-${trait}`}
                                  className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                                  style={{
                                    background: `${m.color}15`,
                                    color: m.color,
                                    border: `1px solid ${m.color}30`,
                                  }}
                                >
                                  {trait}
                                </span>
                              ))}
                            </div>
                            <Toggle
                              checked={cfg.enabled}
                              onChange={(v) => updateMinister(m.key, 'enabled', v)}
                            />
                          </div>
                        </div>

                        <div className="px-5 py-4 space-y-5" style={{ opacity: cfg.enabled ? 1 : 0.4 }}>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[11px] font-medium text-foreground">{t.personalityIntensity}</label>
                              <span className="text-[11px] font-bold tabular-nums" style={{ color: m.color }}>{cfg.personality}%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-2">{t.personalityIntensityDesc}</p>
                            <Slider value={cfg.personality} onChange={(v) => updateMinister(m.key, 'personality', v)} min={0} max={100} color={m.color} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[11px] font-medium text-foreground">{t.responseLength}</label>
                              <span className="text-[11px] font-bold tabular-nums" style={{ color: m.color }}>{cfg.verbosity}%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-2">{t.responseLengthDesc}</p>
                            <Slider value={cfg.verbosity} onChange={(v) => updateMinister(m.key, 'verbosity', v)} min={0} max={100} color={m.color} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[11px] font-medium text-foreground">{t.opinionBoldness}</label>
                              <span className="text-[11px] font-bold tabular-nums" style={{ color: m.color }}>{cfg.boldness}%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-2">{t.opinionBoldnessDesc}</p>
                            <Slider value={cfg.boldness} onChange={(v) => updateMinister(m.key, 'boldness', v)} min={0} max={100} color={m.color} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {ministerAutoMode && (
                <div
                  className="rounded-2xl px-5 py-4 mb-5 flex items-center gap-3"
                  style={{ background: '#faf6ee', border: '2px dashed #e8e0d0' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <p className="text-[11px] font-semibold" style={{ color: '#666' }}>
                    {t.autoModeActive}
                  </p>
                </div>
              )}

              {/* ── Section 3: Perilaku Debat (Auto/Custom) ── */}
              <div className="mb-2 mt-4">
                <h3 className="text-[13px] font-extrabold mb-3" style={{ color: '#111111' }}>{t.debateBehavior}</h3>
              </div>

              <AutoToggleBanner
                isAuto={debateAutoMode}
                onChange={setDebateAutoMode}
                autoLabel={t.autoModeDebate}
                autoDesc={t.autoModeDebateDesc}
              />

              {!debateAutoMode && (
                <div>
                  <SectionCard title={t.sectionDebateStructure}>
                    <SettingRow
                      label={t.maxDebateRounds}
                      description={t.maxDebateRoundsDesc}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDebateRounds(Math.max(1, debateRounds - 1))}
                          className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                          −
                        </button>
                        <span className="text-sm font-bold tabular-nums w-4 text-center text-foreground">
                          {debateRounds}
                        </span>
                        <button
                          onClick={() => setDebateRounds(Math.min(8, debateRounds + 1))}
                          className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                          +
                        </button>
                      </div>
                    </SettingRow>
                    <SettingRow
                      label={t.autoVerdict}
                      description={t.autoVerdictDesc}
                    >
                      <Toggle checked={autoVerdict} onChange={setAutoVerdict} />
                    </SettingRow>
                    <SettingRow
                      label={t.allowDisagreement}
                      description={t.allowDisagreementDesc}
                    >
                      <Toggle checked={allowDisagreement} onChange={setAllowDisagreement} />
                    </SettingRow>
                  </SectionCard>

                  <SectionCard title={t.sectionTimingSpeed}>
                    <SettingRow
                      label={t.responseDelay}
                      description={`${responseDelay}ms`}
                    >
                      <div className="w-40">
                        <Slider value={responseDelay} onChange={setResponseDelay} min={200} max={2000} step={100} color="var(--gold)" />
                      </div>
                    </SettingRow>
                    <SettingRow
                      label={t.debateIntensity}
                      description={`${debateIntensity}%`}
                    >
                      <div className="w-40">
                        <Slider value={debateIntensity} onChange={setDebateIntensity} min={10} max={100} color="var(--claude)" />
                      </div>
                    </SettingRow>
                  </SectionCard>

                  <SectionCard title={t.sectionVerdictFormat}>
                    <SettingRow label={t.showRisk} description={t.showRiskDesc}>
                      <Toggle checked onChange={() => {}} />
                    </SettingRow>
                    <SettingRow label={t.showOpportunity} description={t.showOpportunityDesc}>
                      <Toggle checked onChange={() => {}} />
                    </SettingRow>
                    <SettingRow label={t.showRecommendation} description={t.showRecommendationDesc}>
                      <Toggle checked onChange={() => {}} />
                    </SettingRow>
                  </SectionCard>
                </div>
              )}

              {debateAutoMode && (
                <div
                  className="rounded-2xl px-5 py-4 mb-5 flex items-center gap-3"
                  style={{ background: '#faf6ee', border: '2px dashed #e8e0d0' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <p className="text-[11px] font-semibold" style={{ color: '#666' }}>
                    {t.autoModeDebateActive}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Audio tab */}
          {activeTab === 'audio' && (
            <div>
              <div className="mb-6">
                <h2 className="font-comic text-lg font-bold text-foreground mb-1">{t.audioTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.audioDesc}
                </p>
              </div>

              <SectionCard title={t.sectionSound}>
                <SettingRow label={t.soundEffects} description={t.soundEffectsDesc}>
                  <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
                </SettingRow>
                <SettingRow label={t.ambientVolume} description={t.ambientVolumeDesc}>
                  <div className="w-32 opacity-40">
                    <Slider value={30} onChange={() => {}} min={0} max={100} color="var(--gold)" />
                  </div>
                </SettingRow>
              </SectionCard>

              <SectionCard title={t.sectionNotifications}>
                <SettingRow label={t.verdictNotification} description={t.verdictNotificationDesc}>
                  <Toggle checked={notifyOnVerdict} onChange={setNotifyOnVerdict} />
                </SettingRow>
                <SettingRow label={t.debateDoneNotification} description={t.debateDoneNotificationDesc}>
                  <Toggle onChange={() => {}} />
                </SettingRow>
              </SectionCard>

              <SectionCard title={t.sectionAnimation}>
                <SettingRow
                  label={t.animationSpeed}
                  description={`${animationSpeed}%`}
                >
                  <div className="w-40">
                    <Slider
                      value={animationSpeed}
                      onChange={setAnimationSpeed}
                      min={10}
                      max={100}
                      color="var(--gpt)"
                    />
                  </div>
                </SettingRow>
                <SettingRow label={t.reduceMotion} description={t.reduceMotionDesc}>
                  <Toggle onChange={() => {}} />
                </SettingRow>
              </SectionCard>
            </div>
          )}

          {/* API Keys tab */}
          {activeTab === 'apikeys' && (
            <ApiKeysTab
              statuses={apiKeyStatuses}
              inputs={apiKeyInputs}
              visible={apiKeyVisible}
              saving={apiKeySaving}
              deleting={apiKeyDeleting}
              loading={apiKeyLoading}
              onInputChange={(provider, value) =>
                setApiKeyInputs((prev) => ({ ...prev, [provider]: value }))
              }
              onToggleVisible={(provider) =>
                setApiKeyVisible((prev) => ({ ...prev, [provider]: !prev[provider] }))
              }
              onSave={handleSaveApiKey}
              onDelete={handleDeleteApiKey}
            />
          )}

          {/* About tab */}
          {activeTab === 'about' && (
            <div>
              <div className="mb-6">
                <h2 className="font-comic text-lg font-bold text-foreground mb-1">{t.aboutTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.aboutDesc}
                </p>
              </div>

              <div
                className="rounded-2xl p-6 mb-5 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="text-4xl mb-3">♛</div>
                <div className="font-royal text-xl font-bold text-gold mb-1">
                  KING DECISION
                </div>
                <div className="text-[11px] text-muted-foreground mb-4">
                  {t.appTagline}
                </div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: 'rgba(212,168,83,0.1)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    color: 'var(--gold)',
                  }}
                >
                  {t.appVersion}
                </div>
              </div>

              <SectionCard title={t.sectionCouncil}>
                {[
                  { name: 'Gemini', role: 'Menteri Inovasi', color: 'var(--gemini)', desc: 'Spesialis ide kreatif dan peluang inovasi' },
                  { name: 'Claude', role: 'Menteri Realitas', color: 'var(--claude)', desc: 'Analis risiko dan evaluasi kritis' },
                  { name: 'GPT', role: 'Menteri Eksekusi', color: 'var(--gpt)', desc: 'Perencana aksi dan langkah konkret' },
                ].map((m) => (
                  <SettingRow key={`about-minister-${m.name}`} label={m.name} description={m.desc}>
                    <span
                      className="text-[10px] font-medium px-2 py-1 rounded-full"
                      style={{
                        color: m.color,
                        background: `${m.color}10`,
                        border: `1px solid ${m.color}25`,
                      }}
                    >
                      {m.role}
                    </span>
                  </SettingRow>
                ))}
              </SectionCard>

              <SectionCard title={t.sectionTechnical}>
                <SettingRow label="Framework" description="Next.js 15 + TypeScript">
                  <span className="text-[10px] text-muted-foreground">React 19</span>
                </SettingRow>
                <SettingRow label="Styling" description="Tailwind CSS v3">
                  <span className="text-[10px] text-muted-foreground">Utility-first</span>
                </SettingRow>
                <SettingRow label="3D Ready" description="Slot karakter siap untuk Three.js / React Three Fiber">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      color: 'var(--gpt)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    {t.ready}
                  </span>
                </SettingRow>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      {/* Character Form Modal */}
      {showCharacterForm && (
        <CharacterForm
          character={editingCharacter}
          onSave={handleSaveCharacter}
          onClose={() => { setShowCharacterForm(false); setEditingCharacter(null); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// API Keys Tab Component (supports dynamic providers)
// ─────────────────────────────────────────────

interface ApiKeysTabProps {
  statuses: ApiKeyStatus[];
  inputs: Record<string, string>;
  visible: Record<string, boolean>;
  saving: Record<string, boolean>;
  deleting: Record<string, boolean>;
  loading: boolean;
  onInputChange: (provider: string, value: string) => void;
  onToggleVisible: (provider: string) => void;
  onSave: (provider: string) => void;
  onDelete: (provider: string) => void;
}

function ApiKeysTab({
  statuses,
  inputs,
  visible,
  saving,
  deleting,
  loading,
  onInputChange,
  onToggleVisible,
  onSave,
  onDelete,
}: ApiKeysTabProps) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-comic text-2xl font-bold mb-1" style={{ color: '#111111' }}>
          {t.apiKeysTitle}
        </h2>
        <p className="text-sm font-semibold" style={{ color: '#666666' }}>
          {t.apiKeysDesc}
        </p>
      </div>

      {/* Security notice */}
      <div
        className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
        style={{
          background: 'rgba(26,115,232,0.07)',
          border: '2px solid #1a73e8',
          boxShadow: '3px 3px 0px #111111',
        }}
      >
        <div className="mt-0.5 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-extrabold" style={{ color: '#1a73e8' }}>
            {t.apiKeySecurity}
          </p>
          <p className="text-[11px] font-semibold mt-0.5 leading-relaxed" style={{ color: '#444444' }}>
            {t.apiKeySecurityDesc}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="w-6 h-6 rounded-full border-3 border-current border-t-transparent"
            style={{ animation: 'spin 0.8s linear infinite', color: '#f5c800', borderWidth: '3px' }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {statuses.map((status) => {
            const provider = status.provider;
            const meta = PROVIDER_META[provider] ?? {
              name: provider.charAt(0).toUpperCase() + provider.slice(1),
              color: '#888888',
              placeholder: 'API key...',
              hint: `API key ${provider}`,
            };
            const isSavingKey = saving[provider] ?? false;
            const isDeletingKey = deleting[provider] ?? false;
            const inputVal = inputs[provider] ?? '';
            const isVisible = visible[provider] ?? false;
            const isCustomProvider = !PROVIDER_META[provider];

            return (
              <div
                key={`apikey-${provider}`}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#ffffff',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderBottom: '2px solid #111111', background: '#f5c800' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold"
                      style={{ background: meta.color, color: '#ffffff', border: '2px solid #111111' }}
                    >
                      {meta.name[0]}
                    </div>
                    <div>
                      <span className="text-[13px] font-extrabold" style={{ color: '#111111' }}>
                        {meta.name}
                      </span>
                      {isCustomProvider && (
                        <span
                          className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: '#111', color: '#f5c800', border: '1px solid #111' }}
                        >
                          CUSTOM
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold"
                    style={
                      status.isSet
                        ? { background: 'rgba(34,197,94,0.15)', color: '#16a34a', border: '1.5px solid #16a34a' }
                        : { background: 'rgba(156,163,175,0.15)', color: '#6b7280', border: '1.5px solid #9ca3af' }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: status.isSet ? '#16a34a' : '#9ca3af' }}
                    />
                    {status.isSet ? t.connected : t.notSet}
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4">
                  {status.isSet ? (
                    <div className="space-y-3">
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: '#faf6ee', border: '2px solid #e8e0d0' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="text-[13px] font-bold tracking-widest" style={{ color: '#555555', letterSpacing: '0.15em' }}>
                          {status.maskedKey ?? '••••••••••••••••'}
                        </span>
                        {status.updatedAt && (
                          <span className="ml-auto text-[10px] font-semibold" style={{ color: '#aaaaaa' }}>
                            {t.updatedAt} {new Date(status.updatedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onDelete(provider)}
                          disabled={isDeletingKey}
                          className="flex-1 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                          style={{
                            background: 'rgba(232,64,64,0.08)',
                            border: '2px solid var(--claude)',
                            color: 'var(--claude)',
                            boxShadow: isDeletingKey ? 'none' : '2px 2px 0px #111111',
                          }}
                        >
                          {isDeletingKey ? (
                            <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                          )}
                          {t.deleteKey}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={inputVal}
                          onChange={(e) => onInputChange(provider, e.target.value)}
                          placeholder={meta.placeholder}
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl text-[12px] font-mono outline-none transition-all"
                          style={{
                            background: '#faf6ee',
                            border: '2px solid #e8e0d0',
                            color: '#111111',
                            fontFamily: 'monospace',
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = meta.color; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0d0'; }}
                          onKeyDown={(e) => { if (e.key === 'Enter') onSave(provider); }}
                        />
                        <button
                          type="button"
                          onClick={() => onToggleVisible(provider)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                          tabIndex={-1}
                        >
                          {isVisible ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] font-semibold" style={{ color: '#aaaaaa' }}>
                        {meta.hint}
                      </p>
                      <button
                        onClick={() => onSave(provider)}
                        disabled={isSavingKey || !inputVal.trim()}
                        className="w-full py-2.5 rounded-xl text-[12px] font-extrabold transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background: '#f5c800',
                          border: '2px solid #111111',
                          color: '#111111',
                          boxShadow: isSavingKey || !inputVal.trim() ? 'none' : '3px 3px 0px #111111',
                        }}
                      >
                        {isSavingKey ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
                            {t.savingKey}
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {t.saveAndLock}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-5 px-4 py-3 rounded-xl" style={{ background: '#faf6ee', border: '2px dashed #e8e0d0' }}>
        <p className="text-[10px] font-semibold leading-relaxed" style={{ color: '#888888' }}>
          <strong style={{ color: '#555555' }}>{t.apiKeyDevNote}</strong>{' '}
          <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: '#e8e0d0', color: '#333' }}>
            src/lib/apiKeyService.ts
          </code>{' '}
          {t.apiKeyDevNoteEnd}
        </p>
      </div>
    </div>
  );
}