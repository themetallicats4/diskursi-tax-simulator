import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useFormData } from '../store';
import { Car, Cigarette, Wine } from 'lucide-react';
import { motion } from 'motion/react';

export default function IndirectTaxStep() {
  const navigate = useNavigate();
  const { data, updateData } = useFormData();
  const [extras, setExtras] = useState(data.extras);

  const handleToggle = (field: keyof typeof extras) => {
    const newExtras = { ...extras, [field]: !extras[field] };
    setExtras(newExtras);
    updateData('extras', newExtras);
  };

  const handleContinue = () => {
    navigate('/toplam');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <h2
          className="mb-2"
          style={{
            color: '#2E2E2E',
            fontSize: '1.5rem',
            fontWeight: '600',
          }}
        >
          Harcarken de vergi ödüyorsun
        </h2>

        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Aşağıdakilerden hangisi senin için geçerli?
        </p>

        {/* Car */}
        <button
          onClick={() => handleToggle('hasCar')}
          className="w-full p-6 rounded-2xl mb-4 transition-all text-left flex items-center gap-4"
          style={{
            backgroundColor: extras.hasCar ? '#FEE2E2' : '#F9FAFB',
            border: extras.hasCar ? '2px solid #B91C1C' : '1px solid #E5E7EB',
          }}
        >
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: extras.hasCar ? '#B91C1C' : '#E5E7EB',
            }}
          >
            <Car size={24} style={{ color: extras.hasCar ? '#FFFFFF' : '#6B7280' }} />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: extras.hasCar ? '#B91C1C' : '#2E2E2E',
                fontWeight: '600',
              }}
            >
              Arabam var
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              ÖTV, MTV, akaryakıt vergileri
            </p>
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: extras.hasCar ? '#B91C1C' : '#D1D5DB',
              backgroundColor: extras.hasCar ? '#B91C1C' : 'transparent',
            }}
          >
            {extras.hasCar && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            )}
          </div>
        </button>

        {/* Smoking */}
        <button
          onClick={() => handleToggle('smoker')}
          className="w-full p-6 rounded-2xl mb-4 transition-all text-left flex items-center gap-4"
          style={{
            backgroundColor: extras.smoker ? '#FEE2E2' : '#F9FAFB',
            border: extras.smoker ? '2px solid #B91C1C' : '1px solid #E5E7EB',
          }}
        >
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: extras.smoker ? '#B91C1C' : '#E5E7EB',
            }}
          >
            <Cigarette size={24} style={{ color: extras.smoker ? '#FFFFFF' : '#6B7280' }} />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: extras.smoker ? '#B91C1C' : '#2E2E2E',
                fontWeight: '600',
              }}
            >
              Sigara kullanıyorum
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              Yüksek ÖTV oranı
            </p>
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: extras.smoker ? '#B91C1C' : '#D1D5DB',
              backgroundColor: extras.smoker ? '#B91C1C' : 'transparent',
            }}
          >
            {extras.smoker && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            )}
          </div>
        </button>

        {/* Alcohol */}
        <button
          onClick={() => handleToggle('alcohol')}
          className="w-full p-6 rounded-2xl transition-all text-left flex items-center gap-4"
          style={{
            backgroundColor: extras.alcohol ? '#FEE2E2' : '#F9FAFB',
            border: extras.alcohol ? '2px solid #B91C1C' : '1px solid #E5E7EB',
          }}
        >
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: extras.alcohol ? '#B91C1C' : '#E5E7EB',
            }}
          >
            <Wine size={24} style={{ color: extras.alcohol ? '#FFFFFF' : '#6B7280' }} />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: extras.alcohol ? '#B91C1C' : '#2E2E2E',
                fontWeight: '600',
              }}
            >
              Alkol tüketiyorum
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              Yüksek ÖTV oranı
            </p>
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: extras.alcohol ? '#B91C1C' : '#D1D5DB',
              backgroundColor: extras.alcohol ? '#B91C1C' : 'transparent',
            }}
          >
            {extras.alcohol && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            )}
          </div>
        </button>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-2xl transition-all"
        style={{
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          fontWeight: '600',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#991B1B';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#DC2626';
        }}
      >
        Sonuçları Gör
      </button>
    </motion.div>
  );
}
