from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..MainUtama import database, schemas
from ..Models import reviewModels, userModels, bookModels
from .. import auth

router = APIRouter(prefix="/reviews", tags=["Reviews"])

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
        
    # Cek apakah user sudah pernah review buku ini (opsional, untuk mencegah double review)
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

@router.get("/book/{book_id}", response_model=List[schemas.Review])
def get_reviews_for_book(book_id: int, db: Session = Depends(database.get_db)):
    reviews = db.query(reviewModels.Review).filter(reviewModels.Review.book_id == book_id).all()
    return reviews

# --- Endpoint Baru: Ambil Review Saya ---
@router.get("/my-reviews", response_model=List[schemas.Review])
def get_my_reviews(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    return db.query(reviewModels.Review).filter(reviewModels.Review.user_id == current_user.id).all()

# --- Endpoint Baru: Edit Review ---
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
    # book_id biasanya tidak diubah, tapi jika schema mengharuskannya, biarkan saja
    
    db.commit()
    db.refresh(db_review)
    return db_review