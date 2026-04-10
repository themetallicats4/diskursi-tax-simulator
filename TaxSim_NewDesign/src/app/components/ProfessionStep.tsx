import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useFormData } from '../store';
import { Briefcase, Building2, User, GraduationCap, Home, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

const professions = [
  { id: 'private', label: 'Özel sektör çalışanı', icon: Briefcase },
  { id: 'public', label: 'Kamu çalışanı', icon: Building2 },
  { id: 'freelance', label: 'Serbest çalışan', icon: User },
  { id: 'student', label: 'Öğrenci', icon: GraduationCap },
  { id: 'unemployed', label: 'Çalışmıyor', icon: Home },
  { id: 'retired', label: 'Emekli', icon: UserCheck },
];

export default function ProfessionStep() {
  const navigate = useNavigate();
  const { data, updateData } = useFormData();
  const [selected, setSelected] = useState(data.profession);

  const handleSelect = (id: string) => {
    setSelected(id);
    updateData('profession', id);
  };

  const handleContinue = () => {
    if (selected) {
      navigate('/gelir');
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
          className="mb-6"
          style={{
            color: '#2E2E2E',
            fontSize: '1.5rem',
            fontWeight: '600',
          }}
        >
          Meslek grubun
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {professions.map((profession) => {
            const Icon = profession.icon;
            const isSelected = selected === profession.id;

            return (
              <button
                key={profession.id}
                onClick={() => handleSelect(profession.id)}
                className="p-6 rounded-2xl transition-all text-left"
                style={{
                  backgroundColor: isSelected ? '#FEE2E2' : '#FFFFFF',
                  border: isSelected ? '2px solid #B91C1C' : '1px solid #E5E7EB',
                }}
              >
                <Icon
                  className="mb-3"
                  size={32}
                  style={{ color: isSelected ? '#B91C1C' : '#6B7280' }}
                />
                <div
                  style={{
                    color: isSelected ? '#B91C1C' : '#2E2E2E',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {profession.label}
                </div>
              </button>
            );
          })}
        </div>

        <p
          className="text-center"
          style={{ color: '#9CA3AF', fontSize: '0.75rem' }}
        >
          Bu bilgi anonimdir.
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="w-full py-4 rounded-2xl transition-all"
        style={{
          backgroundColor: selected ? '#DC2626' : '#D1D5DB',
          color: '#FFFFFF',
          fontWeight: '600',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={(e) => {
          if (selected) {
            e.currentTarget.style.backgroundColor = '#991B1B';
          }
        }}
        onMouseLeave={(e) => {
          if (selected) {
            e.currentTarget.style.backgroundColor = '#DC2626';
          }
        }}
      >
        Devam Et
      </button>
    </motion.div>
  );
}
