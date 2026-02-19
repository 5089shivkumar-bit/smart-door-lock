import io
import asyncio
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import face_recognition
from supabase_client import supabase
from datetime import datetime
import json
import uuid

app = FastAPI(title="Smart Door Biometric API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "online", "timestamp": datetime.utcnow()}

@app.post("/api/biometrics/face/register")
async def register_face(
    employeeId: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Register a face encoding for a specific employee.
    Uploads photo to Supabase Storage and metadata to Database.
    """
    print(f"📥 Registering face for: {employeeId}")
    
    try:
        # 1. Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        frame = np.array(image)

        # 2. Detect and encode
        face_locations = face_recognition.face_locations(frame)
        if not face_locations:
            return {"success": False, "message": "No face detected.", "error_code": "NO_FACE"}
        if len(face_locations) > 1:
            return {"success": False, "message": "Multiple faces detected.", "error_code": "MULTIPLE_FACES"}

        encodings = face_recognition.face_encodings(frame, face_locations)
        encoding_list = encodings[0].tolist()

        # 3. Upload Image to Supabase Storage
        file_path = f"faces/{employeeId}_{uuid.uuid4().hex[:8]}.jpg"
        print(f"📤 Step 3: Uploading photo to Supabase Storage: {file_path}")
        
        try:
            # Reset file pointer and upload
            supabase.storage.from_("biometrics").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": "image/jpeg"}
            )
            print(f"✅ Step 3: Upload Success.")
        except Exception as upload_err:
            print(f"❌ Step 3: Upload Failed: {str(upload_err)}")
            return {"success": False, "message": f"Storage Upload Failed: {str(upload_err)}"}
        
        # Get public URL
        image_url = supabase.storage.from_("biometrics").get_public_url(file_path)
        
        print(f"🔗 Step 4: Public URL: {image_url}")

        # 4. Save Metadata to Supabase Database
        print("💾 Step 5: Saving metadata to 'employees' table...")
        user_data = {
            "name": employeeId, 
            "email": email,
            "employee_id": employeeId,
            "face_embedding": encoding_list,
            "image_url": str(image_url),
            "role": "employee",
            "updated_at": datetime.utcnow().isoformat()
        }

        db_result = supabase.table("employees").upsert(user_data, on_conflict="employee_id").execute()
        print(f"✅ Step 5: Database Upsert Success.")

        return {
            "success": True, 
            "message": "Face registered successfully and photo saved.",
            "image_url": str(image_url),
            "encoding": encoding_list
        }

    except Exception as e:
        error_msg = str(e)
        print(f"❌ Registration Error: {error_msg}")
        
        # Check for specific Supabase errors
        if "bucket_not_found" in error_msg.lower():
            return {"success": False, "message": "Supabase Storage bucket 'biometrics' not found. Please create it in your Supabase dashboard."}
        elif "duplicate" in error_msg.lower():
            return {"success": False, "message": "Employee ID already exists. Try updating instead."}
            
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {error_msg}")

@app.post("/api/biometrics/face/verify")
async def verify_face(file: UploadFile = File(...)):
    """
    Verify a live frame against all registered encodings in Supabase.
    """
    try:
        # 1. Process Live Frame
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        frame = np.array(image)

        # 2. Get Live Encoding
        face_locations = face_recognition.face_locations(frame)
        if not face_locations:
            return {"success": False, "message": "No face detected."}
        
        live_encoding = face_recognition.face_encodings(frame, face_locations)[0]

        # 3. Fetch all registered encodings from Supabase
        response = supabase.table("employees").select("id, name, employee_id, face_embedding, role").not_.is_("face_embedding", "null").execute()
        employees = response.data

        if not employees:
            return {"success": False, "message": "No registered users found in system."}

        known_encodings = [np.array(e["face_embedding"]) for e in employees]
        results = face_recognition.compare_faces(known_encodings, live_encoding, tolerance=0.5)

        # 4. Find match
        match_index = -1
        for i, matched in enumerate(results):
            if matched:
                match_index = i
                break

        if match_index != -1:
            matched_emp = employees[match_index]
            
            # Log successful access to Supabase
            log_data = {
                "employee_id": matched_emp["id"],
                "status": "success",
                "confidence": 1.0, # Simplified
                "device_id": "terminal_01",
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("access_logs").insert(log_data).execute()

            return {
                "success": True, 
                "message": "Access Granted", 
                "user": {
                    "name": matched_emp.get("name"),
                    "employeeId": matched_emp["employee_id"],
                    "role": matched_emp.get("role")
                }
            }
        else:
            # Log denied access
            supabase.table("access_logs").insert({
                "status": "failed",
                "device_id": "terminal_01",
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            return {"success": False, "message": "Access Denied: Face not recognized."}

    except Exception as e:
        print(f"❌ Verification Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
