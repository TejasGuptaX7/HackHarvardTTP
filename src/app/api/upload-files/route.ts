import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Ensure threeassets directory exists
    const uploadDir = join(process.cwd(), 'threeassets');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
    }

    const savedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      savedFiles.push({
        originalName: file.name,
        savedName: fileName,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      files: savedFiles 
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' }, 
      { status: 500 }
    );
  }
}
