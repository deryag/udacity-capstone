import { apiEndpoint } from '../config'
import { ImageItem } from '../types/ImageItem';
import { CreateImageRequest } from '../types/CreateImageRequest';
import Axios from 'axios'

export async function getImages(idToken: string): Promise<ImageItem[]> {
  const response = await Axios.get(`${apiEndpoint}/images`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.items
}

export async function getImagesES(idToken: string, searchKey: string): Promise<ImageItem[]> {
  const response = await Axios.get(`${apiEndpoint}/images/elastic`, {
    params: {
      query: searchKey
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.items
}

export async function createImage(
  idToken: string,
  newImage: CreateImageRequest
): Promise<ImageItem> {
  const response = await Axios.post(`${apiEndpoint}/image`, JSON.stringify(newImage), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  alert('Image item creation inside')
  return response.data.item
}

export async function deleteImage(
  idToken: string,
  imageId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/image/${imageId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  imageId: string,
  description: string,
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/image/${imageId}/file`, description, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
