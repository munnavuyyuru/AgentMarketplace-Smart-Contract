import { supabase } from "../config/supabase.js";
import { ExecutionService } from "./execution.service.js";

/**
 * Service for invoking services after payment verification.
 * This service handles the complete flow of service execution:
 * 1. Retrieve service and manifest
 * 2. Validate inputs (if needed)
 * 3. Execute using ExecutionService
 * 4. Return formatted response
 */
export class ServiceInvocationService {
  /**
   * Invoke a service by its ID with the given inputs.
   * This would typically be called after successful x402 payment verification.
   */
  static async invokeService(
    serviceId: number,
    inputs: Record<string, any>,
    buyerAddress: string,
  ): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      // Fetch the service with its manifest
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select(
          `
          *,
          service_manifests (
            execution_type,
            input_schema,
            output_schema,
            timeout,
            endpoint,
            metadata
          )
        `,
        )
        .eq("service_id", serviceId)
        .single();

      if (serviceError) {
        console.error("Error fetching service:", serviceError);
        return {
          success: false,
          error: "Service not found",
        };
      }

      if (!serviceData) {
        return {
          success: false,
          error: "Service not found",
        };
      }

      // Flatten the service data for easier access
      const service = {
        ...serviceData,
        ...(serviceData.service_manifests?.[0] || {}),
        service_manifests: undefined,
      };

      // TODO: Input validation against inputSchema
      // In a production implementation, we would validate inputs here
      // using a JSON schema validator like ajv

      // Execute the service
      const result = await ExecutionService.execute(service, inputs);

      // TODO: Output validation against outputSchema
      // We would validate the result here as well

      // Log the invocation for auditing/history
      await this.logInvocation(serviceId, buyerAddress, inputs, result);

      return {
        success: true,
        result: result,
      };
    } catch (error) {
      console.error("Error invoking service:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      };
    }
  }

  /**
   * Log a service invocation for auditing and usage history.
   */
  private static async logInvocation(
    serviceId: number,
    buyerAddress: string,
    inputs: Record<string, any>,
    result: any,
  ): Promise<void> {
    try {
      // We could create a service_invocations table for this
      // For now, we'll just log to console or extend as needed
      console.log(
        `Service invocation: service_id=${serviceId}, buyer=${buyerAddress}, time=${new Date().toISOString()}`,
      );

      // TODO: Implement actual logging to a service_invocations table
      // await supabase.from("service_invocations").insert({
      //   service_id: serviceId,
      //   buyer_address: buyerAddress,
      //   inputs: inputs,
      //   output: result,
      //   invoked_at: new Date()
      // });
    } catch (error) {
      console.error("Error logging service invocation:", error);
      // Don't fail the invocation if logging fails
    }
  }

  /**
   * Get invocation history for a service.
   */
  static async getInvocationHistory(
    serviceId: number,
    limit: number = 100,
  ): Promise<any[]> {
    try {
      // TODO: Implement this when we have a service_invocations table
      // const { data, error } = await supabase
      //   .from("service_invocations")
      //   .select("*")
      //   .eq("service_id", serviceId)
      //   .order("invoked_at", { ascending: false })
      //   .limit(limit);

      // return data || [];

      // For now, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching invocation history:", error);
      return [];
    }
  }
}
