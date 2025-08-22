import fs from "fs";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), "public", "temp");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });  // create folder automatically
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "-" + file.originalname); // avoid overwriting same filenames
  }
});

export const upload = multer({ storage });
