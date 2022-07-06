/*
The base wallet class used for common functionality
*/
import { BN, Buffer } from '@axia-systems/axiajs'
import { UTXOSet as AVMUTXOSet } from '@axia-systems/axiajs/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from '@axia-systems/axiajs/dist/apis/platformvm'
import {
    ExportChainsAX,
    ExportChainsCore,
    ExportChainsSwap,
    Network,
    UtxoHelper,
    TxHelper,
    GasHelper,
} from '@axia-systems/wallet-sdk'
import { axia, avm, bintools, axChain, coreChain } from '@/AXIA'
import { UTXOSet as EVMUTXOSet } from '@axia-systems/axiajs/dist/apis/evm/utxos'
import { Tx as EVMTx, UnsignedTx as EVMUnsignedTx } from '@axia-systems/axiajs/dist/apis/evm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from '@axia-systems/axiajs/dist/apis/platformvm/tx'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from '@axia-systems/axiajs/dist/apis/avm/tx'
import { AvmImportChainType, WalletType } from '@/js/wallets/types'
var uniqid = require('uniqid')

abstract class WalletCore {
    id: string

    utxoset: AVMUTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN

    isFetchUtxos: boolean
    isInit: boolean

    abstract getEvmAddressBech(): string
    abstract getEvmAddress(): string
    abstract getCurrentAddressAvm(): string
    abstract getChangeAddressAvm(): string
    abstract getCurrentAddressPlatform(): string
    abstract getAllAddressesP(): string[]
    abstract getAllAddressesX(): string[]

    abstract async signAX(unsignedTx: EVMUnsignedTx): Promise<EVMTx>
    abstract async signSwap(unsignedTx: AVMUnsignedTx): Promise<AVMTx>
    abstract async signCore(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx>

    abstract async signMessage(msg: string, address?: string): Promise<string>
    abstract getPlatformUTXOSet(): PlatformUTXOSet

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    protected constructor() {
        this.id = uniqid()
        this.utxoset = new AVMUTXOSet()
        this.platformUtxoset = new PlatformUTXOSet()
        this.stakeAmount = new BN(0)

        this.isInit = false
        this.isFetchUtxos = false
    }

    async evmGetAtomicUTXOs(sourceChain: ExportChainsAX) {
        let addrs = [this.getEvmAddressBech()]
        return await UtxoHelper.evmGetAtomicUTXOs(addrs, sourceChain)
    }

    async createImportTxC(sourceChain: ExportChainsAX, utxoSet: EVMUTXOSet, fee: BN) {
        let bechAddr = this.getEvmAddressBech()
        let hexAddr = this.getEvmAddress()

        let toAddress = '0x' + hexAddr
        let ownerAddresses = [bechAddr]
        let fromAddresses = ownerAddresses
        const sourceChainId = Network.chainIdFromAlias(sourceChain)

        return await axChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChainId,
            fromAddresses,
            fee
        )
    }

    /**
     *
     * @param sourceChain
     * @param fee Fee to use in nAXC
     * @param utxoSet
     */
    async importToAXChain(sourceChain: ExportChainsAX, fee: BN, utxoSet?: EVMUTXOSet) {
        if (!utxoSet) {
            utxoSet = await this.evmGetAtomicUTXOs(sourceChain)
        }

        // TODO: Only use AXC utxos
        // TODO?: If the import fee for a utxo is greater than the value of the utxo, ignore it

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const unsignedTxFee = await this.createImportTxC(sourceChain, utxoSet, fee)
        let tx = await this.signAX(unsignedTxFee)
        let id = await axChain.issueTx(tx.toString())

        return id
    }

    async exportFromSwapChain(amt: BN, destinationChain: ExportChainsSwap, importFee?: BN) {
        if (destinationChain === 'AX' && !importFee)
            throw new Error('Exports to AXChain must specify an import fee.')

        let amtFee = amt.clone()

        // Get destination address
        let destinationAddr =
            destinationChain === 'Core'
                ? this.getCurrentAddressPlatform()
                : this.getEvmAddressBech()

        // Add import fee to transaction
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'Core') {
            let fee = coreChain.getTxFee()
            amtFee = amt.add(fee)
        }

        let fromAddresses = this.getAllAddressesX()
        let changeAddress = this.getChangeAddressAvm()
        let utxos = this.getUTXOSet()
        let exportTx = await TxHelper.buildAvmExportTransaction(
            destinationChain,
            utxos,
            fromAddresses,
            destinationAddr,
            amtFee,
            changeAddress
        )

        let tx = await this.signSwap(exportTx)

        return avm.issueTx(tx)
    }

    async exportFromCoreChain(amt: BN, destinationChain: ExportChainsCore, importFee?: BN) {
        let utxoSet = this.getPlatformUTXOSet()

        let pChangeAddr = this.getCurrentAddressPlatform()
        let fromAddrs = this.getAllAddressesP()

        if (destinationChain === 'AX' && !importFee)
            throw new Error('Exports to AXChain must specify an import fee.')

        // Calculate AXChain import fee
        let amtFee = amt.clone()
        if (importFee) {
            amtFee = amt.add(importFee)
        } else if (destinationChain === 'Swap') {
            // We can add the import fee for SwapChain
            let fee = avm.getTxFee()
            amtFee = amt.add(fee)
        }

        // Get the destination address for the right chain
        let destinationAddr =
            destinationChain === 'AX' ? this.getEvmAddressBech() : this.getCurrentAddressAvm()

        const exportTx = await TxHelper.buildPlatformExportTransaction(
            utxoSet,
            fromAddrs,
            destinationAddr,
            amtFee,
            pChangeAddr,
            destinationChain
        )

        let tx = await this.signCore(exportTx)
        return await coreChain.issueTx(tx)
    }

    /**
     *
     * @param amt The amount to receive on the destination chain, in nAXC.
     * @param destinationChain `Swap` or `Core`
     * @param fee Fee to use in the export transaction, given in nAXC.
     */
    async exportFromAXChain(amt: BN, destinationChain: ExportChainsAX, exportFee: BN) {
        // Add import fee
        // Swap and Core have the same fee
        let importFee = avm.getTxFee()
        let amtFee = amt.add(importFee)

        let hexAddr = this.getEvmAddress()
        let bechAddr = this.getEvmAddressBech()

        let fromAddresses = [hexAddr]

        let destinationAddr =
            destinationChain === 'Swap'
                ? this.getCurrentAddressAvm()
                : this.getCurrentAddressPlatform()

        let exportTx = await TxHelper.buildEvmExportTransaction(
            fromAddresses,
            destinationAddr,
            amtFee,
            bechAddr,
            destinationChain,
            exportFee
        )

        let tx = await this.signAX(exportTx)
        return axChain.issueTx(tx.toString())
    }

    /**
     * Returns the estimated gas to export from AXChain.
     * @param destinationChain
     * @param amount
     */
    async estimateExportFee(destinationChain: ExportChainsAX, amount: BN): Promise<number> {
        let hexAddr = this.getEvmAddress()
        let bechAddr = this.getEvmAddressBech()

        let destinationAddr =
            destinationChain === 'Swap'
                ? this.getCurrentAddressAvm()
                : this.getCurrentAddressPlatform()

        return GasHelper.estimateExportGasFee(
            destinationChain,
            hexAddr,
            bechAddr,
            destinationAddr,
            amount
        )
    }

    async avmGetAtomicUTXOs(sourceChain: ExportChainsSwap) {
        let addrs = this.getAllAddressesX()
        return await UtxoHelper.avmGetAtomicUTXOs(addrs, sourceChain)
    }

    async platformGetAtomicUTXOs(sourceChain: ExportChainsCore) {
        let addrs = this.getAllAddressesP()
        return await UtxoHelper.platformGetAtomicUTXOs(addrs, sourceChain)
    }

    async importToPlatformChain(sourceChain: ExportChainsCore): Promise<string> {
        const utxoSet = await this.platformGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        const sourceChainId = Network.chainIdFromAlias(sourceChain)
        // Owner addresses, the addresses we exported to
        let pToAddr = this.getCurrentAddressPlatform()

        let hrp = axia.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr: Buffer) => bintools.addressToString(hrp, 'Core', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        const unsignedTx = await coreChain.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = await this.signCore(unsignedTx)
        // Pass in string because AJS fails to verify Tx type
        return coreChain.issueTx(tx.toString())
    }

    async importToSwapChain(sourceChain: AvmImportChainType) {
        const utxoSet = await this.avmGetAtomicUTXOs(sourceChain)

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let xToAddr = this.getCurrentAddressAvm()

        let hrp = axia.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr: Buffer) => bintools.addressToString(hrp, 'Swap', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        let sourceChainId = Network.chainIdFromAlias(sourceChain)

        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [xToAddr],
            fromAddrs,
            [xToAddr]
        )

        const tx = await this.signSwap(unsignedTx)
        return await avm.issueTx(tx.toString())
    }
}
export { WalletCore }
