import "dotenv/config";
import Zernio from "@zernio/node";

const apiKey = process.env.ZERNIO_API_KEY?.trim() || "";
const baseURL = process.env.ZERNIO_BASE_URL?.trim() || "";

const zernio = new Zernio({
    apiKey,
    baseURL
});

export default zernio;