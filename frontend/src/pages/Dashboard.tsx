import {
  ActivityIcon,
  CircleCheckIcon,
  ClockIcon,
  SendIcon,
  Share2Icon,
  TrendingUpIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type ActivityItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const [posts, accounts, activityList] = await Promise.all([
        api.posts.getAll().catch(() => []),
        api.accounts.getAll().catch(() => []),
        api.activity.getAll().catch(() => []),
      ]);

      setStats({
        scheduled: posts.filter((post) => post.status === "scheduled").length,
        published: posts.filter((post) => post.status === "published").length,
        connectedAccounts: accounts.filter(
          (account) => account.status === "connected",
        ).length,
      });

      setActivities(activityList);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Scheduled Posts",
      value: stats.scheduled,
      icon: ClockIcon,
      trend: "In Queue",
    },
    {
      label: "Published Posts",
      value: stats.published,
      icon: CircleCheckIcon,
      trend: "Live Posts",
    },
    {
      label: "Connected Accounts",
      value: stats.connectedAccounts,
      icon: Share2Icon,
      trend: "Active Channels",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Bar */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.name?.split(" ")[0] || "Creator"} 👋
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Here is what is happening across your social media channels today
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="size-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white hover:bg-red-50/40 relative border border-slate-200 rounded-2xl p-6 hover:border-red-200 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-semibold text-slate-800 tabular-nums">
                    {card.value}
                  </div>
                  <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 border border-red-100">
                    <TrendingUpIcon className="size-3 text-red-500" />
                    {card.trend}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <card.icon className="size-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Activities Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-slate-900 font-semibold text-base">
                Recent Activities
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                {activities.length} events
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <ActivityIcon className="size-6 text-red-500" />
                </div>
                <p className="text-slate-600 font-medium">
                  No activity recorded yet
                </p>
                <p className="text-slate-400 text-sm mt-1 text-center max-w-sm">
                  Connect social accounts and schedule posts to see publishing
                  logs and engagement updates here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600 border border-red-100">
                      <SendIcon className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                          {activity.actionType.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        {activity.description}
                      </p>
                      {activity.relatedPost?.content && (
                        <p className="text-xs text-slate-400 truncate mt-0.5 italic">
                          "{activity.relatedPost.content}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
