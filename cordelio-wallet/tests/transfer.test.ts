import assert from 'node:assert/strict'
import {
  asTransferHash,
  chainErrorMessage,
  parseTransferAmount,
  publicChainError,
  receiptStatus,
  transferFeeEth,
} from '../src/wallet-core/transfer.ts'

assert.equal(parseTransferAmount('0.01'), 10n ** 16n)
assert.throws(() => parseTransferAmount('0'), /Miktar geçersiz/)
assert.throws(() => parseTransferAmount('1e18'), /Miktar geçersiz/)
assert.throws(() => parseTransferAmount('-1'), /Miktar geçersiz/)

assert.equal(transferFeeEth(21_000n, 1_000_000_000n), '0.000021')
assert.equal(chainErrorMessage('insufficient funds for gas', 'İşlem gönderilemedi'), 'Bakiye yetersiz')
assert.equal(chainErrorMessage('EVM error: OutOfFunds', 'Ücret tahmin edilemedi'), 'Bakiye yetersiz')
const outOfFunds = new Error('Transaction creation failed.')
outOfFunds.cause = new Error('EVM error: OutOfFunds')
assert.equal(publicChainError(outOfFunds, 'Ücret tahmin edilemedi'), 'Bakiye yetersiz')
assert.equal(chainErrorMessage('rpc kapandı', 'Ücret tahmin edilemedi'), 'Ücret tahmin edilemedi')
assert.equal(receiptStatus('success'), 'success')
assert.equal(receiptStatus('reverted'), 'reverted')
assert.throws(() => receiptStatus('pending'), /İşlem durumu okunamadı/)

const hash = `0x${'ab'.repeat(32)}`
assert.equal(asTransferHash(hash), hash)
assert.throws(() => asTransferHash('0x1234'), /İşlem bulunamadı/)

console.log('transfer tamam')
