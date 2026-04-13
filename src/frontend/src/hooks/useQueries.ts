import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdmissionForm, Class, Student } from "../types";
import { useActor } from "./useBackendActor";

const ADMIN_PASSWORD = "InterSchool@951";

export function useRegisterStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      _class,
      name,
      email,
      password,
    }: {
      _class: Class;
      name: string;
      email: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).registerStudent(_class, name, email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useLoginStudent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).loginStudent(email, password);
    },
  });
}

export function useGetCallerStudent() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Student | null>({
    queryKey: ["callerStudent"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Student | null>
        >
      ).getCallerStudent() as Promise<Student | null>;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSaveDraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      form,
    }: { email: string; form: AdmissionForm }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).saveDraft(email, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerStudent"] });
    },
  });
}

export function useSubmitForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      form,
    }: { email: string; form: AdmissionForm }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).submitForm(email, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerStudent"] });
    },
  });
}

export function useGetAllApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // Use password-based admin function to bypass principal/role check
      const result = (await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Student[]>
        >
      ).getAllApplicationsForAdmin(ADMIN_PASSWORD)) as Student[];
      return result;
    },
    enabled: !!actor && !actorFetching,
    refetchOnMount: "always",
    staleTime: 0,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useGetAllAdmissionNumbers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Map<string, string>>({
    queryKey: ["allAdmissionNumbers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const pairs = (await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<[string, string][]>
        >
      ).getAllAdmissionNumbers()) as [string, string][];
      const map = new Map<string, string>();
      for (const [email, admNo] of pairs) {
        map.set(email, admNo);
      }
      return map;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useGetAdmissionNumber(email: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ["admissionNumber", email],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!email) return "";
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<string>
        >
      ).getAdmissionNumber(email) as Promise<string>;
    },
    enabled: !!actor && !actorFetching && !!email,
    staleTime: 60000,
  });
}

export function useApproveApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).approveApplicationForAdmin(email, ADMIN_PASSWORD);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).rejectApplicationForAdmin(email, ADMIN_PASSWORD);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useGetApplicationStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).getApplicationStatus(email);
    },
  });
}
