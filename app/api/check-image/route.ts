import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log(`Checking image URL: ${imageUrl}`);
    
    // Check if the URL is external (starts with http/https)
    if (imageUrl.startsWith('http')) {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        
        if (response.ok) {
          return NextResponse.json({ 
            exists: true, 
            status: response.status,
            contentType: response.headers.get('content-type'),
            message: 'Image is accessible'
          });
        } else {
          return NextResponse.json({ 
            exists: false, 
            status: response.status,
            message: `Image is not accessible. Server returned status ${response.status}`
          });
        }
      } catch (error) {
        return NextResponse.json({ 
          exists: false, 
          message: `Failed to access image: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } 
    // If it's a local path
    else if (imageUrl.startsWith('/')) {
      // For local paths we can just return success as we can't directly check file existence
      return NextResponse.json({ 
        exists: true, 
        message: 'Local image path (assuming it exists)'
      });
    }
    else {
      return NextResponse.json({ 
        exists: false, 
        message: 'Invalid image URL format'
      });
    }
  } catch (error) {
    console.error('Error checking image URL:', error);
    return NextResponse.json({ 
      error: 'Failed to check image URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 