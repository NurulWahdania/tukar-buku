from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import json
import shutil
import os
import uuid 

from ..MainUtama import database, schemas
from ..Models import bookModels, userModels, storeModels, categoryModels
from .. import auth

router = APIRouter(
    prefix="/books",
    tags=["Books"]
)

# --- Endpoint 1: Membuat Buku (Support Upload File) ---
@router.post("/", response_model=schemas.Book, status_code=status.HTTP_201_CREATED)
def create_book(
    title: str = Form(...),
    author: Optional[str] = Form(None),
    condition: str = Form(...),
    price: Optional[float] = Form(None),
    is_barter: bool = Form(False),
    description: Optional[str] = Form(None),
    category_ids: str = Form(...), 
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    # 1. Cek apakah user punya toko
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == seller_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have a registered store. Please register a store first."
        )

    # 2. Handle Upload Gambar
    image_url = None
    if image_file:
        UPLOAD_DIR = "static/images/books"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_extension = image_file.filename.split(".")[-1] if "." in image_file.filename else "jpg"
        filename = f"{store.id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)
            
        image_url = f"http://localhost:8000/{UPLOAD_DIR}/{filename}".replace("\\", "/")

    # 3. Buat Objek Buku
    db_book = bookModels.Book(
        title=title,
        author=author,
        condition=condition,
        price=price,
        is_barter=is_barter,
        description=description,
        image_url=image_url,
        store_id=store.id
    )

    # 4. Handle Relasi Kategori
    try:
        cat_ids_list = json.loads(category_ids)
        if cat_ids_list:
            categories = db.query(categoryModels.Category).filter(
                categoryModels.Category.id.in_(cat_ids_list)
            ).all()
            db_book.categories = categories
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid category_ids format")

    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    return db_book

# --- Endpoint 2: Mendapatkan Semua Buku (Publik) ---
@router.get("/", response_model=List[schemas.Book])
def get_all_books(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db)
):
    books = db.query(bookModels.Book).options(
        joinedload(bookModels.Book.store),      
        joinedload(bookModels.Book.categories)  
    ).filter(
        bookModels.Book.status_verifikasi == bookModels.VerificationStatus.APPROVED 
    ).offset(skip).limit(limit).all()
    
    return books

# --- Endpoint 6: Mendapatkan Semua Buku Status PENDING (Khusus Admin/Moderasi) ---
@router.get("/pending", response_model=List[schemas.Book])
def get_pending_books(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    books = db.query(bookModels.Book).options(
        joinedload(bookModels.Book.store),
        joinedload(bookModels.Book.categories)
    ).filter(
        bookModels.Book.status_verifikasi == bookModels.VerificationStatus.PENDING
    ).offset(skip).limit(limit).all()
    
    return books

# --- Endpoint 7: Mendapatkan Semua Buku Milik Seller (My Listings) ---
@router.get("/my-listings", response_model=List[schemas.Book])
def get_my_listings(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == seller_user.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found for this user")
        
    books = db.query(bookModels.Book).options(
        joinedload(bookModels.Book.store),
        joinedload(bookModels.Book.categories)
    ).filter(
        bookModels.Book.store_id == store.id
    ).offset(skip).limit(limit).all()
    
    return books

# --- Endpoint 3: Mendapatkan Detail Buku (Publik) ---
@router.get("/{book_id}", response_model=schemas.Book)
def get_book_by_id(book_id: int, db: Session = Depends(database.get_db)):
    book = db.query(bookModels.Book).options(
        joinedload(bookModels.Book.store),
        joinedload(bookModels.Book.categories)
    ).filter(bookModels.Book.id == book_id).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    return book

# --- Endpoint 4: Memperbarui Buku (Hanya Pemilik Toko) ---
@router.put("/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    is_barter: Optional[bool] = Form(None),
    description: Optional[str] = Form(None),
    is_sold: Optional[bool] = Form(None),  # <--- PARAMETER BARU DITAMBAHKAN
    category_ids: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    # 1. Dapatkan buku
    db_book = db.query(bookModels.Book).filter(bookModels.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # 2. Cek kepemilikan
    if db_book.store.owner_id != seller_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this book")
        
    # Ambil URL lama sebelum update (untuk dihapus jika ada file baru)
    old_image_url = db_book.image_url 
        
    # 3. Update data scalar
    if title is not None: db_book.title = title
    if author is not None: db_book.author = author
    if condition is not None: db_book.condition = condition
    if price is not None: db_book.price = price
    if is_barter is not None: db_book.is_barter = is_barter
    if description is not None: db_book.description = description
    
    # --- UPDATE STATUS TERJUAL ---
    if is_sold is not None:
        db_book.is_sold = is_sold
    
    # 4. Update Gambar (Jika ada file baru) DAN HAPUS YANG LAMA
    if image_file and image_file.filename:
        UPLOAD_DIR = "static/images/books"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # --- UPLOAD FILE BARU ---
        file_extension = image_file.filename.split(".")[-1] if "." in image_file.filename else "jpg"
        filename = f"{db_book.store_id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)
            
        new_image_url = f"http://localhost:8000/{UPLOAD_DIR}/{filename}".replace("\\", "/")

        # --- HAPUS FILE LAMA ---
        if old_image_url and "http://localhost:8000/" in old_image_url:
            local_path_to_delete = old_image_url.replace("http://localhost:8000/", "", 1)
            local_path_to_delete = local_path_to_delete.replace("/", os.sep).replace("\\", os.sep)
            
            if os.path.exists(local_path_to_delete):
                try:
                    os.remove(local_path_to_delete)
                except Exception as e:
                    print(f"Gagal menghapus file lama: {e}")
        
        # Update URL buku dengan yang baru
        db_book.image_url = new_image_url
        
    # 5. Update Kategori
    if category_ids is not None:
        try:
            cat_ids_list = json.loads(category_ids)
            categories = db.query(categoryModels.Category).filter(
                categoryModels.Category.id.in_(cat_ids_list)
            ).all()
            db_book.categories = categories
        except json.JSONDecodeError:
            pass 

    # 6. Set status kembali ke PENDING HANYA jika data konten (teks/gambar) berubah
    # Jika hanya mengupdate status 'is_sold', tidak perlu moderasi ulang
    content_changed = any([
        title is not None, 
        author is not None, 
        condition is not None, 
        price is not None, 
        is_barter is not None, 
        description is not None, 
        category_ids is not None, 
        image_file is not None
    ])
    
    if content_changed:
        db_book.status_verifikasi = bookModels.VerificationStatus.PENDING
    
    db.commit()
    db.refresh(db_book)
    return db_book

# --- Endpoint 5: Menghapus Buku (Hanya Pemilik Toko) ---
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    db_book = db.query(bookModels.Book).filter(bookModels.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    if db_book.store.owner_id != seller_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this book")
    
    if db_book.image_url and "http://localhost:8000/" in db_book.image_url:
        local_path_to_delete = db_book.image_url.replace("http://localhost:8000/", "")
        if os.path.exists(local_path_to_delete):
            try:
                os.remove(local_path_to_delete)
            except Exception as e:
                print(f"Gagal menghapus file saat delete buku: {e}")
        
    db.delete(db_book)
    db.commit()
    return