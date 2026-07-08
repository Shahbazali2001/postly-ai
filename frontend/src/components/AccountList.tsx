import React from "react";
import NoAccountsConnected from "./NoAccountsConnected";
import { PLATFORMS } from "../assets/assets";

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

  if (accounts.length === 0) {
    <NoAccountsConnected />;
  }

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
            <div>
              <div className="truncate text-slate-900">{account.handle}</div>
              <div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountList;
