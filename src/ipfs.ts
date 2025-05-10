// src/ipfs.ts
import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_BASE_URL = 'https://api.pinata.cloud';

/**
 * Uploads image data (File or fetched from URL) to IPFS via Pinata.
 * @param imageData File object or URL string
 * @param onProgress Optional callback for progress (currently only for file uploads)
 * @returns Promise resolving to the IPFS CID hash
 */
export const uploadToIPFS = async (
  imageData: File | string,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  if (!PINATA_JWT) {
    console.error('Pinata JWT key is missing. Please set VITE_PINATA_JWT in your .env file.');
    throw new Error('IPFS upload configuration missing.');
  }

  try {
    let data: FormData | { url: string };
    let pinataOptions: Record<string, any> | undefined = undefined;
    let endpoint = '/pinning/pinFileToIPFS'; // Default for file upload

    if (imageData instanceof File) {
      // Handle File upload
      const formData = new FormData();
      formData.append('file', imageData, imageData.name);
      pinataOptions = {
        cidVersion: 1, // Use CID version 1
        // You can add more pinata options here if needed
        // pinataMetadata: { name: `tknz_image_${Date.now()}` }
      };
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      data = formData;

    } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
       // Handle URL upload - Pinata pins URL directly
       endpoint = '/pinning/pinByHash'; // Use pinByHash for URL pinning is not correct, Pinata pins content not hash directly from URL
       // Pinata doesn't directly pin from URL in the free tier easily this way.
       // We need to fetch the image first and then upload it as a file.

       console.log(`Fetching image from URL for IPFS upload: ${imageData}`);
       const response = await axios.get(imageData, { responseType: 'blob' });
       const blob = response.data;
       const filename = imageData.substring(imageData.lastIndexOf('/') + 1) || `image_${Date.now()}`;
        // Extract or guess the file extension
        const contentType = response.headers['content-type'];
        let ext = '.jpg'; // Default extension
        if (contentType) {
          const match = contentType.match(/image\/(png|jpeg|gif|webp|svg\+xml)/);
          if (match && match[1]) {
            ext = `.${match[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg')}`;
          }
        }
       const file = new File([blob], filename.includes('.') ? filename : filename + ext , { type: blob.type });

       const formData = new FormData();
       formData.append('file', file, file.name);
        pinataOptions = { cidVersion: 1 };
        formData.append('pinataOptions', JSON.stringify(pinataOptions));
        data = formData;
        endpoint = '/pinning/pinFileToIPFS'; // Use file endpoint after fetching


    } else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        // Handle data URL upload
        const blob = await (await fetch(imageData)).blob();
        const filename = `uploaded_image_${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
        const file = new File([blob], filename, { type: blob.type });

        const formData = new FormData();
        formData.append('file', file, file.name);
        pinataOptions = { cidVersion: 1 };
        formData.append('pinataOptions', JSON.stringify(pinataOptions));
        data = formData;
        endpoint = '/pinning/pinFileToIPFS';


    } else {
      console.error('Invalid image data provided for IPFS upload:', imageData);
      throw new Error('Invalid image data type for IPFS upload.');
    }

    console.log(`Uploading to Pinata endpoint: ${endpoint}`);

    // Axios config for Pinata
    const config = {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        // Content-Type is set automatically by Axios for FormData
        ...( !(data instanceof FormData) && {'Content-Type': 'application/json'}),
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    };

    const res = await axios.post(`${PINATA_BASE_URL}${endpoint}`, data, config);

    if (res.data && res.data.IpfsHash) {
      console.log('IPFS Upload successful. CID:', res.data.IpfsHash);
      return res.data.IpfsHash; // Return the CID
    } else {
      console.error('Pinata API response missing IpfsHash:', res.data);
      throw new Error('IPFS upload failed: Invalid response from Pinata.');
    }

  } catch (error: any) {
    console.error('Error uploading to IPFS via Pinata:', error.response ? error.response.data : error.message);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

/**
 * Constructs a usable IPFS gateway URL from a CID.
 * Uses the Pinata gateway for reliability.
 * @param cid IPFS Content Identifier (CID)
 * @returns string URL to view the content
 */
export const getIPFSUrl = (cid: string): string => {
  // You can change this to your preferred IPFS gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
  // return `https://ipfs.io/ipfs/${cid}`;
}; 