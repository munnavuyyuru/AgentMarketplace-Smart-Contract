type OutputSchemaType =
  | { type: "string"; format?: "uri" | "textarea"; label?: string }
  | { type: "textarea"; label?: string }
  | { type: "number"; label?: string }
  | { type: "boolean"; label?: string }
  | {
      type: "enum" | "select";
      options: Array<{ label: string; value: string | number | boolean }>;
      label?: string
    }
  | { type: "file"; label?: string }
  | { type: "json"; label?: string }
  | {
      type: "object";
      properties: Record<string, OutputSchemaType>;
      label?: string
    }
  | {
      type: "array";
      items: OutputSchemaType;
      label?: string
    };

interface ResponseRendererProps {
  schema: OutputSchemaType | null;
  data: any;
}

export default function ResponseRenderer({ schema, data }: ResponseRendererProps) {
  if (!schema || data === null || data === undefined) {
    return <div className="text-gray-500 italic">No data to display</div>;
  }

  return renderResponse(schema, data);
}

function renderResponse(schema: OutputSchemaType, data: any): React.ReactNode {
  switch (schema.type) {
    case "string":
      if (schema.format === "uri") {
        // Check if it's an image URL
        if (typeof data === "string" &&
            (data.endsWith(".png") || data.endsWith(".jpg") || data.endsWith(".jpeg") ||
             data.endsWith(".gif") || data.endsWith(".webp") || data.endsWith(".svg"))) {
          return (
            <div className="text-center">
              <img
                src={data}
                alt="Service output"
                className="max-w-full h-auto bordered border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded"
              />
              {schema.label && <p className="mt-2 text-sm font-medium text-gray-700">{schema.label}</p>}
            </div>
          );
        }
        // For other URLs, show as link
        return (
          <div className="break-all">
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-9-blue-800"
            >
              {data}
            </a>
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      // Regular string or textarea
      if (schema.format === "textarea") {
        return (
          <div className="whitespace-pre-wrap break-all bg-gray-50 p-3 rounded border border-gray-300 min-h-[80px]">
            {String(data)}
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      return (
        <div className="break-all">
          {String(data)}
          {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="whitespace-pre-wrap break-all bg-gray-50 p-3 rounded border border-gray-300 min-h-[80px]">
          {String(data)}
          {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "number":
      return (
        <div className="text-right">
          <span className="font-mono text-lg">{typeof data === "number" ? data : Number(data || 0)}</span>
          {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-black rounded flex items-center justify-center">
            {data ? (
              <span className="text-[10px] font-black">✓</span>
            ) : (
              <span className="text-[10px] font-black">✗</span>
            )}
          </div>
          <span className="text-sm font-medium">{schema.label || ""}</span>
        </div>
      );

    case "enum":
    case "select":
      const selectedOption = schema.options?.find(opt => opt.value === data);
      return (
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-black rounded flex items-center justify-center bg-gray-100">
            <span className="text-xs font-medium">{selectedOption?.label ?? String(data)}</span>
          </div>
          <span className="text-sm font-medium">{schema.label || ""}</span>
        </div>
      );

    case "file":
      if (typeof data === "string") {
        // Assume it's a URL or filename
        return (
          <div className="flex items-center space-x-3">
            <a
              href={data.startsWith("http") ? data : `#`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 underline hover:text-blue-800"
            >
              📎
              <span className="break-all max-w-xs">{data.split(/[\\/]/).pop() || data}</span>
            </a>
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      // If it's a File object (from frontend)
      if (data && typeof data === "object" && "name" in data) {
        return (
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono">📎 {data.name}</span>
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      return (
        <div>
          {String(data)}
          {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "json":
      return (
        <div className="bg-gray-50 p-3 rounded border border-gray-300 max-h-[200px] overflow-y-auto font-mono text-sm">
          <pre className="whitespace-pre-wrap">{typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)}</pre>
          {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "object":
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return (
          <div className="text-gray-500 italic">
            Expected object but received: {typeof data}
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-sm font-medium">{key}</span>
                <span className="text-sm text-gray-600">{typeof value}</span>
              </div>
              {/* Render the value based on its type - simplified for now */}
              <div className="ml-4">
                {typeof value === "object" && value !== null && !Array.isArray(value) ? (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="break-all whitespace-pre-wrap">{String(value)}</div>
                )}
              </div>
            </div>
          ))}
          {schema.label && <p className="mt-2 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    case "array":
      if (!Array.isArray(data)) {
        return (
          <div className="text-gray-500 italic">
            Expected array but received: {typeof data}
            {schema.label && <p className="mt-1 text-sm font-medium text-gray-700">{schema.label}</p>}
          </div>
        );
      }
      return (
        <div className="space-y-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs">[{index}]</span>
                <span className="text-sm text-gray-600">{typeof item}</span>
              </div>
              {/* Render array item - simplified */}
              <div className="ml-4">
                {typeof item === "object" && item !== null ? (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="break-all whitespace-pre-wrap">{String(item)}</div>
                )}
              </div>
            </div>
          ))}
          {schema.label && <p className="mt-2 text-sm font-medium text-gray-700">{schema.label}</p>}
        </div>
      );

    default:
      const s = schema as OutputSchemaType;
      return (
        <div className="break-all">
          {String(data)}
          {s.label && <p className="mt-1 text-sm font-medium text-gray-700">{s.label}</p>}
        </div>
      );
  }
}