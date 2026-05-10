import React,{ useState,useRef } from 'react'
import { UploadWidgetProps, UploadWidgetValue } from '@/types';
import { UploadCloud } from 'lucide-react';
import { useEffect } from 'react';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants';
const UploadWidget = ({ value = null, onChange, disabled = false }: UploadWidgetProps) => {
  const widgetRef=useRef<CloudinaryWidget | null>(null);
  const onChangeRef=useRef(onChange);
  const [preview,setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken,setDeleteToken]=useState<string|null>(null);
  const [isRemoving,setIsRemoving]=useState(false);
  
  const openWidget=()=>{
    if (!disabled){
      widgetRef.current?.open();
    }
  }

  const removeFromCloudinary=async()=>{}

  useEffect(()=>{
    setPreview(value);
    if (!value){
      setDeleteToken(null);
    }
  },[value])

  useEffect(()=>{
    onChangeRef.current=onChange;
  },[onChange])

  useEffect(()=>{
    if (typeof window==="undefined") return
    const initializeWidget=()=>{
      if (!window.cloudinary || widgetRef.current) return;
      widgetRef.current=window.cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        multiple:false,
        folder:"uploads",
        maxFilzeSize:5000000,
        clientAllowedFormats:["png","jpg","jpeg","webp"]

    },(error,result)=>{
      if (!error && result.event=="success"){
        const payload:UploadWidgetValue={
          url:result.info.secure_url,
          publicId:result.info.public_id,
        }
        setPreview(payload);
        setDeleteToken(result.info.delete_token??null);

        onChangeRef.current?.(payload);
      }
    });
    return true;
  }
  if (initializeWidget()) return;
  const intervalId=window.setInterval(()=>{
    if (initializeWidget()) clearInterval(intervalId);
  },500)
  return ()=>window.clearInterval(intervalId);
  },[])

  useEffect(()=>{
    if (preview){
      onChangeRef.current?.(preview);
    }
  },[preview])
  
  

  return (
    <div className="space-y-2">

      {preview?(
        <div className="upload-preview"></div>
      ):(<div className="upload-dropzone" role="button" tabIndex={0}
        onClick={openWidget} onKeyDown={(e)=>{
          if (e.key==="Enter"){
            e.preventDefault();
            openWidget();
          }
        }}
      >
        <div className="upload-prompt">
          <UploadCloud className="icon" />
          <div>
            <p>Click to upload photo</p>
            <p>PNG,JPG up to 5MB</p>
          </div>
        </div>
      </div>)}

    </div>


  )
}

export default UploadWidget;