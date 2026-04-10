import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFormData } from '../store';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function IncomeStep() {
  const navigate = useNavigate();
  const { data, updateData } = useFormData();
  const [salary, setSalary] = useState(data.salary);
  const [otherIncome, setOtherIncome] = useState(data.otherIncome);

  const handleSalaryChange = (value: number) => {
    const newValue = Math.max(0, value);
    setSalary(newValue);
    updateData('salary', newValue);
  };

  const handleOtherIncomeChange = (value: number) => {
    const newValue = Math.max(0, value);
    setOtherIncome(newValue);
    updateData('otherIncome', newValue);
  };

  const totalAnnual = (salary + otherIncome) * 12;

  const handleContinue = () => {
    navigate('/dogrudan');
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
          className="mb-8"
          style={{
            color: '#2E2E2E',
            fontSize: '1.5rem',
            fontWeight: '600',
          }}
        >
          Senin Yılın
        </h2>

        {/* Salary Input */}
        <div className="mb-8">
          <label
            className="block mb-3"
            style={{
              color: '#2E2E2E',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Maaş / Ücret (brüt)
          </label>

          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => handleSalaryChange(salary - 100)}
              className="p-3 rounded-xl transition-all"
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
            >
              <Minus size={20} style={{ color: '#B91C1C' }} />
            </button>

            <input
              type="number"
              value={salary}
              onChange={(e) => handleSalaryChange(Number(e.target.value))}
              className="flex-1 text-center py-4 px-4 rounded-xl"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#2E2E2E',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}
              placeholder="0 TL"
            />

            <button
              onClick={() => handleSalaryChange(salary + 100)}
              className="p-3 rounded-xl transition-all"
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
            >
              <Plus size={20} style={{ color: '#B91C1C' }} />
            </button>
          </div>

          <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            Örn: bordro brüt maaşın
          </p>
        </div>

        {/* Other Income Input */}
        <div className="mb-8">
          <label
            className="block mb-3"
            style={{
              color: '#2E2E2E',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Diğer gelir (kira, freelance vb.)
          </label>

          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => handleOtherIncomeChange(otherIncome - 100)}
              className="p-3 rounded-xl transition-all"
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
            >
              <Minus size={20} style={{ color: '#B91C1C' }} />
            </button>

            <input
              type="number"
              value={otherIncome}
              onChange={(e) => handleOtherIncomeChange(Number(e.target.value))}
              className="flex-1 text-center py-4 px-4 rounded-xl"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#2E2E2E',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}
              placeholder="0 TL"
            />

            <button
              onClick={() => handleOtherIncomeChange(otherIncome + 100)}
              className="p-3 rounded-xl transition-all"
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
            >
              <Plus size={20} style={{ color: '#B91C1C' }} />
            </button>
          </div>
        </div>

        {/* Total */}
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FED7AA',
          }}
        >
          <div className="flex justify-between items-center">
            <span style={{ color: '#9A3412', fontWeight: '500' }}>
              Yıllık brüt toplam:
            </span>
            <span
              style={{
                color: '#9A3412',
                fontSize: '1.25rem',
                fontWeight: '700',
              }}
            >
              {totalAnnual.toLocaleString('tr-TR')} TL
            </span>
          </div>
        </div>
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
        Devam Et
      </button>
    </motion.div>
  );
}
