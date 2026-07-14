import { useState, useEffect } from "react";
import { dummyGenerationData } from "../assets/assets";
import { ArrowRightIcon, HistoryIcon, Loader2Icon } from "lucide-react";
const AIComposer = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [tone, setTone] = useState<string>("Professional");
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [generations, setGenerations] = useState<any[]>([]);

  //Scheduling State
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Fetch generations from dummy data
  const fetchGenerations = async () => {
    setGenerations(dummyGenerationData);
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  // handle Generate
  const handleGenerate = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Input Section */}

      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl text-slate-700 tracking-tight">
          What should I write?
        </h1>

        {/* Text Area */}
        <div className="relative group mt-12">
          <textarea
            name=""
            id=""
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Share your idea... (e.g. A post about the lunch of our new eco-friendly coffee beans)"
            className="w-full px-6 py-6 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-red-500 transition resize-none h-40 "
          />

          {/* After Text Area Button */}
          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            <button
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-3 bg-red-50 py-2 px-3 rounded-lg"
            >
              <span className="">AI Image</span>
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${generateImage ? "bg-red-500" : "bg-slate-200"}`}
              >
                <span
                  className={`pointer-events-none size-4 transform translate-y-0.5 rounded-full bg-white transition ${generateImage ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </div>
            </button>

            {/* Generate Button */}

            <button
              disabled={loading}
              onClick={handleGenerate}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span className="">Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tones */}

        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all border ${tone === t ? "bg-red-500 text-white border-red-500" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* AI Generated Posts List */}
      <div className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-600">
          {/* Left */}
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            <h2 className="text-xl">Recent Generations</h2>
          </div>
          {/* Right */}
          <span className="text-sm text-slate-500 bg-slate-50 px-2">
            {generations.length} total
          </span>
        </div>

        {/* Mapping Generations List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* {generations.map((g) => (
            
          ))} */}
        </div>
      </div>

      {/* Scheduler Modal */}
    </div>
  );
};

export default AIComposer;
