from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil
import os
import uuid

# Import semua file yang kita butuhkan
from ..MainUtama import database, schemas
from ..Models import storeModels, userModels, roleModels
from .. import auth

router = APIRouter(
    prefix="/stores",
    tags=["Stores"]
)

# --- Endpoint 1: Mendaftarkan Toko Baru (Support Upload File) ---
@router.post("/", response_model=schemas.Store, status_code=status.HTTP_201_CREATED)
def create_store_for_current_user(
    # Ubah parameter dari Pydantic Schema menjadi Form(...) dan File(...)
    nama_toko: str = Form(...),
    nama_pemilik_toko: Optional[str] = Form(None),
    email_toko: Optional[str] = Form(None),
    hp_toko: Optional[str] = Form(None),
    alamat_toko: Optional[str] = Form(None),
    store_photo: Optional[UploadFile] = File(None), # Tambahkan support upload file
    db: Session = Depends(database.get_db), 
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # 1. Cek apakah user sudah punya toko
    existing_store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if existing_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a store registered"
        )
    
    # 2. Cek nama toko unik
    if db.query(storeModels.Store).filter(storeModels.Store.nama_toko == nama_toko).first():
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nama toko sudah digunakan"
        )

    # 3. Handle Upload Foto Toko
    store_photo_url = None
    if store_photo:
        UPLOAD_DIR = "static/images/stores"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_extension = store_photo.filename.split(".")[-1] if "." in store_photo.filename else "jpg"
        filename = f"store_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(store_photo.file, buffer)
            
        store_photo_url = f"http://localhost:8000/{UPLOAD_DIR}/{filename}"

    # 4. Buat Toko di Database
    db_store = storeModels.Store(
        nama_toko=nama_toko,
        nama_pemilik_toko=nama_pemilik_toko,
        email_toko=email_toko,
        hp_toko=hp_toko,
        alamat_toko=alamat_toko,
        store_photo_url=store_photo_url,
        owner_id=current_user.id
    )
    db.add(db_store)
    
    # 5. UPDATE ROLE USER JADI SELLER
    seller_role = db.query(roleModels.Role).filter(roleModels.Role.name == "Seller").first()
    
    if seller_role and current_user.role.name.lower() == "user":
        current_user.role_id = seller_role.id
        db.add(current_user)

    db.commit()
    db.refresh(db_store)
    
    return db_store

# ... (Kode endpoint lainnya seperti get_my_store, get_all_stores tetap sama) ...
# Pastikan endpoint lain tidak terhapus.
# Endpoint GET tidak perlu diubah karena tidak menerima input body.
# Hanya endpoint POST dan PUT yang perlu diubah jika ingin support file upload.

# --- Endpoint 2: Get Toko Saya ---
@router.get("/my-store", response_model=schemas.Store)
def get_my_store(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="User does not have a store")
    return store

# --- Endpoint 3: Get Toko by ID (Public) ---
@router.get("/{store_id}", response_model=schemas.Store)
def get_store_by_id(store_id: int, db: Session = Depends(database.get_db)):
    store = db.query(storeModels.Store).filter(storeModels.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

# --- Endpoint 4: Update Toko ---
# (Opsional: Ubah ke Form/File jika ingin fitur update foto toko nanti)
@router.put("/my-store", response_model=schemas.Store)
def update_my_store(
    store_update: schemas.StoreUpdate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    db_store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    update_data = store_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_store, key, value)
        
    db.commit()
    db.refresh(db_store)
    return db_store

# --- Endpoint 5: Get All Stores ---
@router.get("/", response_model=List[schemas.Store])
def get_all_stores(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(storeModels.Store).offset(skip).limit(limit).all()