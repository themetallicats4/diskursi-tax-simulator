import { createContext, useContext, useState, ReactNode } from 'react';

export interface FormData {
  profession: string;
  salary: number;
  otherIncome: number;
  lifestyle: {
    food: number;
    rent: number;
    transport: number;
    other: number;
  };
  extras: {
    hasCar: boolean;
    smoker: boolean;
    alcohol: boolean;
  };
}

interface FormContextType {
  data: FormData;
  updateData: (field: keyof FormData, value: any) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>({
    profession: '',
    salary: 0,
    otherIncome: 0,
    lifestyle: {
      food: 25,
      rent: 25,
      transport: 25,
      other: 25,
    },
    extras: {
      hasCar: false,
      smoker: false,
      alcohol: false,
    },
  });

  const updateData = (field: keyof FormData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <FormContext.Provider value={{ data, updateData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormData must be used within FormProvider');
  }
  return context;
}
