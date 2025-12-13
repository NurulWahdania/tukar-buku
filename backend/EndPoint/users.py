# from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.orm import Session
# from typing import List, Optional
# import shutil
# import os
# import uuid

# # Import semua file yang telah kita buat
# from ..MainUtama import database, schemas, utils
# from ..Models import userModels, roleModels
# from .. import auth

# # Membuat router baru
# router = APIRouter(
#     tags=["Authentication & Users"]
# )

# # --- Endpoint 1: Registrasi User Baru ---
# @router.post("/register", response_model=schemas.User)
# def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
#     # ensure role_id defaults to User (id=3) if not provided
#     try:
#         incoming_role = getattr(user, "role_id", None)
#     except Exception:
#         incoming_role = None
#     if incoming_role is None:
#         user.role_id = 3

#     # 1. Cek username
#     db_user = db.query(userModels.User).filter(userModels.User.username == user.username).first()
#     if db_user:
#         raise HTTPException(status_code=400, detail="Username already registered")
        
#     # 2. Cek email
#     db_email = db.query(userModels.User).filter(userModels.User.email == user.email).first()
#     if db_email:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
#     # 3. Tetapkan peran
#     user_role = db.query(roleModels.Role).filter(roleModels.Role.name == "User").first()
#     role_id = user_role.id if user_role else 3

#     # 4. Hash password
#     hashed_password = utils.get_password_hash(user.password)
    
#     # 5. Simpan
#     db_user = userModels.User(
#         username=user.username,
#         email=user.email,
#         nama_lengkap=user.nama_lengkap,
#         hashed_password=hashed_password,
#         role_id=role_id
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
    
#     return db_user


# # --- Endpoint 2: Login ---
# @router.post("/login", response_model=schemas.Token)
# def login_for_access_token(
#     form_data: OAuth2PasswordRequestForm = Depends(), 
#     db: Session = Depends(database.get_db)
# ):
#     user = auth.authenticate_user(db, form_data.username, form_data.password)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     access_token = auth.create_access_token(
#         data={"sub": user.username, "id": user.id}
#     )
#     return {"access_token": access_token, "token_type": "bearer"}


# # --- Endpoint 3: Ambil Profil Sendiri ---
# @router.get("/users/me", response_model=schemas.User)
# def read_users_me(
#     current_user: userModels.User = Depends(auth.get_current_active_user)
# ):
#     return current_user


# # --- Endpoint 4: Update Profil Sendiri (DIPERBAIKI UNTUK UPLOAD FILE) ---
# @router.put("/users/me", response_model=schemas.User)
# def update_user_me(
#     # Kita ubah dari Pydantic Model menjadi Form & File parameters
#     nama_lengkap: Optional[str] = Form(None),
#     email: Optional[str] = Form(None),
#     nomor_hp: Optional[str] = Form(None),
#     jurusan: Optional[str] = Form(None),
#     profile_photo: Optional[UploadFile] = File(None), # Menangani file upload
#     db: Session = Depends(database.get_db),
#     current_user: userModels.User = Depends(auth.get_current_active_user)
# ):
#     # 1. Update data teks
#     if nama_lengkap is not None:
#         current_user.nama_lengkap = nama_lengkap
    
#     if nomor_hp is not None:
#         current_user.nomor_hp = nomor_hp
        
#     if jurusan is not None:
#         current_user.jurusan = jurusan

#     if email is not None and email != current_user.email:
#         # Cek duplikasi email
#         existing_email = db.query(userModels.User).filter(userModels.User.email == email).first()
#         if existing_email and existing_email.id != current_user.id:
#             raise HTTPException(status_code=400, detail="Email already registered by another user")
#         current_user.email = email

#     # 2. Handle Upload Foto Profil
#     if profile_photo:
#         # Buat folder jika belum ada
#         UPLOAD_DIR = "static/images/profiles"
#         os.makedirs(UPLOAD_DIR, exist_ok=True)
        
#         # Generate nama file unik
#         file_extension = profile_photo.filename.split(".")[-1] if "." in profile_photo.filename else "jpg"
#         filename = f"user_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
#         file_path = os.path.join(UPLOAD_DIR, filename)
        
#         # Hapus foto lama jika ada (opsional, untuk menghemat storage)
#         if current_user.profile_photo_url and "static/images/profiles" in current_user.profile_photo_url:
#             try:
#                 old_filename = current_user.profile_photo_url.split("/")[-1]
#                 old_path = os.path.join(UPLOAD_DIR, old_filename)
#                 if os.path.exists(old_path):
#                     os.remove(old_path)
#             except Exception as e:
#                 print(f"Gagal hapus foto lama: {e}")

#         # Simpan file baru
#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(profile_photo.file, buffer)
            
#         # Simpan URL lengkap ke database
#         # Sesuaikan port jika di production (sekarang hardcode localhost)
#         current_user.profile_photo_url = f"http://localhost:8000/{UPLOAD_DIR}/{filename}".replace("\\", "/")

#     # 3. Simpan perubahan ke DB
#     db.commit()
#     db.refresh(current_user)
    
#     return current_user


# # --- Endpoint 5: Mendapatkan Semua User (Khusus Admin) ---
# @router.get("/users", response_model=List[schemas.User])
# def get_all_users(
#     skip: int = 0, 
#     limit: int = 100, 
#     db: Session = Depends(database.get_db),
#     admin_user: userModels.User = Depends(auth.get_current_admin_user)
# ):
#     return db.query(userModels.User).offset(skip).limit(limit).all()

# # --- Endpoint 6: Hapus User (Khusus Admin) ---
# @router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_user(
#     user_id: int,
#     db: Session = Depends(database.get_db),
#     admin_user: userModels.User = Depends(auth.get_current_admin_user)
# ):
#     user = db.query(userModels.User).filter(userModels.User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
        
#     db.delete(user)
#     db.commit()
#     return

# backend/EndPoint/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid

from ..MainUtama import database, schemas, utils
from ..Models import userModels, roleModels
from .. import auth

router_auth = APIRouter(tags=["Authentication"])

@router_auth.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        incoming_role = getattr(user, "role_id", None)
    except Exception:
        incoming_role = None
    if incoming_role is None:
        user.role_id = 3

    if db.query(userModels.User).filter(userModels.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(userModels.User).filter(userModels.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_role = db.query(roleModels.Role).filter(roleModels.Role.name == "User").first()
    role_id = user_role.id if user_role else 3

    hashed_password = utils.get_password_hash(user.password)
    db_user = userModels.User(
        username=user.username,
        email=user.email,
        nama_lengkap=user.nama_lengkap,
        hashed_password=hashed_password,
        role_id=role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router_auth.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


# =========================================================
# 2. ROUTER USER MANAGEMENT (PRIVAT - AKAN DIGEMBOK)
# =========================================================
# Router ini akan dipasang di main.py DENGAN dependency keamanan
router_users = APIRouter(tags=["User Management"])

@router_users.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: userModels.User = Depends(auth.get_current_active_user)):
    return current_user

@router_users.put("/users/me", response_model=schemas.User)
def update_user_me(
    nama_lengkap: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    nomor_hp: Optional[str] = Form(None),
    jurusan: Optional[str] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    if nama_lengkap: current_user.nama_lengkap = nama_lengkap
    if nomor_hp: current_user.nomor_hp = nomor_hp
    if jurusan: current_user.jurusan = jurusan
    if email and email != current_user.email:
        if db.query(userModels.User).filter(userModels.User.email == email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = email

    if profile_photo:
        UPLOAD_DIR = "static/images/profiles"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        # Hapus foto lama
        if current_user.profile_photo_url and "static/images/profiles" in current_user.profile_photo_url:
            try:
                old_p = current_user.profile_photo_url.split("8000/")[-1]
                if os.path.exists(old_p): os.remove(old_p)
            except: pass

        file_ext = profile_photo.filename.split(".")[-1]
        fname = f"user_{current_user.id}_{uuid.uuid4().hex}.{file_ext}"
        fpath = os.path.join(UPLOAD_DIR, fname)
        with open(fpath, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)
        current_user.profile_photo_url = f"http://localhost:8000/{UPLOAD_DIR}/{fname}"

    db.commit()
    db.refresh(current_user)
    return current_user

@router_users.get("/users", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    return db.query(userModels.User).offset(skip).limit(limit).all()

@router_users.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    user = db.query(userModels.User).filter(userModels.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()