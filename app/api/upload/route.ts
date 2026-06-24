import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = "C:\\scan";
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — allow common code/config/binary extensions
    const allowedExtensions = [
      ".py", ".js", ".ts", ".jsx", ".tsx",
      ".java", ".cs", ".cpp", ".c", ".go",
      ".php", ".rb", ".rs", ".kt", ".swift",
      ".json", ".yaml", ".yml", ".xml", ".toml",
      ".txt", ".log", ".sh", ".bat", ".ps1",
      ".zip", ".tar", ".gz", ".jar", ".war",
      ".exe", ".dll", ".so",
    ];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext) && !allowedExtensions.includes(".*")) {
      // Allow anyway but log warning
      console.warn(`Uploading uncommon extension: ${ext}`);
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Safe filename: strip path traversal chars
    const safeFileName =
      `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._\-]/g, "_")}`;
    const filePath = path.join(UPLOAD_DIR, safeFileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`[VulnScan] Saved: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "File saved successfully",
      fileName: safeFileName,
      originalName: file.name,
      savedPath: filePath,
      uploadDir: UPLOAD_DIR,
      size: file.size,
      type: file.type || "application/octet-stream",
    });
  } catch (err: any) {
    console.error("[VulnScan] Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save file" },
      { status: 500 }
    );
  }
}
