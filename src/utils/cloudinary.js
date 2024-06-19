import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import { ApiError } from './apiError';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {       //localFilePath is the URL of the file
    try {
        if(!localFilePath) return null

        //upload file on cloudinary

        const response = await  cloudinary.uploader.upload(localFilePath, {
            resource_type:'auto'
        });

        // if file uploaded successfully on cloudinary then unlink that from our server
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload op get failed
        return null
    }
}

const deleteVideoFromCloudinary = async (url) => {
  try {
      if(!url) return null
      const publicId = url.split('/').pop().split('.')[0];

      const isVideo = url.endsWith('.mp4');
      
      let response;
      if (isVideo) {
        response = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      } else {
        response = cloudinary.uploader.destroy(publicId, function(result) { console.log(result) });
      }
    

      return response
    }
    catch (error){
     throw new ApiError(401,"failed to delete video from cloudinary")

    }
  }

      
  
const deleteOldImageFromCloudinary = async (oldImageUrl) => {
    try {
        if(!oldImageUrl) return null
        const publicId = oldImageUrl.split('/').pop().split('.')[0];
      
        const response = await  cloudinary.uploader.destroy(publicId, function(result) { console.log(result) });
        return response
      }
      catch (error){
       throw new ApiError(401,"failed to delete old image from cloudinary")
  
      }
  
    }
  


export { uploadOnCloudinary, deleteOldImageFromCloudinary, deleteVideoFromCloudinary};