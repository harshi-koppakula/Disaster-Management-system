import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncidentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const formSchema = insertIncidentSchema.extend({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormData = {
  title: string;
  description: string;
  location: string;
  type: string;
  status: "active" | "in_progress" | "resolved";
  priority: "high" | "medium" | "low";
  affectedCount: number;
  reportedBy: number;
  latitude?: string;
  longitude?: string;
};

// Add these props to your component or define them as needed
type IncidentFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function IncidentForm({ open, onOpenChange }: IncidentFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      priority: "medium",
      type: "other",
      reportedBy: 1, // Current user - in real app this would come from auth
      affectedCount: 0,
      status: "active", // Add default status to match schema
      latitude: "",
      longitude: "",
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { latitude, longitude, ...incidentData } = data;

      let coordinates;
      if (
        latitude &&
        longitude &&
        !isNaN(Number(latitude)) &&
        !isNaN(Number(longitude))
      ) {
        coordinates = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
      }

      // Only include coordinates if defined
      return apiRequest("POST", "/api/incidents", {
        ...incidentData,
        ...(coordinates ? { coordinates } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Incident reported",
        description: "The incident has been successfully reported.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createIncidentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Report New Incident</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as (data: any) => void)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the incident"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the incident"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flood">Flood</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="earthquake">Earthquake</SelectItem>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="power_outage">Power Outage</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address or location description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="40.7128" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="-74.0060" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="affectedCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Affected Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value, 10));
                      }}
                      value={field.value === 0 ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createIncidentMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {createIncidentMutation.isPending
                  ? "Reporting..."
                  : "Report Incident"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
export default IncidentForm;

