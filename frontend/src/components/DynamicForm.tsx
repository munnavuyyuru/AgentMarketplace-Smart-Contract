import { useState } from "react";

type SchemaType =
  | { type: "string"; format?: "textarea"; label?: string; required?: boolean; accept?: string[] }
  | { type: "textarea"; label?: string; required?: boolean }
  | { type: "number"; label?: string; required?: boolean; min?: number; max?: number }
  | { type: "boolean"; label?: string; required?: boolean }
  | {
      type: "enum" | "select";
      options: Array<{ label: string; value: string | number | boolean }>;
      label?: string;
      required?: boolean
    }
  | {
      type: "file";
      label?: string;
      required?: boolean;
      accept?: string[]
    }
  | {
      type: "json";
      label?: string;
      required?: boolean
    }
  | {
      type: "object";
      properties: Record<string, SchemaType>;
      label?: string;
      required?: boolean
    }
  | {
      type: "array";
      items: SchemaType;
      label?: string;
      required?: boolean
    };

interface DynamicFormProps {
  schema: Record<string, SchemaType>;
  onSubmit: (formData: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export default function DynamicForm({
  schema,
  onSubmit,
  initialValues = {}
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => ({
    // Initialize empty values for all schema properties as defaults
    ...Object.keys(schema).reduce((acc, key) => ({
      ...acc,
      [key]: undefined
    }), {}),
    // Then override with any provided initial values
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user modifies it
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field: string, value: any, schemaDef: SchemaType): string | null => {
    // Handle required validation
    if (schemaDef.required && (value === undefined || value === null || value === "")) {
      return `${schemaDef.label || field} is required`;
    }

    // Skip further validation if empty and not required
    if ((value === undefined || value === null || value === "") && !schemaDef.required) {
      return null;
    }

    // Type-specific validation
    switch (schemaDef.type) {
      case "string":
        if (typeof value !== "string") {
          return `${schemaDef.label || field} must be a string`;
        }
        if (schemaDef.format === "textarea" && value.length > 1000) {
          return `${schemaDef.label || field} is too long (max 1000 characters)`;
        }
        break;

      case "textarea":
        if (typeof value !== "string") {
          return `${schemaDef.label || field} must be text`;
        }
        break;

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          return `${schemaDef.label || field} must be a number`;
        }
        if (schemaDef.min !== undefined && value < schemaDef.min) {
          return `${schemaDef.label || field} must be at least ${schemaDef.min}`;
        }
        if (schemaDef.max !== undefined && value > schemaDef.max) {
          return `${schemaDef.label || field} must be at most ${schemaDef.max}`;
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return `${schemaDef.label || field} must be a boolean`;
        }
        break;

      case "enum":
      case "select":
        if (!schemaDef.options?.some(opt => opt.value === value)) {
          return `${schemaDef.label || field} must be one of the available options`;
        }
        break;

      case "file":
        // File validation would typically happen in the file input handler
        break;

      case "json":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          return `${schemaDef.label || field} must be valid JSON`;
        }
        try {
          JSON.stringify(value);
        } catch (e) {
          return `${schemaDef.label || field} must be valid JSON`;
        }
        break;

      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          return `${schemaDef.label || field} must be an object`;
        }
        // Recursive validation for nested objects would go here
        break;

      case "array":
        if (!Array.isArray(value)) {
          return `${schemaDef.label || field} must be an array`;
        }
        // Validate each item if needed
        break;

      default:
        return `Unknown field type: ${(schemaDef as SchemaType).type}`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    for (const [field, schemaDef] of Object.entries(schema)) {
      const value = formData[field];
      const error = validateField(field, value, schemaDef);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (hasErrors) {
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Handle submission error
      console.error("Form submission error:", error);
      // You could set a general error state here
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(schema).map(([field, schemaDef]) => {
        const label = schemaDef.label || field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const error = errors[field];

        return (
          <div key={field} className="space-y-2">
            <label
              htmlFor={field}
              className={`block text-sm font-medium ${error ? "text-red-600" : "text-gray-700"}`}
            >
              {label} {schemaDef.required ? "*" : ""}
            </label>
            {renderField(field, schemaDef, formData[field] || "", (value: any) => handleChange(field, value))}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={submitting}
        className="
          w-full
          border-2 border-black
          bg-black
          px-4 py-3
          font-bold
          text-white
          transition-all
          hover:bg-gray-800
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {submitting ? "Creating..." : "Create Service"}
      </button>
    </form>
  );
}

// Helper function to render different field types based on schema
function renderField(
  field: string,
  schema: SchemaType,
  value: any,
  onChange: (value: any) => void
) {
  switch (schema.type) {
    case "string":
      if (schema.format === "textarea") {
        return (
          <textarea
            id={field}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="
              w-full
              border-2 border-black
              bg-white
              px-3 py-2
              font-mono
              focus:outline-none
              focus:ring-2
              focus:ring-black
              min-h-[80px]
              resize-vertical
            "
            rows={4}
          />
        );
      }
      return (
        <input
          id={field}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        />
      );

    case "textarea":
      return (
        <textarea
          id={field}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
            min-h-[80px]
            resize-vertical
          "
          rows={4}
        />
      );

    case "number":
      return (
        <input
          id={field}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        />
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <input
            id={field}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="
              w-4 h-4
              border-2 border-black
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
          <span className="text-sm font-medium">{schema.label || ""}</span>
        </div>
      );

    case "enum":
    case "select":
      return (
        <select
          id={field}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        >
          <option value="">Select an option</option>
          {schema.options?.map(option => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "file":
      return (
        <div className="space-y-2">
          <input
            id={field}
            type="file"
            accept={schema.accept?.join(",") || ""}
            onChange={(e) => {
              // For simplicity, we're storing the File object
              // In a real app, you might upload it first and store the URL
              if (e.target.files && e.target.files[0]) {
                onChange(e.target.files[0]);
              } else {
                onChange(null);
              }
            }}
            className="
              w-full
              border-2 border-black
              bg-white
              px-3 py-2
              font-mono
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
          {value && (
            <p className="text-sm text-gray-600">
              Selected: {typeof value === "string" ? value : (value as File)?.name || "File selected"}
            </p>
          )}
        </div>
      );

    case "json":
      return (
        <textarea
          id={field}
          value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
          onChange={(e) => {
            try {
              const parsed = e.target.value ? JSON.parse(e.target.value) : {};
              onChange(parsed);
            } catch (err) {
              // Keep the invalid value so user can fix it
              onChange(e.target.value);
            }
          }}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
            min-h-[80px]
            resize-vertical
          "
          rows={4}
          spellCheck="false"
        />
      );

    case "object":
      // For nested objects, we'd need a more complex implementation
      // For now, we'll use a JSON textarea
      return (
        <textarea
          id={field}
          value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
          onChange={(e) => {
            try {
              const parsed = e.target.value ? JSON.parse(e.target.value) : {};
              onChange(parsed);
            } catch (err) {
              onChange(e.target.value);
            }
          }}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
            min-h-[80px]
            resize-vertical
          "
          rows={4}
          spellCheck="false"
        />
      );

    case "array":
      // For arrays, we'd need a more complex implementation
      // For now, we'll use a JSON textarea
      return (
        <textarea
          id={field}
          value={Array.isArray(value) ? JSON.stringify(value, null, 2) : value || ""}
          onChange={(e) => {
            try {
              const parsed = e.target.value ? JSON.parse(e.target.value) : [];
              onChange(parsed);
            } catch (err) {
              onChange(e.target.value);
            }
          }}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
            min-h-[80px]
            resize-vertical
          "
          rows={4}
          spellCheck="false"
        />
      );

    default:
      return (
        <input
          id={field}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            border-2 border-black
            bg-white
            px-3 py-2
            font-mono
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        />
      );
  }
}