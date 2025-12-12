from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from ..MainUtama import database, schemas
from ..Models import transactionModels, userModels, bookModels, storeModels
from .. import auth

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)

# --- Endpoint 1: Buat Transaksi Baru (Saat User Klik Hubungi) ---
@router.post("/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # 1. Cek Buku
    book = db.query(bookModels.Book).filter(bookModels.Book.id == transaction_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # 2. Cek apakah user membeli bukunya sendiri
    if book.store.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot buy your own book")

    # 3. Cek apakah transaksi sudah ada (Agar tidak spam)
    existing_tx = db.query(transactionModels.Transaction).filter(
        transactionModels.Transaction.buyer_id == current_user.id,
        transactionModels.Transaction.book_id == transaction_data.book_id
    ).first()

    if existing_tx:
        return existing_tx

    # 4. Buat Transaksi
    # PENTING: Di sini kita HANYA mencatat transaksi.
    # Kita JANGAN mengubah book.is_sold menjadi True.
    # Biarkan Seller yang mengubahnya nanti secara manual.
    
    new_tx = transactionModels.Transaction(
        buyer_id=current_user.id,
        book_id=transaction_data.book_id,
        total_price=transaction_data.total_price,
        status="waiting" 
    )
    
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    
    return new_tx

# --- Endpoint 2: Riwayat Pembelian Saya ---
@router.get("/my-history", response_model=List[schemas.Transaction])
def get_my_history(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # Hanya tampilkan jika Seller sudah menandai buku sebagai TERJUAL (is_sold = True)
    transactions = db.query(transactionModels.Transaction)\
        .join(bookModels.Book)\
        .options(joinedload(transactionModels.Transaction.book).joinedload(bookModels.Book.store))\
        .filter(
            transactionModels.Transaction.buyer_id == current_user.id,
            bookModels.Book.is_sold == True  # Filter Wajib: Hanya yang sudah Sold
        ).all()
        
    return transactions

# --- Endpoint 3: Riwayat Penjualan Toko Saya ---
@router.get("/my-store-sales", response_model=List[schemas.Transaction])
def get_my_store_sales(
    db: Session = Depends(database.get_db),
    seller_user: userModels.User = Depends(auth.get_current_seller_user)
):
    # Cari toko seller
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == seller_user.id).first()
    if not store:
        return []

    # Untuk Seller, tampilkan semua transaksi yang masuk (walaupun belum sold),
    # agar seller tahu ada yang minat. ATAU filter is_sold=True jika hanya ingin lihat yang sukses.
    # Disini kita tampilkan semua agar seller tau demand.
    sales = db.query(transactionModels.Transaction)\
        .join(bookModels.Book)\
        .options(joinedload(transactionModels.Transaction.book), joinedload(transactionModels.Transaction.buyer))\
        .filter(bookModels.Book.store_id == store.id)\
        .all()
        
    return sales