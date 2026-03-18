import { useState } from 'react';

export const useSopEditor = (initialDesignerSop: string[] = [], initialDeveloperSop: string[] = []) => {
  const [designerSop, setDesignerSop] = useState<string[]>(initialDesignerSop);
  const [developerSop, setDeveloperSop] = useState<string[]>(initialDeveloperSop);

  const handleAddField = (type: 'designer' | 'developer') => {
    if (type === 'designer') setDesignerSop([...designerSop, '']);
    else setDeveloperSop([...developerSop, '']);
  };

  const handleUpdateField = (type: 'designer' | 'developer', index: number, value: string) => {
    if (type === 'designer') {
      const newSop = [...designerSop];
      newSop[index] = value;
      setDesignerSop(newSop);
    } else {
      const newSop = [...developerSop];
      newSop[index] = value;
      setDeveloperSop(newSop);
    }
  };

  const handleRemoveField = (type: 'designer' | 'developer', index: number) => {
    if (type === 'designer') setDesignerSop(designerSop.filter((_, i) => i !== index));
    else setDeveloperSop(developerSop.filter((_, i) => i !== index));
  };

  return {
    designerSop,
    setDesignerSop,
    developerSop,
    setDeveloperSop,
    handleAddField,
    handleUpdateField,
    handleRemoveField,
  };
};
