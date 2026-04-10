import { useNavigate } from 'react-router';
import { useFormData } from '../store';
import { motion } from 'motion/react';

export default function DirectTaxStep() {
  const navigate = useNavigate();
  const { data } = useFormData();

  const totalAnnual = (data.salary + data.otherIncome) * 12;
  
  // Simplified tax calculation (approximation)
  const directTaxRate = 0.35; // ~35% for direct taxes (income tax + SSC)
  const directTax = totalAnnual * directTaxRate;
  const remaining = totalAnnual - directTax;
  const percentage = (directTax / totalAnnual) * 100;

  const handleContinue = () => {
    navigate('/yasam');
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
          Devlet ilk payını alıyor
        </h2>

        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Bu kesintiler maaşından doğrudan yapılır.
        </p>

        {/* Annual Gross */}
        <div className="mb-6 text-center">
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Yıllık brüt gelir
          </p>
          <p
            style={{
              color: '#2E2E2E',
              fontSize: '2rem',
              fontWeight: '700',
            }}
          >
            {totalAnnual.toLocaleString('tr-TR')} TL
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="h-12 rounded-xl overflow-hidden"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${percentage}%`,
                backgroundColor: '#DC2626',
              }}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mb-8">
          <div>
            <p style={{ color: '#DC2626', fontWeight: '600' }}>Devlete giden</p>
            <p style={{ color: '#DC2626', fontSize: '1.25rem', fontWeight: '700' }}>
              {directTax.toLocaleString('tr-TR')} TL
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              ~{percentage.toFixed(0)}%
            </p>
          </div>
          <div className="text-right">
            <p style={{ color: '#059669', fontWeight: '600' }}>Sana kalan</p>
            <p style={{ color: '#059669', fontSize: '1.25rem', fontWeight: '700' }}>
              {remaining.toLocaleString('tr-TR')} TL
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              ~{(100 - percentage).toFixed(0)}%
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
          }}
        >
          <p style={{ color: '#991B1B', fontSize: '0.875rem' }}>
            💡 Gelir vergisi ve sosyal güvenlik primleri maaşından otomatik olarak kesilir.
          </p>
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
