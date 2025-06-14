import cors from "cors";

const devCorsOrigin = "http://localhost:3000";

export const socketCors = {
	origin: devCorsOrigin,
	methods: ["GET", "POST"],
};
