import { useState, useEffect } from "react";
import { dummyPostsData, PLATFORMS } from "../assets/assets";
import { XIcon } from "lucide-react";

const Scheduler = () => {
  //State Management
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch posts from dummy data

  const fetchPosts = async () => {
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    (async () => await fetchPosts())();
    const interval = setInterval(() => fetchPosts(), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter posts published and scheduled
  const scheduled = posts.filter((post: any) => post.status === "scheduled");
  const published = posts.filter((post: any) => post.status === "published");

  // Toggle Platform Selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  // Handle Form Submit OR Handle Schedule
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPosts((prev) => [...prev, dummyPostsData[0]]);
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Compose Panel */}
      <div className="w-full lg:w-[460px] shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg text-slate-700">Compose Post</h2>
          </div>

          {/* Compose Form */}
          <form className="space-y-5" action="" onSubmit={handleSchedule}>
            {/* Choose Platform */}
            <div>
              <label
                className="block text-xs text-slate-500 uppercase mb-2"
                htmlFor=""
              >
                Platforms
              </label>

              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((platform) => {
                  const active = selectedPlatforms.includes(platform.id);

                  return (
                    <button
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-1.5 p-3 rounded-md border transition-all duration-150 ${active ? "bg-red-50 border-red-300 text-red-500 scale-105" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                      key={platform.id}
                      type="button"
                    >
                      <platform.icon className="size-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor=""
                className="block text-xs text-slate-500 uppercase mb-2"
              >
                Content
              </label>

              <textarea
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 outline-none resize-none focus:border-red-300"
                name=""
                id=""
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="What do you want to share today?"
              />

              {/* Character Counter */}
              <div
                className={`text-right text-xs mt-1 font-medium ${content.length > 280 ? "text-red-500" : "text-slate-400"} `}
              >
                {content.length}/280
              </div>
            </div>

            {/* Media Upload */}

            <div className="">
              <label
                htmlFor=""
                className="block text-xs text-slate-500 uppercase mb-2"
              >
                Media (Optional)
              </label>

              {mediaFile ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {mediaFile.type.startsWith("/image") ? (
                    <img
                      src={URL.createObjectURL(mediaFile)}
                      alt="preview"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(mediaFile)}
                      controls
                      className="w-full h-40 object-cover"
                    />
                  )}

                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => setMediaFile(null)}
                    className="absolute top-2 right-2 size-7 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor=""
                  className="flex items-center justify-center gap-2 p-5 py-10 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all duration-100 group hover:scale-101"
                >
                  <span className="text-slate-500 text-sm group-hover:text-red-500 transition-colors">
                    Click to Upload image or video
                  </span>
                  <input
                    type="file"
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && setMediaFile(e.target.files[0])
                    }
                  />
                </label>
              )}
            </div>

            {/* Date and Time */}

            {/* Submit */}
          </form>
        </div>
      </div>

      {/* Queue Panel */}
      <div className=""></div>
    </div>
  );
};

export default Scheduler;
