import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter for supported formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",                                                            // PDF
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",    // DOCX
    "text/plain",                                                                 // TXT
    "image/jpeg",                                                                 // JPG/JPEG
    "image/png",                                                                  // PNG
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format. Please upload PDF, DOCX, TXT, or PNG/JPG images."), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
});
