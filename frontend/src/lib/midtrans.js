import midtransClient from 'midtrans-client'

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

// Snap: untuk membuat transaksi (token popup pembayaran).
export function getSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return null
  return new midtransClient.Snap({ isProduction, serverKey })
}

// CoreApi: untuk verifikasi notifikasi (webhook) pembayaran.
export function getCoreApi() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return null
  return new midtransClient.CoreApi({ isProduction, serverKey })
}
