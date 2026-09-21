import { useState, useEffect, useCallback } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  HistoryIcon,
  Loader2Icon,
  TimerIcon,
  Wand2Icon,
  XIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { api, type AIGeneration } from "../services/api";

const AIComposer = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [tone, setTone] = useState<string>("Professional");
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(true);
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Scheduling State
  const [activeScheduler, setActiveScheduler] = useState<AIGeneration | null>(
    null,
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Initialize date/time for modal
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setScheduledDate(now.toISOString().split("T")[0]);
    setScheduledTime(now.toTimeString().slice(0, 5));
  }, []);

  // Fetch generations from backend
  const fetchGenerations = useCallback(async () => {
    try {
      const data = await api.posts.getGenerations();
      setGenerations(data);
    } catch (err: any) {
      console.error("Error fetching AI generations:", err);
    } finally {
      setFetchingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  // Handle Generate with Gemini AI
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setMessage({
        type: "error",
        text: "Please enter an idea or prompt first",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.posts.generate({
        prompt,
        tone,
        generateImage,
      });

      setMessage({ type: "success", text: "New social media post generated!" });
      setGenerations((prev) => [response.generation, ...prev]);
      setPrompt("");
    } catch (err: any) {
      console.error("Error generating with Gemini:", err);
      setMessage({
        type: "error",
        text:
          err?.message ||
          "Failed to generate post. Please verify your Gemini API key and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tones
  const tones = [
    "Professional",
    "Creative",
    "Casual",
    "Formal",
    "Sassy",
    "Funny",
    "Serious",
    "Emotional",
    "Exciting",
  ];

  // Handle Schedule of AI Generation
  const handleScheduleGeneration = async () => {
    if (!activeScheduler) return;

    if (selectedPlatforms.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one social media channel",
      });
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

    setScheduling(true);

    try {
      await api.posts.create({
        content: activeScheduler.content,
        platforms: selectedPlatforms,
        scheduledFor: combinedDateTime.toISOString(),
        status: "scheduled",
        mediaUrl: activeScheduler.mediaUrl,
        mediaType:
          activeScheduler.mediaType ||
          (activeScheduler.mediaUrl ? "image" : undefined),
      });

      setMessage({
        type: "success",
        text: "Post successfully added to your publishing queue!",
      });
      setActiveScheduler(null);
      setSelectedPlatforms([]);
    } catch (err: any) {
      console.error("Error scheduling AI post:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to schedule post",
      });
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
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

      {/* Input Section */}
      <div className="space-y-6 text-center mt-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            AI Content Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Turn your raw ideas into high-performing social media posts and
            visuals powered by Google Gemini
          </p>
        </div>

        {/* Text Area */}
        <div className="relative group mt-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Share your idea... (e.g. Announce the launch of our new eco-friendly coffee beans with a 20% discount code)"
            className="w-full px-6 py-6 pb-20 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none h-44 shadow-xs"
          />

          {/* Controls Bar */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 px-3 rounded-xl cursor-pointer transition-colors"
            >
              <span className="text-xs font-medium text-slate-700">
                AI Visual
              </span>
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                  generateImage ? "bg-red-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none size-4 transform translate-y-0.5 rounded-full bg-white transition-transform ${
                    generateImage ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>

            {/* Generate Button */}
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md shadow-red-500/20 disabled:opacity-60 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Crafting Post...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tones */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Choose Tone of Voice
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                  tone === t
                    ? "bg-red-500 text-white border-red-500 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Generated Posts List */}
      <div className="space-y-6 pt-10 border-t border-slate-200">
        <div className="flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5 text-slate-500" />
            <h2 className="text-xl font-semibold">Generation History</h2>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            {generations.length} total
          </span>
        </div>

        {fetchingHistory ? (
          <div className="py-16 flex justify-center">
            <Loader2Icon className="size-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {generations.map((gen) => (
              <div
                className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-red-300 transition-all relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md"
                key={gen._id}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                      {gen.tone}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 italic line-clamp-1">
                    "{gen.prompt}"
                  </p>

                  <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap leading-relaxed">
                    {gen.content}
                  </p>

                  {gen.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                      <img
                        className="w-full aspect-video object-cover"
                        src={gen.mediaUrl}
                        alt="AI generated visual"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveScheduler(gen)}
                    className="w-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-700 text-xs font-medium py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <TimerIcon className="size-3.5" />
                    <span>Schedule this Post</span>
                  </button>
                </div>
              </div>
            ))}

            {generations.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Wand2Icon className="size-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-sm">
                  No content generated yet
                </p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Type an idea into the box above and click Generate to create
                  your first AI-crafted post.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scheduler Modal */}
      {activeScheduler && (
        <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-slate-800 font-semibold text-base">
                Schedule AI Generated Post
              </h3>
              <button
                onClick={() => setActiveScheduler(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors cursor-pointer"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                  Prompt Idea
                </p>
                <p className="text-slate-700 text-sm">
                  {activeScheduler.prompt}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                  Post Content
                </p>
                <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {activeScheduler.content}
                </p>
                {activeScheduler.mediaUrl && (
                  <img
                    src={activeScheduler.mediaUrl}
                    className="w-full aspect-video object-cover rounded-xl border border-slate-200"
                    alt="Generated Visual"
                  />
                )}
              </div>

              {/* Platform & Scheduling Controls */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Select Channels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => {
                      const isSelected = selectedPlatforms.includes(
                        platform.id,
                      );

                      return (
                        <button
                          key={platform.id}
                          type="button"
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            isSelected
                              ? "bg-red-50 border-red-400 text-red-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                          onClick={() =>
                            setSelectedPlatforms((prev) =>
                              prev.includes(platform.id)
                                ? prev.filter((x) => x !== platform.id)
                                : [...prev, platform.id],
                            )
                          }
                        >
                          <platform.icon className="size-4" />
                          <span>{platform.name.split("/")[0].trim()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date and Time Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-red-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <ClockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="time"
                        required
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-red-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveScheduler(null)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={scheduling}
                onClick={handleScheduleGeneration}
                className="flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium py-2.5 px-6 rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-60 cursor-pointer"
              >
                {scheduling ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <TimerIcon className="size-4" />
                )}
                <span>Schedule Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIComposer;
