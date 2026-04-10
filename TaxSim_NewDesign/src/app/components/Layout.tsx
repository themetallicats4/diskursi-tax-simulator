import { Outlet, useLocation } from 'react-router';
import { FormProvider } from '../store';

const steps = [
  { path: '/', label: 'Meslek' },
  { path: '/gelir', label: 'Gelir' },
  { path: '/dogrudan', label: 'Doğrudan' },
  { path: '/yasam', label: 'Yaşam' },
  { path: '/dolayli', label: 'Dolaylı' },
  { path: '/toplam', label: 'Toplam' },
];

export default function Layout() {
  const location = useLocation();

  const currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );

  return (
    <FormProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#FFF7ED' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="mb-2"
              style={{
                color: '#B91C1C',
                fontSize: '2rem',
                fontWeight: '700',
              }}
            >
              Diskursi
            </h1>
            <h2
              className="mb-1"
              style={{
                color: '#2E2E2E',
                fontSize: '1.25rem',
                fontWeight: '600',
              }}
            >
              Vergi Yükü Simülasyonu
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              1 dakikada yaklaşık bir tahmin
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 justify-center min-w-max px-4">
              {steps.map((step, index) => (
                <div
                  key={step.path}
                  className="px-4 py-2 rounded-full text-sm transition-all"
                  style={{
                    backgroundColor:
                      index === currentStepIndex ? '#FEE2E2' : '#FFFFFF',
                    border:
                      index === currentStepIndex
                        ? '2px solid #B91C1C'
                        : '1px solid #E5E7EB',
                    color: index === currentStepIndex ? '#B91C1C' : '#6B7280',
                    fontWeight: index === currentStepIndex ? '600' : '400',
                  }}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <Outlet />
        </div>
      </div>
    </FormProvider>
  );
}
