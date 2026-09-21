import { useState, useEffect, useRef, useCallback } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  CalendarIcon,
  XIcon,
  ClockIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  SendIcon,
  Trash2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import { api, type ScheduledPost } from "../services/api";

const Scheduler = () => {
  // State Management
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Set default date/time to 1 hour from now
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setScheduledDate(dateStr);
    setScheduledTime(timeStr);
  }, []);

  // Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.posts.getAll();
      setPosts(data);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [mediaFile]);

  // Filter posts published, scheduled, failed
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const published = posts.filter((post) => post.status === "published");

  // Toggle Platform Selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  // Handle Form Submit / Schedule Post
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (selectedPlatforms.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one social media channel",
      });
      return;
    }

    if (!content.trim()) {
      setMessage({ type: "error", text: "Post content cannot be empty" });
      return;
    }

    const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (isNaN(combinedDateTime.getTime())) {
      setMessage({
        type: "error",
        text: "Please enter a valid schedule date and time",
      });
      return;
    }

    setLoading(true);

    try {
      if (mediaFile) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("platforms", JSON.stringify(selectedPlatforms));
        formData.append("scheduledFor", combinedDateTime.toISOString());
        formData.append("status", "scheduled");
        formData.append("media", mediaFile);

        await api.posts.create(formData);
      } else {
        await api.posts.create({
          content,
          platforms: selectedPlatforms,
          scheduledFor: combinedDateTime.toISOString(),
          status: "scheduled",
        });
      }

      setMessage({ type: "success", text: "Post scheduled successfully!" });
      setContent("");
      setMediaFile(null);
      setSelectedPlatforms([]);
      fetchPosts();
    } catch (err: any) {
      console.error("Error scheduling post:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to schedule post",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this scheduled post?"))
      return;
    try {
      await api.posts.delete(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setMessage({ type: "success", text: "Post deleted successfully" });
    } catch (err: any) {
      console.error("Delete post error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to delete post",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
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

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Compose Panel */}
        <div className="w-full lg:w-[460px] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Compose Post
              </h2>
            </div>

            {/* Compose Form */}
            <form className="space-y-5" onSubmit={handleSchedule}>
              {/* Choose Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Platforms
                </label>

                <div className="flex flex-wrap gap-2.5">
                  {PLATFORMS.map((platform) => {
                    const active = selectedPlatforms.includes(platform.id);

                    return (
                      <button
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-red-50 border-red-400 text-red-600 shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        key={platform.id}
                        type="button"
                      >
                        <platform.icon className="size-4" />
                        <span>{platform.name.split("/")[0].trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Post Content
                </label>

                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none resize-none focus:border-red-400 focus:bg-white transition-colors"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  placeholder="What would you like to share today? Add your thoughts, updates or announcements..."
                />

                {/* Character Counter */}
                <div
                  className={`text-right text-xs mt-1 font-medium ${
                    content.length > 280 ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {content.length} characters
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Media Attachment (Optional)
                </label>

                {mediaFile ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {mediaPreviewUrl && mediaFile.type.startsWith("image/") ? (
                      <img
                        src={mediaPreviewUrl}
                        alt="preview"
                        className="w-full h-40 object-cover"
                      />
                    ) : mediaPreviewUrl ? (
                      <video
                        src={mediaPreviewUrl}
                        controls
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                        Preparing preview...
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setMediaFile(null)}
                      className="absolute top-2 right-2 size-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="media-upload"
                    onClick={() => mediaInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/20 transition-all group text-center"
                  >
                    <span className="text-slate-600 text-xs font-medium group-hover:text-red-600 transition-colors">
                      Click to upload image or video
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      PNG, JPG, MP4 up to 50MB
                    </span>
                    <input
                      id="media-upload"
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*, video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMediaFile(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Schedule Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      type="date"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-red-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Schedule Time
                  </label>
                  <div className="relative">
                    <ClockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      type="time"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-red-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-sm font-medium flex items-center justify-center gap-2 py-3.5 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition-all duration-200 shadow-md shadow-red-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />{" "}
                      Scheduling...
                    </>
                  ) : (
                    <>
                      Schedule Post <ArrowRightIcon className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Queue Panel Display Published and Scheduled Posts */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Upcoming Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <CalendarDaysIcon className="size-4.5 text-slate-600" />
              <h3 className="text-slate-900 font-semibold text-sm">
                Upcoming Queue
              </h3>
              <span className="ml-auto text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {scheduled.length} Scheduled
              </span>
            </div>

            {/* Upcoming Posts List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {fetching ? (
                <div className="py-12 flex justify-center">
                  <Loader2Icon className="size-6 text-red-500 animate-spin" />
                </div>
              ) : scheduled.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No posts scheduled yet. Create one on the left!
                </div>
              ) : (
                scheduled.map((post) => (
                  <div
                    key={post._id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Platform Icons */}
                        <div className="flex gap-1.5 items-center">
                          {post.platforms.map((platformId: string) => {
                            const meta = PLATFORMS.find(
                              (p) => p.id === platformId,
                            );
                            return meta ? (
                              <span
                                key={platformId}
                                className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200"
                                title={meta.name}
                              >
                                <meta.icon className="size-3.5" />
                              </span>
                            ) : null;
                          })}
                        </div>

                        {post.mediaType && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium uppercase">
                            {post.mediaType}
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          {new Date(post.scheduledFor).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                        {post.content}
                      </p>

                      {post.mediaUrl && (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 mt-2">
                          <img
                            src={post.mediaUrl}
                            alt="Media preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Delete post"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Published Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <SendIcon className="size-4.5 text-slate-600" />
              <h3 className="text-slate-900 font-semibold text-sm">
                Published History
              </h3>
              <span className="ml-auto text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {published.length} Published
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {fetching ? (
                <div className="py-12 flex justify-center">
                  <Loader2Icon className="size-6 text-red-500 animate-spin" />
                </div>
              ) : published.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No published posts yet.
                </div>
              ) : (
                published.map((post) => (
                  <div
                    key={post._id}
                    className="p-5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex gap-1.5 items-center">
                        {post.platforms.map((platformId: string) => {
                          const meta = PLATFORMS.find(
                            (p) => p.id === platformId,
                          );
                          return meta ? (
                            <span
                              key={platformId}
                              className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200"
                              title={meta.name}
                            >
                              <meta.icon className="size-3.5" />
                            </span>
                          ) : null;
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {new Date(
                            post.updatedAt || post.scheduledFor,
                          ).toLocaleString()}
                        </span>
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          Published
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                      {post.content}
                    </p>

                    {post.mediaUrl && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 mt-2">
                        <img
                          src={post.mediaUrl}
                          alt="Media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
