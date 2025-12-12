from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..MainUtama import database, schemas
from ..Models import reviewModels, userModels, bookModels, storeModels
from .. import auth

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# --- Endpoint 1: Buat Review Baru ---
@router.post("/", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # Cek apakah bukunya ada
    book = db.query(bookModels.Book).filter(bookModels.Book.id == review.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # Cek apakah user sudah pernah review buku ini
    existing_review = db.query(reviewModels.Review).filter(
        reviewModels.Review.book_id == review.book_id,
        reviewModels.Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this book. Please edit your existing review.")

    db_review = reviewModels.Review(
        **review.model_dump(),
        user_id=current_user.id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# --- Endpoint 2: Lihat Review per Buku (Publik) ---
@router.get("/book/{book_id}", response_model=List[schemas.Review])
def get_reviews_for_book(book_id: int, db: Session = Depends(database.get_db)):
    # Mengambil review beserta info user penulisnya
    reviews = db.query(reviewModels.Review).options(
        joinedload(reviewModels.Review.user)
    ).filter(reviewModels.Review.book_id == book_id).all()
    return reviews

# --- Endpoint 3: Ambil Review yang Saya Tulis (User) ---
@router.get("/my-reviews", response_model=List[schemas.Review])
def get_my_reviews(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    return db.query(reviewModels.Review).filter(reviewModels.Review.user_id == current_user.id).all()

# --- Endpoint 4: Edit Review ---
@router.put("/{review_id}", response_model=schemas.Review)
def update_review(
    review_id: int,
    review_update: schemas.ReviewCreate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    db_review = db.query(reviewModels.Review).filter(reviewModels.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if db_review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_review.rating = review_update.rating
    db_review.comment = review_update.comment
    
    db.commit()
    db.refresh(db_review)
    return db_review

# --- Endpoint 5: Ambil Ulasan Toko Saya (KHUSUS SELLER) ---
@router.get("/my-store-reviews", response_model=List[schemas.Review])
def get_my_store_reviews(
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    # 1. Cari Toko milik Seller yang sedang login
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == seller_user.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found for this user")

    # 2. Cari semua review yang tertuju pada buku-buku di toko tersebut
    reviews = db.query(reviewModels.Review).join(bookModels.Book).filter(
        bookModels.Book.store_id == store.id
    ).options(
        joinedload(reviewModels.Review.user),  # Load data Penulis Review
        joinedload(reviewModels.Review.book)   # Load data Buku yang direview
    ).all()
    
    return reviews

# --- Endpoint 6: Hapus Review (BARU - Khusus Seller Pemilik Toko / Admin) ---
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # 1. Cari Review
    review = db.query(reviewModels.Review).filter(reviewModels.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # 2. Cek Otorisasi: Admin / Penulis / Pemilik Toko
    is_admin = current_user.role.name.lower() == "admin"
    is_author = review.user_id == current_user.id
    
    # Cek apakah user adalah pemilik toko buku tersebut
    book = db.query(bookModels.Book).filter(bookModels.Book.id == review.book_id).first()
    is_store_owner = False
    if book and book.store:
        is_store_owner = book.store.owner_id == current_user.id

    if not (is_admin or is_author or is_store_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to delete this review"
        )
        
    db.delete(review)
    db.commit()
    return