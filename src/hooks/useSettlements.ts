import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSettlementExceptions } from "../api/settlementsApi";
import type {
  ExceptionStatus,
  SettlementException,
  SettlementFilters,
  SortDirection,
  SortField,
} from "../types/settlement";
import { formatStatusLabel, getSlaInfo } from "../utils/sla";

export interface KpiSummary {
  unresolvedCount: number;
  atRiskCount: number;
  unresolvedVolumeUsd: number;
  escalatedCount: number;
}

export function useSettlements() {
  const [items, setItems] = useState<SettlementException[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateNextError, setSimulateNextError] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("sla");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [filters, setFilters] = useState<SettlementFilters>({
    search: "",
    status: "all",
    severity: "all",
    slaAtRiskOnly: false,
  });

  const loadData = useCallback(
    async (opts?: { isRefresh?: boolean; forceError?: boolean }) => {
      const refresh = Boolean(opts?.isRefresh);
      if (refresh) {
        setIsSyncing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchSettlementExceptions({
          simulateError: opts?.forceError ?? false,
          latencyMs: refresh ? 450 : 600,
        });
        setItems(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unexpected error while loading settlement exceptions.";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setFilter = useCallback(
    <K extends keyof SettlementFilters>(
      key: K,
      value: SettlementFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "all",
      severity: "all",
      slaAtRiskOnly: false,
    });
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setSortDirection(field === "amount" ? "desc" : "asc");
      return field;
    });
  }, []);

  const updateStatus = useCallback(
    (id: string, nextStatus: ExceptionStatus) => {
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id || item.status === nextStatus) return item;
          return {
            ...item,
            status: nextStatus,
            assignee: item.assignee ?? "A. Nair",
            updatedAt: nowIso,
            auditTrail: [
              ...item.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: nowIso,
                actor: "A. Nair",
                summary: `Updated status to ${formatStatusLabel(nextStatus)}.`,
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const addNote = useCallback((id: string, rawNote: string) => {
    const note = rawNote.trim();
    if (!note) return;
    const nowIso = new Date().toISOString();

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          updatedAt: nowIso,
          notes: [...item.notes, note],
          auditTrail: [
            ...item.auditTrail,
            {
              id: `aud-${Date.now()}`,
              timestamp: nowIso,
              actor: "A. Nair",
              summary: `Added operational note: "${note}"`,
            },
          ],
        };
      }),
    );
  }, []);

  const kpis = useMemo<KpiSummary>(() => {
    const nowMs = Date.now();
    let unresolvedCount = 0;
    let atRiskCount = 0;
    let unresolvedVolumeUsd = 0;
    let escalatedCount = 0;

    for (const item of items) {
      if (item.status !== "resolved") {
        unresolvedCount += 1;
        unresolvedVolumeUsd += item.amountUsd;
        if (getSlaInfo(item, nowMs).isAtRisk) {
          atRiskCount += 1;
        }
      }
      if (item.status === "escalated") {
        escalatedCount += 1;
      }
    }

    return {
      unresolvedCount,
      atRiskCount,
      unresolvedVolumeUsd,
      escalatedCount,
    };
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    const nowMs = Date.now();
    const query = filters.search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }
      if (filters.severity !== "all" && item.severity !== filters.severity) {
        return false;
      }
      if (filters.slaAtRiskOnly && !getSlaInfo(item, nowMs).isAtRisk) {
        return false;
      }
      if (query) {
        const haystack =
          `${item.referenceCode} ${item.counterparty} ${item.bankCode} ${item.batchId} ${item.bankReasonCode}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });

    const dirMultiplier = sortDirection === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (sortField === "sla") {
        const slaA = getSlaInfo(a, nowMs).minutesRemaining;
        const slaB = getSlaInfo(b, nowMs).minutesRemaining;
        return (slaA - slaB) * dirMultiplier;
      }
      if (sortField === "amount") {
        return (a.amountUsd - b.amountUsd) * dirMultiplier;
      }
      return (
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
        dirMultiplier
      );
    });
  }, [items, filters, sortField, sortDirection]);

  const selectedException = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.severity !== "all" ||
    filters.slaAtRiskOnly;

  const triggerSync = useCallback(() => {
    const shouldFail = simulateNextError;
    setSimulateNextError(false);
    loadData({ isRefresh: true, forceError: shouldFail });
  }, [loadData, simulateNextError]);

  const retryLoad = useCallback(() => {
    loadData({ isRefresh: false, forceError: false });
  }, [loadData]);

  return {
    items: filteredAndSortedItems,
    totalCount: items.length,
    isLoading,
    isSyncing,
    error,
    simulateNextError,
    setSimulateNextError,
    filters,
    hasActiveFilters,
    setFilter,
    resetFilters,
    sortField,
    sortDirection,
    toggleSort,
    kpis,
    selectedException,
    selectException: setSelectedId,
    closeDetail: () => setSelectedId(null),
    updateStatus,
    addNote,
    triggerSync,
    retryLoad,
  };
}
