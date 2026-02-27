"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ConfirmVariant = "default" | "destructive";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const resolveAndClose = useCallback((value: boolean) => {
    setState(null);
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        ...options,
        isOpen: true,
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const confirmModal = (
    <ConfirmDialog
      isOpen={Boolean(state?.isOpen)}
      onClose={() => resolveAndClose(false)}
      onConfirm={() => resolveAndClose(true)}
      title={state?.title ?? "Confirmar acción"}
      description={state?.description ?? ""}
      confirmText={state?.confirmText}
      cancelText={state?.cancelText}
      variant={state?.variant ?? "default"}
    />
  );

  return { confirm, confirmModal };
}
