import 'dotenv/config'
import { preciosRepository } from '../src/repositories/precios.repository'

async function run() {
  try {
    console.log('Running preciosRepository.testConnection()...')
    const tc = await preciosRepository.testConnection()
    console.log('testConnection result:', tc)

    console.log('Running getMetricsGenerales()...')
    const metrics = await preciosRepository.getMetricsGenerales()
    console.log('metrics:', JSON.stringify(metrics, null, 2))

    console.log('Running getDistribucionDescuentos() (first 5)...')
    const distrib = await preciosRepository.getDistribucionDescuentos()
    console.log('distribucion (count):', distrib.length)
    console.log('first item:', distrib[0])

  } catch (err) {
    console.error('ERROR running debug script:')
    console.error(err)
    if (typeof (globalThis as any).process !== 'undefined') (globalThis as any).process.exit(1)
  } finally {
    try { await preciosRepository.disconnect() } catch (_) {}
    if (typeof (globalThis as any).process !== 'undefined') (globalThis as any).process.exit(0)
  }
}

run()
