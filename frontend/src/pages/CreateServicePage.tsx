import { useState } from "react";
import { api } from "../services/api";

import MainLayout from "../layouts/HomeLayout";
import DynamicForm from "../components/DynamicForm";

export default function CreateServicePage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serviceCreated, setServiceCreated] = useState<any>(null);

  // Default form values
  const initialValues = {
    provider_address: "",
    title: "",
    descriptionURI: "",
    priceWei: "",
    executionType: "http",
    inputSchema: {},
    outputSchema: {},
    timeout: 30,
    endpoint: "",
    metadata: {}
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Call the backend API to create the service
      const response = await api.post("/services", formData);

      setServiceCreated(response.data.service);
      setSubmitSuccess(true);

      // Notify user about next steps
      alert(
        "Service created successfully! " +
        "Please submit the suggested transaction to the contract to register it on-chain.\n\n" +
        "After the transaction is confirmed, the service will be available in the marketplace."
      );

      // Optionally redirect to the service page
      // navigate(`/service/${response.data.service.service_id}`);
    } catch (err: any) {
      console.error("Error creating service:", err);
      alert(
        err.response?.data?.error ||
        "Failed to create service. Please check the console for details."
      );
    } finally {
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="
          border-4 border-black
          bg-[#ff6b35]
          p-8
          text-white
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        ">
          <div className="mb-2 text-sm uppercase tracking-widest">
            Create New Service
          </div>
          <h1 className="text-4xl font-black">
            Define Your AI Service
          </h1>
          <p className="mt-4 max-w-3xl text-lg">
            Create a new service by defining its interface and execution details.
            The marketplace will handle discovery, payments, and invocation.
          </p>
        </div>
      </div>

      {submitSuccess && serviceCreated && (
        <div className="mb-8">
          <div className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          ">
            <h2 className="mb-4 text-2xl font-black">Service Created Successfully!</h2>
            <p className="mb-4">
              Your service "<strong className="text-black">{serviceCreated.title}</strong>" has been created.
              It will be available in the marketplace once you submit the blockchain transaction.
            </p>
            <div className="border-2 border-black pt-4">
              <h3 className="mb-2 text-xl font-black">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li className="font-medium">
                  Use the suggested transaction data below to submit a transaction to the
                  contract's createService function using your wallet (MetaMask, etc.)
                </li>
                <li className="font-medium">
                  After the transaction is confirmed, the service will be automatically
                  detected by the marketplace and made available to users
                </li>
                <li className="font-medium">
                  Users can then discover, purchase, and use your service through x402 payments
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="
        border-2 border-black
        bg-white
        p-6
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      ">
        <h2 className="mb-4 text-2xl font-black">Service Configuration</h2>
        <p className="mb-6 text-sm text-gray-600">
          Fill in the details below to define your service. Fields marked with * are required.
        </p>

        <DynamicForm
          schema={{
            provider_address: {
              type: "string",
              label: "Provider Wallet Address *",
              required: true
            },
            title: {
              type: "string",
              label: "Service Title *",
              required: true
            },
            descriptionURI: {
              type: "string",
              label: "Service Description (IPFS URI) *",
              required: true
            },
            priceWei: {
              type: "string",
              label: "Price in Wei *",
              required: true
            },
            executionType: {
              type: "enum",
              label: "Execution Type",
              required: false,
              options: [
                { label: "HTTP API", value: "http" },
                { label: "Webhook", value: "webhook" },
                { label: "MCP Server", value: "mcp" },
                { label: "Docker Container", value: "docker" },
                { label: "Queue Worker", value: "queue" }
              ]
            },
            inputSchema: {
              type: "json",
              label: "Input Schema (JSON) *",
              required: true
            },
            outputSchema: {
              type: "json",
              label: "Output Schema (JSON) *",
              required: true
            },
            timeout: {
              type: "number",
              label: "Timeout (seconds)",
              required: false,
              min: 1,
              max: 300
            },
            endpoint: {
              type: "string",
              label: "Service Endpoint URL",
              required: false
            },
            metadata: {
              type: "json",
              label: "Metadata (JSON)",
              required: false
            }
          }}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Helper text for JSON schemas */}
      <div className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="
            border-2 border-black
            bg-white
            p-4
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          ">
            <h3 className="mb-2 text-xl font-black">Input Schema Example</h3>
            <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto">{`
{
  "prompt": { "type": "string", "label": "Text Prompt", "required": true },
  "width": { "type": "number", "label": "Image Width", "default": 512 },
  "height": { "type": "number", "label": "Image Height", "default": 512 },
  "style": {
    "type": "enum",
    "label": "Art Style",
    "options": [
      { "label": "Realistic", "value": "realistic" },
      { "label": "Anime", "value": "anime" },
      { "label": "Painting", "value": "painting" }
    ]
  }
}`}</pre>
          </div>
          <div className="
            border-2 border-black
            bg-white
            p-4
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          ">
            <h3 className="mb-2 text-xl font-black">Output Schema Example</h3>
            <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto">{`
{
  "imageUrl": { "type": "string", "format": "uri", "label": "Generated Image URL" },
  "promptUsed": { "type": "string", "label": "Prompt Used for Generation" },
  "generationTime": { "type": "number", "label": "Generation Time (seconds)" }
}`}</pre>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}