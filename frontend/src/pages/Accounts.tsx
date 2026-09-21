import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PLATFORMS } from "../assets/assets";
import {
  PlusIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import AccountList from "../components/AccountList";
import PlatformPickerModal from "../components/PlatformPickerModal";
import { api, type ConnectedAccount } from "../services/api";

const Accounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const fetchAccounts = useCallback(async (showSync = false) => {
    if (showSync) setSyncing(true);
    try {
      if (showSync) {
        await api.accounts.sync().catch(() => {});
      }
      const data = await api.accounts.getAll();
      setAccounts(data);
    } catch (err: any) {
      console.error("Error loading accounts:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to load connected accounts",
      });
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const connectedPlatform = searchParams.get("connected");
    if (connectedPlatform) {
      setMessage({
        type: "success",
        text: `Successfully connected ${connectedPlatform}! Syncing accounts...`,
      });
      fetchAccounts(true);
      setSearchParams({});
    } else {
      fetchAccounts(false);
    }
  }, [fetchAccounts, searchParams, setSearchParams]);

  // Handle Connect
  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    setMessage(null);
    try {
      const { url } = await api.accounts.getConnectUrl(platformId);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No authorization URL returned by server");
      }
    } catch (err: any) {
      console.error("Connect error:", err);
      setMessage({
        type: "error",
        text: err?.message || `Failed to initiate connection to ${platformId}`,
      });
      setConnecting(null);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async (accountId: string) => {
    try {
      await api.accounts.disconnect(accountId);
      setAccounts((prev) =>
        prev.filter((account) => account._id !== accountId),
      );
      setMessage({
        type: "success",
        text: "Account disconnected successfully",
      });
    } catch (err: any) {
      console.error("Disconnect error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to disconnect account",
      });
    }
  };

  const connectedIds = accounts.map((a) => a.platform);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Connected Accounts
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {accounts.length} of {PLATFORMS.length} platforms connected
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchAccounts(true)}
            disabled={syncing || loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-60"
            title="Sync accounts from Zernio"
          >
            <RefreshCwIcon
              className={`size-4 ${syncing ? "animate-spin text-red-500" : "text-slate-500"}`}
            />
            <span>{syncing ? "Syncing..." : "Sync"}</span>
          </button>

          <button
            onClick={() => setShowPlatformPicker(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-red-500/20 w-full sm:w-auto cursor-pointer"
          >
            <PlusIcon className="size-4" /> Connect Account
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2Icon className="size-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircleIcon className="size-5 text-red-500 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs hover:underline cursor-pointer font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Platform Picker Modal */}
      {showPlatformPicker && (
        <PlatformPickerModal
          connectedIds={connectedIds}
          connecting={connecting}
          onClose={() => setShowPlatformPicker(false)}
          onConnect={handleConnect}
        />
      )}

      {/* Connected Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="size-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
      )}
    </div>
  );
};

export default Accounts;
