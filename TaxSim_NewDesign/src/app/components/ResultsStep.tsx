import { useState } from 'react';
import { useFormData } from '../store';
import { motion } from 'motion/react';
import { Receipt, TrendingUp, Calendar, Users, School, Hospital, Building } from 'lucide-react';

export default function ResultsStep() {
  const { data } = useFormData();
  
  // Calculations
  const totalAnnual = (data.salary + data.otherIncome) * 12;
  const directTaxRate = 0.35;
  const directTax = totalAnnual * directTaxRate;
  const netIncome = totalAnnual - directTax;
  
  // Indirect taxes based on spending patterns
  const indirectTaxRate = 0.20; // VAT + special consumption taxes
  let indirectTaxMultiplier = 1.0;
  
  if (data.extras.hasCar) indirectTaxMultiplier += 0.15;
  if (data.extras.smoker) indirectTaxMultiplier += 0.10;
  if (data.extras.alcohol) indirectTaxMultiplier += 0.08;
  
  const indirectTax = netIncome * indirectTaxRate * indirectTaxMultiplier;
  
  const totalTax = directTax + indirectTax;
  const taxRate = (totalTax / totalAnnual) * 100;
  
  const dailyTax = totalTax / 365;
  const monthlyTax = totalTax / 12;
  
  // Survey state
  const [survey, setSurvey] = useState({
    fairness: 5,
    trust: 5,
    priority: '',
  });
  
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-8"
    >
      {/* SECTION 1 - VERGI FIŞIN */}
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Receipt size={32} style={{ color: '#B91C1C' }} />
          <div>
            <h2
              style={{
                color: '#2E2E2E',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}
            >
              Vergi fişin
            </h2>
          </div>
        </div>
        
        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Bu tahmini fiş, yıllık vergi yükünün hangi kalemlerden oluştuğunu gösterir.
        </p>

        {/* Direct Taxes */}
        <div className="mb-6">
          <h3
            className="mb-3 pb-2"
            style={{
              color: '#2E2E2E',
              fontWeight: '600',
              borderBottom: '2px solid #F3F4F6',
            }}
          >
            Doğrudan kesintiler
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#6B7280' }}>Gelir vergisi</span>
              <span style={{ color: '#2E2E2E', fontWeight: '600' }}>
                {(directTax * 0.6).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#6B7280' }}>SGK primleri</span>
              <span style={{ color: '#2E2E2E', fontWeight: '600' }}>
                {(directTax * 0.4).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
              </span>
            </div>
          </div>
          
          <div
            className="flex justify-between mt-3 pt-3"
            style={{ borderTop: '2px solid #FEE2E2' }}
          >
            <span style={{ color: '#B91C1C', fontWeight: '700' }}>Toplam doğrudan</span>
            <span style={{ color: '#B91C1C', fontSize: '1.125rem', fontWeight: '700' }}>
              {directTax.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </span>
          </div>
        </div>

        {/* Indirect Taxes */}
        <div>
          <h3
            className="mb-3 pb-2"
            style={{
              color: '#2E2E2E',
              fontWeight: '600',
              borderBottom: '2px solid #F3F4F6',
            }}
          >
            Dolaylı vergiler
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#6B7280' }}>KDV (harcamalardan)</span>
              <span style={{ color: '#2E2E2E', fontWeight: '600' }}>
                {(indirectTax * 0.7).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#6B7280' }}>ÖTV ve diğer</span>
              <span style={{ color: '#2E2E2E', fontWeight: '600' }}>
                {(indirectTax * 0.3).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
              </span>
            </div>
          </div>
          
          <div
            className="flex justify-between mt-3 pt-3"
            style={{ borderTop: '2px solid #FEE2E2' }}
          >
            <span style={{ color: '#B91C1C', fontWeight: '700' }}>Toplam dolaylı</span>
            <span style={{ color: '#B91C1C', fontSize: '1.125rem', fontWeight: '700' }}>
              {indirectTax.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </span>
          </div>
        </div>

        {/* Grand Total */}
        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            backgroundColor: '#FEE2E2',
            border: '2px solid #B91C1C',
          }}
        >
          <div className="flex justify-between items-center">
            <span style={{ color: '#991B1B', fontSize: '1.125rem', fontWeight: '700' }}>
              TOPLAM VERGİ
            </span>
            <span style={{ color: '#991B1B', fontSize: '1.5rem', fontWeight: '700' }}>
              {totalTax.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 - ORAN */}
      <div
        className="rounded-3xl p-8 mb-6 text-center"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <TrendingUp size={32} style={{ color: '#F97316', margin: '0 auto 1rem' }} />
        <h2
          className="mb-4"
          style={{
            color: '#2E2E2E',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          Toplam vergi oranın
        </h2>
        <div
          style={{
            color: '#B91C1C',
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
          }}
        >
          ~%{taxRate.toFixed(0)}
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Gelirinin bu kadarı vergi olarak gider.
        </p>
      </div>

      {/* SECTION 3 - GÜNLÜK ETKİ */}
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={32} style={{ color: '#F97316' }} />
          <h2
            style={{
              color: '#2E2E2E',
              fontSize: '1.25rem',
              fontWeight: '600',
            }}
          >
            Yaklaşık Günlük Vergi Yükün
          </h2>
        </div>
        
        <div
          className="text-center mb-6"
          style={{
            color: '#DC2626',
            fontSize: '2rem',
            fontWeight: '700',
          }}
        >
          {dailyTax.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL / gün
        </div>

        {/* Month Visualization */}
        <p className="mb-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Aylık vergi yükü görselleştirmesi:
        </p>
        <div className="grid grid-cols-12 gap-1 mb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded"
              style={{ backgroundColor: '#DC2626' }}
            />
          ))}
        </div>
        <p className="text-center" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
          Her kutu ≈ {monthlyTax.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
        </p>
      </div>

      {/* SECTION 4 - BİREYSEL ETKİ */}
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <h2
          className="mb-6"
          style={{
            color: '#2E2E2E',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          Bireysel Yıllık Katkınla Neler Yapılır?
        </h2>

        <div className="grid gap-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F97316' }}
              >
                <span style={{ fontSize: '1.5rem' }}>👩‍🏫</span>
              </div>
              <div className="flex-1">
                <p style={{ color: '#9A3412', fontWeight: '600' }}>Öğretmen maaşı</p>
                <p style={{ color: '#9A3412', fontSize: '0.875rem' }}>
                  ≈ {(totalTax / 15000).toFixed(1)} ay
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F97316' }}
              >
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
              </div>
              <div className="flex-1">
                <p style={{ color: '#9A3412', fontWeight: '600' }}>Öğrenci bursu</p>
                <p style={{ color: '#9A3412', fontSize: '0.875rem' }}>
                  ≈ {(totalTax / 5000).toFixed(0)} öğrenci (yıllık)
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F97316' }}
              >
                <span style={{ fontSize: '1.5rem' }}>🚑</span>
              </div>
              <div className="flex-1">
                <p style={{ color: '#9A3412', fontWeight: '600' }}>Ambulans işletme</p>
                <p style={{ color: '#9A3412', fontSize: '0.875rem' }}>
                  ≈ {(totalTax / 3000).toFixed(0)} gün
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5 - KOLEKTİF ETKİ */}
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Users size={32} style={{ color: '#B91C1C' }} />
          <h2
            style={{
              color: '#2E2E2E',
              fontSize: '1.25rem',
              fontWeight: '600',
            }}
          >
            1000 kişi olsaydı?
          </h2>
        </div>

        <div
          className="text-center mb-6 p-6 rounded-xl"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <p style={{ color: '#991B1B', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Toplam vergi
          </p>
          <div
            style={{
              color: '#B91C1C',
              fontSize: '2rem',
              fontWeight: '700',
            }}
          >
            {((totalTax * 1000) / 1000000).toFixed(1)} milyon TL
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <School size={32} style={{ color: '#F97316', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#2E2E2E', fontWeight: '600' }}>≈ {((totalTax * 1000) / 50000000).toFixed(1)} okul</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>orta büyüklükte</p>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <Hospital size={32} style={{ color: '#F97316', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#2E2E2E', fontWeight: '600' }}>≈ {((totalTax * 1000) / 100000000).toFixed(1)} hastane</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>tam donanımlı</p>
          </div>
        </div>
      </div>

      {/* SECTION 6 - DEVLET GELİRLERİ */}
      <div
        className="rounded-3xl p-8 mb-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Building size={32} style={{ color: '#B91C1C' }} />
          <h2
            style={{
              color: '#2E2E2E',
              fontSize: '1.25rem',
              fontWeight: '600',
            }}
          >
            Devlet gelirleri
          </h2>
        </div>

        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Türkiye'de devlet gelirlerinin ~%85'i vergilerden oluşur.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: '#2E2E2E', fontWeight: '500' }}>KDV</span>
              <span style={{ color: '#F97316', fontWeight: '600' }}>~%35</span>
            </div>
            <div className="h-3 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-full rounded-full"
                style={{ width: '35%', backgroundColor: '#F97316' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: '#2E2E2E', fontWeight: '500' }}>ÖTV</span>
              <span style={{ color: '#DC2626', fontWeight: '600' }}>~%20</span>
            </div>
            <div className="h-3 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-full rounded-full"
                style={{ width: '20%', backgroundColor: '#DC2626' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: '#2E2E2E', fontWeight: '500' }}>Gelir vergisi</span>
              <span style={{ color: '#B91C1C', fontWeight: '600' }}>~%18</span>
            </div>
            <div className="h-3 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-full rounded-full"
                style={{ width: '18%', backgroundColor: '#B91C1C' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span style={{ color: '#2E2E2E', fontWeight: '500' }}>Diğer</span>
              <span style={{ color: '#6B7280', fontWeight: '600' }}>~%27</span>
            </div>
            <div className="h-3 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-full rounded-full"
                style={{ width: '27%', backgroundColor: '#9CA3AF' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7 - SURVEY */}
      <div
        className="rounded-3xl p-8"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <h2
          className="mb-2"
          style={{
            color: '#2E2E2E',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          Senin görüşün?
        </h2>
        
        <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Anonim bir anket ile görüşünü paylaş
        </p>

        {!surveySubmitted ? (
          <>
            <div className="mb-6">
              <label className="block mb-3" style={{ color: '#2E2E2E', fontWeight: '500' }}>
                Vergi sistemini adil buluyor musun? (0-10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={survey.fairness}
                onChange={(e) => setSurvey({ ...survey, fairness: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #DC2626 0%, #F97316 50%, #10B981 100%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Adaletsiz</span>
                <span style={{ color: '#2E2E2E', fontWeight: '700' }}>{survey.fairness}</span>
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Adil</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-3" style={{ color: '#2E2E2E', fontWeight: '500' }}>
                Devlete güven düzeyin? (0-10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={survey.trust}
                onChange={(e) => setSurvey({ ...survey, trust: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #DC2626 0%, #F97316 50%, #10B981 100%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Düşük</span>
                <span style={{ color: '#2E2E2E', fontWeight: '700' }}>{survey.trust}</span>
                <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Yüksek</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-3" style={{ color: '#2E2E2E', fontWeight: '500' }}>
                Öncelikli politika alanı
              </label>
              <select
                value={survey.priority}
                onChange={(e) => setSurvey({ ...survey, priority: e.target.value })}
                className="w-full p-4 rounded-xl"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  color: '#2E2E2E',
                }}
              >
                <option value="">Seçiniz...</option>
                <option value="education">Eğitim</option>
                <option value="health">Sağlık</option>
                <option value="infrastructure">Altyapı</option>
                <option value="social">Sosyal yardım</option>
                <option value="security">Güvenlik</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <button
              onClick={() => setSurveySubmitted(true)}
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
              Anketi Gönder
            </button>
          </>
        ) : (
          <div
            className="p-6 rounded-xl text-center"
            style={{ backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7' }}
          >
            <p style={{ color: '#065F46', fontWeight: '600' }}>
              ✓ Teşekkürler! Görüşün kaydedildi.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
