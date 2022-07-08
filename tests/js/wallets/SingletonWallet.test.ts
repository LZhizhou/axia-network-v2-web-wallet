import { SingletonWallet } from '@/js/wallets/SingletonWallet'

const TEST_KEY = 'PrivateKey-r6yxM4MiGc93hZ4QxSHhixLEH5RtPjGw6Y85gzg8mgaia6HT3'
const ADDR_X = 'Swap-test1np2h3agqvgxc29sqfh0dy2nvmedus0sa44ktlr'
const ADDR_C = '506433b9338e2a5706e3c0d6bce041d30688935f'

import { axia, avm, axChain, coreChain } from '@/AXIA'
// import { avmGetAllUTXOs } from '@/helpers/utxo_helper'

axia.setNetworkID(5)
avm.setBlockchainAlias('Swap')
coreChain.setBlockchainAlias('Core')
axChain.setBlockchainAlias('AX')

// jest.mock('avmGetAllUTXOs')

describe('Singleton Wallet', () => {
    const wallet = new SingletonWallet(TEST_KEY)

    test('can init', () => {
        expect(wallet.key === TEST_KEY)
    })

    test('correct address', () => {
        let addrX = wallet.getCurrentAddressAvm() === ADDR_X
        let addrC = wallet.getEvmAddress() === ADDR_C
        expect(addrX && addrC).toEqual(true)
    })

    test('getCurrentAddressAvm', () => {
        let addr1 = wallet.getCurrentAddressAvm()
        expect(addr1).toEqual(ADDR_X)
    })

    test('evm address correct', () => {
        let addr1 = wallet.getEvmAddress()
        expect(addr1).toEqual(ADDR_C)
    })

    // test('update utxos', () => {
    //     avmGetAllUTXOs.mockResolvedValue
    // })
})
