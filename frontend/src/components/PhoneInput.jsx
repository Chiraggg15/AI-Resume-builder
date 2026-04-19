import { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+977', country: 'Nepal', flag: '🇳🇵', maxLength: 10 },
  { code: '+91', country: 'India', flag: '🇮🇳', maxLength: 10 },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸', maxLength: 10 },
  { code: '+44', country: 'UK', flag: '🇬🇧', maxLength: 11 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', maxLength: 10 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', maxLength: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', maxLength: 9 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', maxLength: 11 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', maxLength: 12 },
  { code: '+33', country: 'France', flag: '🇫🇷', maxLength: 10 },
  { code: '+86', country: 'China', flag: '🇨🇳', maxLength: 11 },
];

/**
 * PhoneInput Component
 * --------------------
 * A specialized input for phone numbers with country code selection.
 * Integrates seamlessly with the Luminary glassmorphism design system.
 */
export default function PhoneInput({ value = '', onChange, label }) {
  // Logic to split the combined string value into [code, number]
  const parseValue = (val) => {
    if (!val) return { code: '+977', number: '' };
    
    // Check if the value starts with one of our codes
    const found = COUNTRY_CODES.find(c => val.startsWith(c.code));
    if (found) {
      const numberPart = val.slice(found.code.length).trim();
      return { code: found.code, number: numberPart, maxLength: found.maxLength };
    }
    
    // Generic fallback for +XXX numbers
    const match = val.match(/^(\+\d+)\s?(.*)$/);
    if (match) return { code: match[1], number: match[2], maxLength: 15 };
    
    return { code: '+977', number: val, maxLength: 10 };
  };

  const [internal, setInternal] = useState(parseValue(value));

  // Update internal state when external value changes (for restores/init)
  useEffect(() => {
    const parsed = parseValue(value);
    if (parsed.code !== internal.code || parsed.number !== internal.number) {
      setInternal(parsed);
    }
  }, [value]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const countryInfo = COUNTRY_CODES.find(c => c.code === newCode);
    setInternal(prev => {
      // If switching country, we might need to truncate the existing number
      const trimmedNumber = prev.number.slice(0, countryInfo?.maxLength || 15);
      const newState = { ...prev, code: newCode, maxLength: countryInfo?.maxLength || 15, number: trimmedNumber };
      onChange?.(`${newState.code} ${newState.number}`.trim());
      return newState;
    });
  };

  const handleNumberChange = (e) => {
    // Only allow digits
    const newNum = e.target.value.replace(/\D/g, '');
    const currentMaxLength = internal.maxLength || 15;
    
    if (newNum.length <= currentMaxLength) {
      setInternal(prev => {
        const newState = { ...prev, number: newNum };
        onChange?.(`${newState.code} ${newState.number}`.trim());
        return newState;
      });
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="label-glass flex items-center gap-1.5">
          <Phone size={12} className="text-emerald-500" /> {label}
        </label>
      )}
      <div className="flex gap-2">
        {/* Country Code Selection */}
        <div className="relative shrink-0 w-32">
          <select
            value={internal.code}
            onChange={handleCodeChange}
            className="input-glass appearance-none cursor-pointer pr-9 text-sm"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={internal.number}
          onChange={handleNumberChange}
          placeholder={internal.code === '+977' ? '980-0000000' : 'Number'}
          maxLength={internal.maxLength || 15}
          className="input-glass flex-1 font-mono tracking-wider"
        />
      </div>
    </div>
  );
}
