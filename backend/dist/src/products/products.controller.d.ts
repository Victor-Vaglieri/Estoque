import { ProductsService } from './products.service';
import { UpdateProdutoDto } from './dto/update-product.dto';
import { CreateProdutoDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAllFornecedores(): Promise<{
        nome: string;
        id: number;
    }[]>;
    getProducts(req: any): Promise<{
        estoqueLojas: undefined;
        quantidadeEst: number;
        quantidadeNec: number;
        realLojaId: number | null;
        fornecedor: {
            nome: string;
            id: number;
        };
        nome: string;
        id: number;
        codigo: string | null;
        corredor: string | null;
        producao: boolean;
        marca: string | null;
        categoria: string | null;
        unidade: string;
        quantidadeMin: number;
        quantidadeMax: number;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        fornecedorId: number;
    }[]>;
    getProductsWithStock(req: any): Promise<{
        quantidadeEst: number;
        quantidadeNec: number;
        nome: string;
        id: number;
        codigo: string | null;
        corredor: string | null;
        producao: boolean;
        marca: string | null;
        categoria: string | null;
        unidade: string;
        quantidadeMin: number;
        quantidadeMax: number;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        fornecedorId: number;
    }[]>;
    addProduct(req: any, createProductDto: CreateProdutoDto): Promise<{
        nome: string;
        id: number;
        codigo: string | null;
        corredor: string | null;
        producao: boolean;
        marca: string | null;
        categoria: string | null;
        unidade: string;
        quantidadeMin: number;
        quantidadeMax: number;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        fornecedorId: number;
    }>;
    modifyProduct(productId: number, req: any, updateProductDto: UpdateProdutoDto): Promise<{
        nome: string;
        id: number;
        codigo: string | null;
        corredor: string | null;
        producao: boolean;
        marca: string | null;
        categoria: string | null;
        unidade: string;
        quantidadeMin: number;
        quantidadeMax: number;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        fornecedorId: number;
    }>;
}
