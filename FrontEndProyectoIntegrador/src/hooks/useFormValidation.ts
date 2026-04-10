import { useState, useCallback } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    custom?: (value: T[K]) => string | undefined;
  };
};

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => void;
  handleBlur: (field: keyof T) => () => void;
  validate: (fieldName?: keyof T) => boolean;
  resetForm: () => void;
  isValid: boolean;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof T, string>>>>;
}

/**
 * Hook para validación de formularios
 * @param initialValues - Valores iniciales del formulario
 * @param validationRules - Reglas de validación por campo
 * @returns Estado y funciones del formulario
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback((fieldName?: keyof T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const fieldsToValidate = fieldName ? [fieldName] : (Object.keys(validationRules) as (keyof T)[]);

    fieldsToValidate.forEach((field) => {
      const rules = validationRules[field];
      const value = values[field];

      if (!rules) return;

      // Required
      if (rules.required) {
        const message = typeof rules.required === 'string' ? rules.required : `${String(field)} es requerido`;
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field] = message;
          return;
        }
      }

      // MinLength
      if (rules.minLength && typeof value === 'string') {
        if (value.length < rules.minLength.value) {
          newErrors[field] = rules.minLength.message;
          return;
        }
      }

      // MaxLength
      if (rules.maxLength && typeof value === 'string') {
        if (value.length > rules.maxLength.value) {
          newErrors[field] = rules.maxLength.message;
          return;
        }
      }

      // Pattern
      if (rules.pattern && typeof value === 'string') {
        if (!rules.pattern.value.test(value)) {
          newErrors[field] = rules.pattern.message;
          return;
        }
      }

      // Custom
      if (rules.custom) {
        const error = rules.custom(value);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = e.target ? e.target.value : e;
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validate(field);
    }
  }, [touched, validate]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field);
  }, [validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    setValues,
    setErrors,
  };
}
