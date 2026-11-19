import { FilterToolbar } from './components/FilterToolbar';
import { KpiStrip } from './components/KpiStrip';
import { SettlementDetailDrawer } from './components/SettlementDetailDrawer';
import { SettlementTable } from './components/SettlementTable';
import { EmptyState, ErrorBanner, LoadingSkeleton } from './components/StateBanner';
import { useSettlements } from './hooks/useSettlements';
import './App.css';

export function App() {
  const {
    items,
    totalCount,
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
    selectException,
    closeDetail,
    updateStatus,
    addNote,
    triggerSync,
    retryLoad,
  } = useSettlements();

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Financial Operations · Settlement Triage</p>
          <h1 className="app-title">ReconDesk</h1>
        </div>

        <div className="top-bar-actions">
          <label className="checkbox-label checkbox-label--subtle">
            <input
              type="checkbox"
              checked={simulateNextError}
              onChange={(e) => setSimulateNextError(e.target.checked)}
            />
            <span>Fail next sync</span>
          </label>

          <button
            type="button"
            className="btn btn--primary"
            onClick={triggerSync}
            disabled={isLoading || isSyncing}
          >
            {isSyncing ? 'Syncing Batch...' : 'Sync Batch'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <KpiStrip kpis={kpis} isLoading={isLoading} />

        <FilterToolbar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          resultCount={items.length}
          totalCount={totalCount}
          onFilterChange={setFilter}
          onResetFilters={resetFilters}
          onSortChange={toggleSort}
        />

        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={retryLoad} />
        ) : items.length === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} onResetFilters={resetFilters} />
        ) : (
          <SettlementTable
            items={items}
            selectedId={selectedException?.id ?? null}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSort={toggleSort}
            onSelect={selectException}
          />
        )}
      </main>

      <SettlementDetailDrawer
        exception={selectedException}
        onClose={closeDetail}
        onUpdateStatus={updateStatus}
        onAddNote={addNote}
      />
    </div>
  );
}

export default App;
