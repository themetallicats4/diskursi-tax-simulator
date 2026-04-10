import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFormData } from '../store';
import { motion } from 'motion/react';

export default function LifestyleStep() {
  const navigate = useNavigate();
  const { data, updateData } = useFormData();
  const [lifestyle, setLifestyle] = useState(data.lifestyle);

  const total =
    lifestyle.food + lifestyle.rent + lifestyle.transport + lifestyle.other;
  const isValid = total === 100;

  const handleChange = (field: keyof typeof lifestyle, value: number) => {
    const newLifestyle = { ...lifestyle, [field]: value };
    setLifestyle(newLifestyle);
    updateData('lifestyle', newLifestyle);
  };

  const handleContinue = () => {
    if (isValid) {
      navigate('/dolayli');
    }
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
          Yaşam tarzın
        </h2>

        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Gelirini yaklaşık olarak nasıl harcıyorsun? (Toplam %100 olmalı)
        </p>

        {/* Food */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label style={{ color: '#2E2E2E', fontWeight: '500' }}>Gıda</label>
            <span style={{ color: '#F97316', fontWeight: '600' }}>
              %{lifestyle.food}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lifestyle.food}
            onChange={(e) => handleChange('food', Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #F97316 0%, #F97316 ${lifestyle.food}%, #E5E7EB ${lifestyle.food}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Rent */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label style={{ color: '#2E2E2E', fontWeight: '500' }}>Kira</label>
            <span style={{ color: '#F97316', fontWeight: '600' }}>
              %{lifestyle.rent}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lifestyle.rent}
            onChange={(e) => handleChange('rent', Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #F97316 0%, #F97316 ${lifestyle.rent}%, #E5E7EB ${lifestyle.rent}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Transport */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label style={{ color: '#2E2E2E', fontWeight: '500' }}>Ulaşım</label>
            <span style={{ color: '#F97316', fontWeight: '600' }}>
              %{lifestyle.transport}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lifestyle.transport}
            onChange={(e) => handleChange('transport', Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #F97316 0%, #F97316 ${lifestyle.transport}%, #E5E7EB ${lifestyle.transport}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Other */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label style={{ color: '#2E2E2E', fontWeight: '500' }}>Diğer</label>
            <span style={{ color: '#F97316', fontWeight: '600' }}>
              %{lifestyle.other}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lifestyle.other}
            onChange={(e) => handleChange('other', Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #F97316 0%, #F97316 ${lifestyle.other}%, #E5E7EB ${lifestyle.other}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Total */}
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: isValid ? '#D1FAE5' : '#FEE2E2',
            border: isValid ? '1px solid #6EE7B7' : '1px solid #FCA5A5',
          }}
        >
          <div className="flex justify-between items-center">
            <span
              style={{
                color: isValid ? '#065F46' : '#991B1B',
                fontWeight: '600',
              }}
            >
              Toplam:
            </span>
            <span
              style={{
                color: isValid ? '#065F46' : '#991B1B',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            >
              %{total}
            </span>
          </div>
          {!isValid && (
            <p
              className="mt-2"
              style={{ color: '#991B1B', fontSize: '0.75rem' }}
            >
              Toplam %100 olmalı
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid}
        className="w-full py-4 rounded-2xl transition-all"
        style={{
          backgroundColor: isValid ? '#DC2626' : '#D1D5DB',
          color: '#FFFFFF',
          fontWeight: '600',
          cursor: isValid ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={(e) => {
          if (isValid) {
            e.currentTarget.style.backgroundColor = '#991B1B';
          }
        }}
        onMouseLeave={(e) => {
          if (isValid) {
            e.currentTarget.style.backgroundColor = '#DC2626';
          }
        }}
      >
        Devam Et
      </button>
    </motion.div>
  );
}
