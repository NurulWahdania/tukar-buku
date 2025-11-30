from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..MainUtama import database, schemas
from ..Models import wishlistModels, userModels, bookModels
from .. import auth

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/", response_model=schemas.Wishlist, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    item: schemas.WishlistCreate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # Cek apakah buku ada
    book = db.query(bookModels.Book).filter(bookModels.Book.id == item.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Cek apakah sudah ada di wishlist
    existing = db.query(wishlistModels.Wishlist).filter(
        wishlistModels.Wishlist.user_id == current_user.id,
        wishlistModels.Wishlist.book_id == item.book_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Item already in wishlist")

    db_item = wishlistModels.Wishlist(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/my-wishlist", response_model=List[schemas.Wishlist])
def get_my_wishlist(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    items = db.query(wishlistModels.Wishlist).options(
        joinedload(wishlistModels.Wishlist.book) # Sertakan detail buku
    ).filter(wishlistModels.Wishlist.user_id == current_user.id).all()
    return items

@router.delete("/{wishlist_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    wishlist_item_id: int,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    db_item = db.query(wishlistModels.Wishlist).filter(wishlistModels.Wishlist.id == wishlist_item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(db_item)
    db.commit()