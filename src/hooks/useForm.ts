import { useState, type ChangeEvent } from "react";

export const useForm = <T extends Object>(initialState: T) => {
  const [formState, setFormState] = useState(initialState);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const inputName = e.target.name;
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === "checkbox";
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormState((prev) => ({
      ...prev,
      [`${inputName}`]: inputValue,
    }));
  };

  return {
    formState,
    handleChange,
    setFormState,
  };
};
