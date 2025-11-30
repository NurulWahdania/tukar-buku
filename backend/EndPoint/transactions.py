from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..MainUtama import database, schemas
from ..Models import transactionModels, userModels, bookModels
from .. import auth

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    trans: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    book = db.query(bookModels.Book).filter(bookModels.Book.id == trans.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.is_sold:
        raise HTTPException(status_code=400, detail="Book is already sold")
    
    # Tandai buku sebagai terjual
    book.is_sold = True
    
    db_trans = transactionModels.Transaction(
        **trans.model_dump(),
        user_id=current_user.id
    )
    db.add(db_trans)
    db.commit()
    db.refresh(db_trans)
    return db_trans

@router.get("/my-history", response_model=List[schemas.Transaction])
def get_my_transaction_history(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # Ini untuk 'TransactionHistory.jsx' (Riwayat Pembelian)
    # FIX: Tambahkan joinedload(bookModels.Book.store) agar frontend bisa akses info toko/penjual
    transactions = db.query(transactionModels.Transaction).options(
        joinedload(transactionModels.Transaction.book).joinedload(bookModels.Book.store)
    ).filter(transactionModels.Transaction.user_id == current_user.id).all()
    return transactions

@router.get("/my-store-sales", response_model=List[schemas.Transaction])
def get_my_store_sales(
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    # Ini untuk 'StoreTransactions.jsx' (Riwayat Penjualan Toko)
    if not seller_user.store:
        raise HTTPException(status_code=404, detail="Seller does not have a store")
    
    store_id = seller_user.store.id
    
    # Cari transaksi di mana buku yang terjual adalah milik toko si seller
    transactions = db.query(transactionModels.Transaction).options(
        joinedload(transactionModels.Transaction.book)
    ).join(bookModels.Book).filter(bookModels.Book.store_id == store_id).all()
    
    return transactions