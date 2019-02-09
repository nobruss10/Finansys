
import { InMemoryDbService } from "angular-in-memory-web-api";

export class InMemoryDataBase implements InMemoryDbService {
    createDb() {
        const categories = [
            {id: 1, name: 'Moradia', description: 'Pagamento de contas da casa'},
            {id: 1, name: 'Saúde', description: 'Plano de Saúde e Remédios'},
            {id: 1, name: 'Lazer', description: 'Cinema, parques, praia e etc'},
            {id: 1, name: 'Salário', description: 'Recebimento de salário'},
            {id: 1, name: 'Freelas', description: 'Trabalho como freelance'}
        ]

        return { categories }
    }    
}
