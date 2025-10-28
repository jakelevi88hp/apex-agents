'use server';

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'apex-agents-knowledge-base';

export interface UploadFileConfig {
  file: Buffer;
  fileName: string;
  contentType: string;
  userId: string;
}

export async function uploadFile(config: UploadFileConfig) {
  const key = `${config.userId}/${Date.now()}-${config.fileName}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: config.file,
        ContentType: config.contentType,
      })
    );

    return {
      success: true,
      key,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function getFileUrl(key: string, expiresIn: number = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate URL',
    };
  }
}

