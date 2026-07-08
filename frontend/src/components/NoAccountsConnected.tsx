import React from "react";
import { PlusIcon } from "lucide-react";

const NoAccountsConnected = () => {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-20 px-6">
      <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
        <PlusIcon className="size-6 text-slate-500 opacity-50" />
      </div>
      <p className="text-slate-700 text-lg">No accounts connected</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">
        Connect your accounts to start scheduling and automating your social
        media
      </p>
    </div>
  );
};

export default NoAccountsConnected;
