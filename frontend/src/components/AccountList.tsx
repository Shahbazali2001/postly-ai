import NoAccountsConnected from "./NoAccountsConnected";
import { PLATFORMS } from "../assets/assets";
import { AlertCircleIcon, CheckCircleIcon, UnplugIcon } from "lucide-react";
import type { ConnectedAccount } from "../services/api";

interface AccountListProps {
  accounts: ConnectedAccount[];
  onDisconnect: (accountId: string) => Promise<void>;
}

const AccountList = ({ accounts, onDisconnect }: AccountListProps) => {
  const handleDisconnect = async (accountId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to disconnect this account?",
    );
    if (!confirm) {
      return;
    }
    await onDisconnect(accountId);
  };

  if (accounts.length === 0) return <NoAccountsConnected />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {accounts.map((account) => {
        const meta = PLATFORMS.find((p) => p.id === account.platform);
        if (!meta) return null;

        return (
          <div
            key={account._id}
            className="group bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="size-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
              <meta.icon className="size-6 text-slate-600" />
            </div>
            {/* Account Handle and Name */}
            <div className="flex-1 min-w-0">
              <div className="truncate font-semibold text-slate-800 text-sm">
                {account.handle}
              </div>
              <div className="text-xs text-slate-400 capitalize mt-0.5">
                {meta.name}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {account.status === "connected" ? (
                <>
                  <CheckCircleIcon className="size-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <AlertCircleIcon className="size-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">
                    Disconnected
                  </span>
                </>
              )}
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => handleDisconnect(account._id)}
              title="Disconnect Account"
              className="ml-2 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <UnplugIcon className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AccountList;
