import axios from "axios";

export const fetchMusicStream = async (url) => {
    try {
        const response = await axios.get(`https://sec-c-music-api.onrender.com/stream?url=${encodeURIComponent(url)}`, {
            responseType: "arraybuffer",
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching stream:", error);
    }
};
