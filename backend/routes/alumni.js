import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { authenticateJWT, optionalJWT } from "../utils/jwt.js";
import { getAlumniList, createAlumniEntry } from "../controllers/alumniController.js";

const router = express.Router();

const alumniUploadDir = path.join(process.cwd(), "uploads", "alumni");
if (!fs.existsSync(alumniUploadDir)) {
	fs.mkdirSync(alumniUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, alumniUploadDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || "") || ".jpg";
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith("image/")) {
			cb(null, true);
			return;
		}
		cb(new Error("Only image uploads are allowed"));
	},
});

// Public alumni listing endpoint
router.get("/", optionalJWT, getAlumniList);

// Allowed only for authenticated users with an accepted application
router.post("/", authenticateJWT, upload.single("pictureFile"), createAlumniEntry);

export default router;
