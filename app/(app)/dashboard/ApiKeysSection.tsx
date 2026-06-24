"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKey,
  type CreatedApiKey,
} from "@/lib/api";
import ExpansionPanel from "./ExpansionPanel";
import { Skeleton } from "@/app/components/Skeleton";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ApiKeysSection({ token }: { token: string }) {
  const t = useTranslations("keys");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setError(null);
    try {
      setKeys(await listApiKeys(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError(t("nameRequired"));
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await createApiKey(token, newName.trim());
      setRevealed(created);
      setShowCreate(false);
      setNewName("");
      fetchKeys();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(t("revokeConfirm", { name }))) return;
    setRevoking(id);
    try {
      await revokeApiKey(token, id);
      fetchKeys();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setRevoking(null);
    }
  }

  function copyKey() {
    if (!revealed) return;
    navigator.clipboard.writeText(revealed.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyRow(id: string, key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    });
  }

  return (
    <ExpansionPanel
      title={t("title")}
      defaultOpen
      leading={
        <span className="rounded-full bg-beige px-2.5 py-0.5 text-sm font-medium text-muted">
          {keys.length}
        </span>
      }
    >
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
            setNewName("");
          }}
          disabled={showCreate}
          className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-hover disabled:opacity-50 transition-colors"
        >
          {t("newKey")}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
          />
          <button
            type="submit"
            disabled={createLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-hover disabled:opacity-50 transition-colors"
          >
            {createLoading && <Spinner size={13} className="text-white" />}
            {t("create")}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="rounded-full border border-line px-3 py-2 text-sm text-muted hover:bg-bg transition-colors"
          >
            {t("cancel")}
          </button>
        </form>
      )}
      {createError && <p className="mt-2 text-sm text-red-500">{createError}</p>}

      {revealed && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-beige p-4">
          <p className="text-sm font-medium text-primary">{t("keyCreated")}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded border border-line bg-surface px-3 py-2 font-mono text-sm text-primary">
              {revealed.key}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-full bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-hover transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <button
            onClick={() => setRevealed(null)}
            className="mt-2 text-sm text-accent hover:text-hover transition-colors"
          >
            {t("close")}
          </button>
        </div>
      )}

      <div className="mt-4">
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && keys.length === 0 && (
          <p className="text-sm text-muted">{t("noKeys")}</p>
        )}
        {keys.length > 0 && (
          <div className="divide-y divide-line">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{k.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {k.keyPrefix}…
                    {k.revokedAt && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                        {t("revoked")}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t("created", { date: fmt(k.createdAt) })} · {t("lastUsed", { date: fmt(k.lastUsedAt) })}
                  </p>
                </div>
                {!k.revokedAt && (
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    {k.key && (
                      <button
                        onClick={() => copyRow(k.id, k.key!)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:bg-bg transition-colors"
                      >
                        {copiedId === k.id ? t("copied") : t("copy")}
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(k.id, k.name)}
                      disabled={revoking === k.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {revoking === k.id ? "…" : t("revoke")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ExpansionPanel>
  );
}
