from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import semua file yang kita butuhkan
from ..MainUtama import database, schemas
from ..Models import categoryModels, userModels
from .. import auth

# Membuat router baru
router = APIRouter(
    prefix="/categories",  # Semua rute diawali dengan /categories
    tags=["Categories"]    # Tag untuk dokumentasi API
)

# --- Endpoint 1: Membuat Kategori Baru (Hanya Admin) ---
@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(database.get_db),
    # KUNCI KEAMANAN: Membutuhkan user admin yang aktif
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    # Cek apakah kategori sudah ada
    db_category = db.query(categoryModels.Category).filter(categoryModels.Category.name == category.name).first()
    if db_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    
    # Buat dan simpan
    new_category = categoryModels.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# --- Endpoint 2: Mendapatkan Semua Kategori (Publik) ---
# Ini dibutuhkan oleh frontend (misal: di StoreSettings.jsx) untuk dropdown
@router.get("/", response_model=List[schemas.Category])
def get_all_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    categories = db.query(categoryModels.Category).offset(skip).limit(limit).all()
    return categories

# --- Endpoint 3: Mengedit Kategori (Hanya Admin) ---
@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category_update: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_category = db.query(categoryModels.Category).filter(categoryModels.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db_category.name = category_update.name
    db.commit()
    db.refresh(db_category)
    return db_category

# --- Endpoint 4: Menghapus Kategori (Hanya Admin) ---
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_category = db.query(categoryModels.Category).filter(categoryModels.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # TODO:  
    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted successfully"} 