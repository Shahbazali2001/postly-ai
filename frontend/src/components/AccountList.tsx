import React from "react";
import NoAccountsConnected from "./NoAccountsConnected";
import { PLATFORMS } from "../assets/assets";
import { AlertCircleIcon, CheckCircleIcon, UnplugIcon } from "lucide-react";

interface AccountListProps {
  accounts: any[];
  onDisconnect: (accountId: string) => Promise<void>;
}

const AccountList = ({ accounts, onDisconnect }: AccountListProps) => {
  {
    /* Handling disconnect */
  }
  const handleDisconnect = async (accountId: string) => {
    const confirm = window.confirm("Are you sure you want to disconnect?");
    if (!confirm) {
      return;
    }
    if (confirm) {
      await onDisconnect(accountId);
    }
  };

  if (accounts.length === 0) return <NoAccountsConnected />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {accounts.map((account, index) => {
        const meta = PLATFORMS.find((p) => p.id === account.platform);
        if (!meta) return null;

        return (
          <div
            key={index}
            className="group bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-300 transition-all"
          >
            <div className="size-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <meta.icon className="size-6 text-slate-500" />
            </div>
            {/*Account Handle and Name */}
            <div className="flex-1 min-w-0">
              <div className="truncate text-slate-900">{account.handle}</div>
              <div className="text-sm text-slate-500 mt-0.5">
                {account.name}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {account.status === "connected" ? (
                <>
                  <CheckCircleIcon className="size-4 text-amber-500" />
                  <span className="text-xs text-emerald-600">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircleIcon className="size-4 text-amber-500" />
                  <span className="text-xs text-amber-600">Disconnected</span>
                </>
              )}
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => handleDisconnect(account._id)}
              title="Disconnect Account"
              className="ml-2 p-1.5 rounded-lg text-slate-300 group-hover:text-red-500 transition-all"
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
