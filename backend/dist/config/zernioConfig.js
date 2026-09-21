import "dotenv/config";
import ZernioPkg from "@zernio/node";
const apiKey = process.env.ZERNIO_API_KEY?.trim() || "";
const baseURL = process.env.ZERNIO_BASE_URL?.trim() || "https://zernio.com/api";
const ZernioConstructor = ZernioPkg.Zernio || ZernioPkg.default || ZernioPkg;
const zernio = new ZernioConstructor({
    apiKey,
    baseURL,
});
export default zernio;
