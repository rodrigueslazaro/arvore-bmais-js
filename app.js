var F = 0;
var kl = 0; //a chave no caso de divisão
var Nl = 0;
const RODA = 900;
const ORDEM = 9;

// ler o arquivo csv para a memória
const fs = require("fs");
let data = fs.readFileSync("output20.csv", "utf8");
data = data.split("\r\n");
for (let i in data) {
    data[i] = data[i].split(",");
    for (let j = 1; j < data[i].length; j++) {
        data[i][j] = parseInt(data[i][j]);
    }
}

function Tupla() { //onde ficarão as chaves e os demais campos do registro
    this.chave = 0;
    this.reg = [];
}

Folha = function () {
    this.dados = []; //os dados serão as tuplas
    this.folhaAnterior = null;
    this.proximaFolha = null;
}
Folha.prototype.eFolha = () => (true); //função que retorna que é uma folha 

Celula = function () {
    this.chave = null;  //celula que compõe os nós com a chave e os ponteiros
    this.noMaior = null;
    this.noMenor = null;
}

No = function () {
    this.dados = []; //nó em que seus dados serão as celulas
}
No.prototype.eFolha = () => (false); //função que retorna que um nó não é folha

Arvore = function (ordem) { 
    this.raiz = new Folha();
    this.chaveMaxima = ordem - 1; //maximo de chaves que podem ser armazenadas em cada nó/folha
    this.chaveMinimaFolha = Math.floor(ordem / 2);  //trunca -> é o minimo de chaves na folha
    this.chaveMinimaNo = Math.floor(this.chaveMaxima / 2); //é o mínimo de celulas em um nó exceto a raiz
    this.folha = new Folha();
    this.ordem = ordem;
    this.prof = 1; 
}

// Pesquisa por igualdade
Arvore.prototype.pesquisaNo = function (N, k) { //encontra a folha em que um registro pode estar
    if (N.eFolha()) {
        return N; //retorna a folha em que provavelmente está k
    }
    if (k < N.dados[0].chave) { //percorre a árvore
        return this.pesquisaNo(N.dados[0].noMenor, k); //chama recursivamente para verificar se chegou na folha
    } else {
        let i = 0;
        let Ni = 0;
        while (i <= (N.dados.length - 1)) {
            if (k < N.dados[i].chave) {
                Ni = N.dados[i].noMenor;
                return this.pesquisaNo(Ni, k);
            } else if (i === (N.dados.length - 1)) {
                Ni = N.dados[i].noMaior;
                return this.pesquisaNo(Ni, k);
            }
            i++;
        }
    }
}
                                            //recebe a chave
Arvore.prototype.buscaPorIgualdade = function (k) {
    return this.pesquisaNo(this.raiz, k); //chama a função para procurar k a partir da raiz
}

Arvore.prototype.buscaPorIntervalo = function (comeco, fim, tipo) {//busca de uma chave inicial até final de acordo com o tipo de busca
    let paginaComeco = this.pesquisaNo(this.raiz, comeco); //pega a folha q possui o primeiro registro buscado
    let proximaPagina = paginaComeco;
    const paginas = []; //vetor para armazenar as páginas com os registros buscados
    paginas.push(paginaComeco.dados); //coloco no vetor a primeira pagina 
    function percorrer() {
        for (i of proximaPagina.proximaFolha.dados) {//vou encontrar a página do último registro
            if (i.chave === fim) {
                return false;
            }
        }
        return true;
    }
    while (percorrer()) {
        proximaPagina = proximaPagina.proximaFolha;
        paginas.push(proximaPagina.dados); //vai adicionando todas as paginas do intervalo de interesse
    }
    paginaFinal = proximaPagina.proximaFolha;//pega a última pagina
    paginas.push(paginaFinal.dados);//adiciona a ultima pagina no vetor de paginas
    const dados = paginas.flat(); // remover aninhamento de arrays
    const tamanho = dados.length
    const novoDados = []; //aqui ficarão armazenados os registros que realmente são de buscados
    switch (tipo) {
        case 0: // >= <= (inclui os extremos)
            for (let i = 0; i < tamanho; i++) {
                if (dados[i].chave >= comeco && fim >= dados[i].chave) {
                    novoDados.push(dados[i]);
                }
            }
            break;
        case 1: // > < (não inclui os extremos)
            for (let i = 0; i < tamanho; i++) {
                if (dados[i].chave > comeco && fim > dados[i].chave) {
                    novoDados.push(dados[i]);
                }
            }
            break;
        case 2: // >= < (não inclui o extremos maior)
            for (let i = 0; i < tamanho; i++) {
                if (dados[i].chave >= comeco && fim > dados[i].chave) {
                    novoDados.push(dados[i]);
                }
            }
            break;
        case 3: // > <= (não inclui o extremo menor)
            for (let i = 0; i < tamanho; i++) {
                if (dados[i].chave > comeco && fim >= dados[i].chave) {
                    novoDados.push(dados[i]);
                }
            }
            break;
    }
    return novoDados;
}

Arvore.prototype.removeFolha = function (P, N, k) {
    //remover o registro
    let aux = 0;
    let flag = 0;
    let celula = new Celula();
    let celula2 = new Celula();
    let folha = new Folha();
    let folhai = new Folha();
    let i = 0;
    for (o of N.dados) { //percorre a folha
        if (o.chave === k) {
            N.dados.splice(i, 1); //remove da folha
            break;
        }
        i++;
    }
    if (this.chaveMinimaFolha <= N.dados.length || P === 0) { //verifica se a folha está com ocupação mínima
        return [0, 0];
    } else {
        for (let i = 0; i < P.dados.length; i++) { //percorre o pai 
            if (P.dados[i].noMenor === F || P.dados[i].noMaior === F) {
                celula = P.dados[i]; //descobre qual era a celula pai da folha
                if (P.dados[i].noMenor === F) {
                    folha = P.dados[i].noMaior; //pega a folha irma
                } else {
                    folha = P.dados[i].noMenor;
                    if (P.dados[i + 1]) {
                        celula2 = P.dados[i + 1];
                        folhai = P.dados[i + 1].noMaior; //pega se tiver outra folha irmã
                    }
                    flag = 1;
                }
                aux = i;
                break;
            }
        } //redistribuindo //verifico se pelo menos uma das irmãs pode doar registros
        if ((folha.dados.length > this.chaveMinimaFolha) || (folhai.dados.length > this.chaveMinimaFolha)) {
            if (flag === 0) { //verifico se a F inicial era o noMenor do pai
                N.dados.push(folha.dados.shift()); //pego da irma que é maior
                P.dados[aux].chave = folha.dados[0].chave; //coloco a nova chave no pai
            } else if (flag === 1) { //verifico se a F inicial era o noMaior do pai
                if (folha.dados.length > this.chaveMinimaFolha) { //a primeira folha irmã pode emprestar
                    N.dados.unshift(folha.dados.pop());
                    P.dados[aux].chave = N.dados[0].chave;
                } else { //aqui quem tem que emprestar é a outra folha irmã
                    N.dados.push(folhai.dados.shift());
                    P.dados[aux + 1].chave = folhai.dados[0].dados;
                }
            }
            return [0, 0];
        } else {
            let tamanho = P.dados.length;
            for (let i = 0; i < tamanho; i++) { //percorro o pai
                if (P.dados[i] === celula) {
                    P.dados.splice(i, 1); //removendo do pai ja q vou juntar as folhas
                    if (celula.noMaior === F && P.dados[i]) {
                        P.dados[i].noMenor = folha; //organizo o ponteiro caso necessário
                    }
                    break;
                }
            } //juntar pagina
            if (celula.noMenor === F) { //caso em q folha irma é no maior
                for (let i = N.dados.length - 1; i >= 0; i--) {
                    folha.dados.splice(0, 0, (N.dados[i]));
                }
                folha.folhaAnterior = N.folhaAnterior; //arrumo ponteiros
                if (N.folhaAnterior) {
                    N.folhaAnterior.proximaFolha = folha;
                }
            } else { //caso em q folha irma é no menor
                for (let i = 0; i < N.dados.length; i++) {
                    folha.dados.push(N.dados[i]); //basta colocar no final da folha
                }
                folha.proximaFolha = N.proximaFolha; //organizo os ponteiros
                if (N.proximaFolha) {
                    N.proximaFolha.folhaAnterior = folha;
                }
            }
            kn = folha.dados[0];
            return [kn, P, folha]; //retorno a possivel nova chave para o no, o pai, e a folha em que juntei os registros
        }
    }
}

Arvore.prototype.ajustaNosRemocao = function (P, f) {
    let celula = new Celula();
    let celula2 = new Celula();
    const avo = this.encontrarPaiNo(this.raiz, P.dados[0].chave);
    let no = new No();
    let noi = new No();
    var aux = 0;
    let flag = 0;
    for (let i = 0; i < avo.dados.length; i++) { //percorro o nó avô
        if (avo.dados[i].noMenor === P || avo.dados[i].noMaior === P) {
            celula = avo.dados[i]; //descobre a celula avo
            aux = i;
            if (celula.noMenor === P) {
                no = celula.noMaior; //pega o no irmão
                flag = 1; //para marcar q foi o nó menor
            } else {
                no = celula.noMenor; //nó irmão nesse caso é o noMenor
                if (avo.dados[i + 1]) {
                    celula2 = avo.dados[i + 1];
                    noi = celula2.noMaior; //pego se tiver outro irmão
                }
            }
            break;
        }
    } //redistribuição
    if ((no.dados.length > this.chaveMinimaNo) || (noi.dados.length > this.chaveMinimaNo)) {
        if (flag) { //caso em q o nó irmao é maior e o proprio é menor
            celula.chave = no.dados[0].chave; //caso em q o nó irmao é maior e o proprio é menor
            var colocar = no.dados.shift(); //apenas para arrumar ponteiros
            P.dados.push(colocar);
            P.dados[P.dados.length - 1].noMaior = colocar.noMenor; //arrumo os ponteiros da celula que acabei de redistribuir
            P.dados[P.dados.length - 1].noMenor = P.dados[P.dados.length - 2].noMaior;
            if (f.eFolha()) { //basta pegar a chave da folha
                P.dados[P.dados.length - 1].chave = P.dados[P.dados.length - 1].noMaior.dados[0].chave; /*ALTEREI ISSO*/
            } else {
                let obj = P.dados[P.dados.length - 1].noMaior.dados[0].noMenor; //quando for nós
                while (!obj.eFolha()) { //preciso encontrar a folha objetivo com a chave que preciso
                    obj = obj.dados[0].noMenor; //procuro quem será a chave
                }
                P.dados[P.dados.length - 1].chave = obj.dados[0].chave; //pego a chave por fim /*ALTEREI ISSO*/
            }
        } else { //caso em q o no irmao é menor e o proprio é maior
            if (no.dados.length > this.chaveMinimaNo) { //verifico se ele pode doar celula
                P.dados.unshift(no.dados.pop()); //doa a celula
                celula.chave = P.dados[0].chave; //pega a chave para p avô
                P.dados[0].noMenor = P.dados[0].noMaior; //organiza os ponteiros
                P.dados[0].noMaior = P.dados[1].noMenor;
                if (f.eFolha()) {
                    P.dados[0].chave = P.dados[0].noMaior.dados[0].chave; /*ALTEREI ISSO*/
                } else {
                    let obj = P.dados[0].noMaior.dados[0].noMenor; //quando for nós
                    while (!obj.eFolha()) {
                        obj = obj.dados[0].noMenor;
                    }
                    P.dados[0].chave = obj.dados[0].chave; /*ALTEREI ISSO*/
                }
            } else { //caso em q o no irmao que pode doar é maior e o proprio é menor
                celula2.chave = noi.dados[0].chave; //pego a chave para o avô
                let colocar = noi.dados[0].noMenor;
                P.dados.push(noi.dados.shift()); //noi doa a celula
                P.dados[P.dados.length - 1].noMenor = P.dados[P.dados.length - 2].noMaior; //arruma ponteiros
                P.dados[P.dados.length - 1].noMaior = colocar;
                if (f.eFolha()) {
                    P.dados[P.dados.length - 1].chave = P.dados[P.dados.length - 1].noMaior.dados[0].chave; /*ALTEREI ISSO*/
                } else {
                    let obj = P.dados[P.dados.length - 1].noMaior.dados[0].noMenor; //quando for nós
                    while (!obj.eFolha()) {
                        obj = obj.dados[0].noMenor;
                    }
                    P.dados[P.dados.length - 1].chave = obj.dados[0].chave; /*ALTEREI ISSO*/ 
                }

            }
        }
        return [0, 0];
    } else { //juntar nós
        if (flag) { //verifica se o nó modificado foi o menor do avô
            celula.noMenor = P.dados[P.dados.length - 1].noMaior; //arruma ponteiros
            celula.noMaior = no.dados[0].noMenor;
            no.dados.unshift(celula); //coloca a celula no começo
            for (let i = P.dados.length - 1; i >= 0; i--) {
                no.dados.unshift(P.dados[i]); //percorre o P para juntar no nó irmão
            }
        } else { //caso em q o nó modificado foi o maior
            celula.noMenor = no.dados[no.dados.length - 1].noMaior; //arruma ponteiros
            celula.noMaior = P.dados[0].noMenor;
            no.dados.push(celula); //coloca a celula no fim
            for (let i = P.dados.length - 1; i >= 0; i--) {
                no.dados.push(P.dados.shift()); //percorre o P para juntar no nó irmão
            }
        }
        if (celula2) { //verifica se há outra celula depois da celula pai e arruma o ponteiro
            celula2.noMenor = no;
        }
        avo.dados.splice(aux, 1); //remove do avô a celula avo já que tive q juntar nós
        if (avo !== this.raiz && avo.dados.length < this.chaveMinimaNo) {
            return this.ajustaNosRemocao(avo, no);
        }
        kn = no.dados[0];
        return [kn, no];
    }
}

// P = pai  //N = filho
Arvore.prototype.remove = function (P, N, k) {
    if (N.eFolha()) {
        var [kl, Nl, f] = this.removeFolha(P, N, k); //pai, folha e a chave do registro
    }
    if (kl !== 0 && Nl !== 0) { //caso em que tive que juntar folhas
        if (this.chaveMinimaFolha <= Nl.dados.length || Nl === this.raiz) { //Nl é o pai
            if (this.raiz.dados.length === 0) {
                this.raiz = f; //nova raiz será a folha, é o caso de ter removido quase todos os elementos da árvore
            }
            return [0, 0];
        } else {
            var [kn, no] = this.ajustaNosRemocao(P, f); //pai e a folha em que os resgitros foram juntados
            return [kn, no];
        }
    }
    return [0, 0];
}

Arvore.prototype.removeRaiz = function (k) {
    F = this.buscaPorIgualdade(k); //procura a folha onde se deve remover
    let flag = false;
    for (f of F.dados) { //percorre a folha 
        if (f.chave === k) {
            flag = true; //se encontrar k na árvore irá remover
            break;
        }
    }
    if (flag) {
        const pai = this.encontrarPai(this.raiz, k); //encontro o nó pai
        var [kl, Nl] = this.remove(pai, F, k); //entregando o pai, a folha e a chave do registro para remover
        if ((kl !== 0 && Nl !== 0) && (this.raiz.dados.length === 0 || this.raiz.dados[0].noMenor.length === 0 || this.raiz.dados[0].length === 0)) { //verificar tb se raiz tem um único filho
            this.raiz = Nl;
        }
    }
    return [0, 0];
}

Arvore.prototype.insereFolha = function (N, k) { //k é um registro
    if (N.dados.length < this.chaveMaxima) { //verificar se tem espaço na página isso pode ser em bytes
        const tamanho = N.dados.length - 1;
        if (tamanho >= 0) {
            for (let i = 0; i <= (tamanho); i++) { //percorrer a folha
                if (k.chave < N.dados[i].chave) {
                    N.dados.splice(i, 0, k); //encontra onde deve ser inserido de forma ordenada
                    return [0, 0];
                }
            }
        }
        N.dados.push(k); //insere no final caso não seja necessário
        return [0, 0];
    }
    const novaFolha = new Folha(); //folha M
    const tamanho = N.dados.length - 1;
    for (let i = 0; i <= (tamanho); i++) {
        if (k.chave < N.dados[i].chave) { //simula a inserção de forma ordenada na folha de início
            N.dados.splice(i, 0, k);
            break;
        } else if (i === N.dados.length - 1) {
            N.dados.push(k);
            break;
        }
    }
    for (let i = this.chaveMinimaFolha; i <= tamanho + 1; i++) { //redistribuindo os registros na folha
        novaFolha.dados.unshift(N.dados.pop());                     //garantindo a ocupação mínima
    }
    //ligar N e M aos irmãos
    novaFolha.folhaAnterior = N;
    novaFolha.proximaFolha = N.proximaFolha;
    if (N.proximaFolha) {
        N.proximaFolha.folhaAnterior = novaFolha;
    }
    N.proximaFolha = novaFolha;
    //pegar o menor registro da novaPagina
    let km = novaFolha.dados[0];
    return [km, novaFolha];
}

Arvore.prototype.encontrarPagina = function (N, k) {
    if (N.eFolha()) { //verifica se N já é a folha/pagina em que se deve inserir
        F = N;
        return N;
    } else if (k < N.dados[0].chave) {           //começa a percorrer a árvore recursivamente
        return this.encontrarPagina(N.dados[0].noMenor, k);
    } else {
        let i = 0;
        while (i <= (N.dados.length - 1)) {
            if (k < N.dados[i].chave) {
                return this.encontrarPagina(N.dados[i].noMenor, k);
            } else if (i === (N.dados.length - 1)) {
                return this.encontrarPagina(N.dados[i].noMaior, k);
            }
            i++;
        }
    }
}

Arvore.prototype.encontrarPaiNo = function (N, k) { //k é a chave para encontrar o pai
    for (let i = 0; i < N.dados.length; i++) { //percorro o nó
        if (k < N.dados[i].chave) {
            let aux = N.dados[i].noMenor;
            let a = 0;
            while (a <= (aux.dados.length - 1)) {
                if (k === aux.dados[a].chave) {
                    return N; //retornar o nó pai
                }
                a++;
            }
            return this.encontrarPaiNo(N.dados[i].noMenor, k); //chamo recursivo se não tiver encontrado ainda
        } else if (i === (N.dados.length - 1)) { //se já tiver na última celula do nó
            let aux2 = N.dados[i].noMaior; //procuro no nó maior
            let b = 0;
            while (b <= (aux2.dados.length - 1)) {
                if (k === aux2.dados[b].chave) {
                    return N; //retorno o nó pai
                }
                b++;
            }
            return this.encontrarPaiNo(N.dados[i].noMaior, k); //chamos recursivo se não tiver encontrado ainda
        } 
    }
}


Arvore.prototype.encontrarPai = function (N, k) { 
    if (N.eFolha()) { //inicialmente é a raiz
        return 0;
    }
    if (k < N.dados[0].chave) { //percorre a árvore para encontrar k de forma recursiva
        if ((N.dados[0].noMenor).eFolha()) { //verifica se chegou na folha em que k deve estar
            return N;
        }
        return this.encontrarPai(N.dados[0].noMenor, k); //chama a função para percorrer o noMenor de uma celula pai
    } else {
        let i = 0;
        while (i <= (N.dados.length - 1)) { //percorre todas as celulas (chaves) do nó
            if (k < N.dados[i].chave) {
                if ((N.dados[i].noMenor).eFolha()) {
                    return N;
                }
                return this.encontrarPai(N.dados[i].noMenor, k);
            } else if (i === (N.dados.length - 1)) {
                if ((N.dados[i].noMaior).eFolha()) { //até o noMaior da última chave
                    return N; 
                }
                return this.encontrarPai(N.dados[i].noMaior, k);
            }
            i++;
        }
    }
    return 0;
}

Arvore.prototype.reajustaNos = function (pai, kl, Nl) {
    let celula = new Celula();
    if (!kl.chave) { //se não for celula preciso criar a celula para colocar no nó
        celula.chave = kl;
        celula.noMaior = Nl;
        celula.noMenor = Nl.folhaAnterior;
    } else {
        celula = kl;
    }
    const novoNo = new No();
    const tamanho = pai.dados.length - 1;
    for (let i = 0; i <= (tamanho); i++) { //percorro o pai para encontrar onde inserir a celula
        if (celula.chave < pai.dados[i].chave) {
            pai.dados.splice(i, 0, celula);
            pai.dados[i + 1].noMenor = celula.noMaior;
            break;
        } else if (i === pai.dados.length - 1) {
            pai.dados.push(celula);
            break;
        }
    }
    for (let i = this.chaveMinimaFolha; i <= tamanho + 1; i++) { //redistribuo o pai no novoNo para garantir o limite de chaves no nó
        novoNo.dados.unshift(pai.dados.pop());
    }
    const km = novoNo.dados[0]; //pego a chave que irá para o novo No pai, chamado avô
    novoNo.dados.shift();
    const avo = this.encontrarPaiNo(this.raiz, pai.dados[0].chave); //encontro o pai do nó
    if (avo.dados.length < this.chaveMaxima) {  //se couber a celula no avô
        this.inserirOrdenado(avo, novoNo, km); //insiro no avô o km que aponta para o novoNo
        return [0, 0];
    }
    if (avo == this.raiz && this.raiz.dados.length === this.chaveMaxima) {
        km.noMaior = novoNo;
        km.noMenor = pai;
        return [km, avo];
    } else {
        km.noMaior = novoNo;
        km.noMenor = pai;
        return this.reajustaNos(avo, km, novoNo); //para encontrar o pai do avo e inserir km ligando ao novoNo
    }
}

Arvore.prototype.insere = function (N, k) { //esse k deve ser todo o registro
    //a nova pagina criada
    if (N.eFolha()) { //verifica se N já é a folha para inserir o registro
        var [kl, Nl] = this.insereFolha(N, k); // a folha onde se deve inserir e o registro
    } else {
        this.encontrarPagina(N, k.chave);  //encontra a folha/pagina onde se deve inserir 
        var [kl, Nl] = this.insere(F, k); //entrega a folha que é encontrada em encontrar página e o registro
    }
    if (Nl == this.raiz && this.raiz.dados.length === this.chaveMaxima) { //como a função é recursiva preciso fazer esse teste
        return [kl, Nl];
    }
    if (kl !== 0 && Nl !== 0) { //se passar nesse if é porque houve redistribuição nas folhas
        const pai = this.encontrarPai(this.raiz, kl.chave); //entrego a chave do registro q acabei de inserir
        if (pai === 0) { //é quando tinha apenas a raiz na árvore
            var novoPai = new No();
            let celula = new Celula();
            const N = [...Nl.folhaAnterior.dados]; //neste caso, a raiz era uma folha q foi dividida em duas, Nl e N
            N.push(...Nl.dados);            //é como uma cópia apenas para descobrirmos a chave que irá pro novoPai (raiz)
            const k = N[Math.round(N.length / 2) - 1]; //Pega a chave que irá pro novoPai
            celula.chave = k.chave;
            celula.noMaior = Nl;                //arrumo os ponteiros
            celula.noMenor = Nl.folhaAnterior;
            novoPai.dados.push(celula);
            this.raiz = novoPai;
            return [novoPai.dados[0], novoPai];
        } else if (pai.dados.length < this.chaveMaxima) { //testa se cabe uma nova chave no pai 
            this.inserirOrdenado(pai, Nl, kl.chave); //insere no pai a chave que apontará para a nova folha
            return [0, 0];
        } else {
            if (pai === this.raiz) {
                return [kl, Nl]; //kl é a nova chave para a raiz e Nl a folha/nó a ser ligada a ela
            } else {
                var [kl, Nl] = this.reajustaNos(pai, kl.chave, Nl); //ajustar pai com a chave e a nova folha
                return [kl, Nl];
            }
        }
    }
    return [0, 0];
}

Arvore.prototype.inserirOrdenado = function (no, novoNo, valor) {
    const celula = new Celula();
    for (let i = 0; i <= (no.dados.length - 1); i++) { //percorro o pai
        if (valor < no.dados[i].chave || valor.chave < no.dados[i].chave) { //testo de vou seguir o nó menor
            if (valor.chave) { //verifico se é uma celula
                valor.noMaior = novoNo;                 //organizo os ponteiros
                valor.noMenor = no.dados[i].noMenor;
                no.dados.splice(i, 0, valor);           //insiro de forma ordenada
                no.dados[i + 1].noMenor = valor.noMaior;
            } else {
                celula.chave = valor;
                celula.noMaior = novoNo; //ou novaFolha
                if (novoNo.eFolha()) {
                    celula.noMenor = novoNo.folhaAnterior; //ajusto os ponteiros
                } else {
                    celula.noMenor = no.dados[i].noMenor;
                }
                no.dados.splice(i, 0, celula); //insere a celula de forma ordenada
                if (no.dados[i + 1]) {
                    no.dados[i + 1].noMenor = novoNo;
                }
            }
            break;
        } else if (i === no.dados.length - 1) { //testo se estou na última chave e terei q seguir o noMaior
            if (valor.chave) {  //verifico se é celula
                valor.noMaior = novoNo;         //organizo os ponteiros
                valor.noMenor = no.dados[i].noMaior;
                no.dados.push(valor); //coloco no final
            } else {
                celula.chave = valor;
                celula.noMaior = novoNo;
                if (novoNo.eFolha()) {
                    celula.noMenor = novoNo.folhaAnterior;
                } else {
                    celula.noMenor = no.dados[i].noMaior;
                }
                no.dados.push(celula); //na última posição a celula é inserida no final
            }
            break;
        }
    }
}

Arvore.prototype.insereRaiz = function (k) { //esse k deve ser o registro completo
    const folha = this.buscaPorIgualdade(k.chave); //encontra a folha em que uma chave a ser inserida já pode estar
    let flag = true;
    for (f of folha.dados) { //percorre a folha encontrada para verificar se a chave já não existe na árvore
        if (f.chave === k.chave) {
            flag = false; //caso exista, a flag recebe falso
            break;
        }
    }
    if (flag) { //se não tiver encontrado a chave a ser inserida na folha, então poderá inserir
        const [kl, Nl] = this.insere(this.raiz, k); //chama a função insere
        if ((kl !== 0 && Nl !== 0) && (this.raiz.dados.length === this.chaveMaxima)) { //raiz está cheia
            const novoNo = new No();
            const tamanho = this.raiz.dados.length - 1;
            if (kl.noMaior || kl.noMenor) { //verifico se kl é uma celula
                for (let i = 0; i <= (tamanho); i++) { ///percorre a raiz
                    if (kl.chave < this.raiz.dados[i].chave) { //encontra onde inserir
                        this.raiz.dados.splice(i, 0, kl); //insere de forma ordenada (reposicionando)
                        this.raiz.dados[i + 1].noMenor = kl.noMaior; //ajusta os ponteiros
                        break;
                    } else if (i === this.raiz.dados.length - 1) { //verifica se está na ultima chave
                        this.raiz.dados.push(kl); //neste caso insere no final
                        break;
                    }
                }
                for (let i = this.chaveMinimaNo; i <= tamanho + 1; i++) { //redistribuindo a raiz com o novoNo
                    novoNo.dados.unshift(this.raiz.dados.pop());
                }
            }
            if (Nl.eFolha() && !(kl.noMaior || kl.noMenor)) { //Nl é uma folha e kl não é celula
                let celula = new Celula();
                celula.chave = kl.chave; //kl é uma tupla
                celula.noMaior = Nl;
                celula.noMenor = Nl.folhaAnterior;
                for (let i = 0; i <= (tamanho); i++) { //percorre a raiz para descobrir onde inserir de forma ordenada
                    if (celula.chave < this.raiz.dados[i].chave) {
                        this.raiz.dados.splice(i, 0, celula);
                        this.raiz.dados[i + 1].noMenor = celula.noMaior;
                        break;
                    } else if (i === this.raiz.dados.length - 1) {
                        this.raiz.dados.push(celula);
                        break;
                    }
                }
                for (let i = this.chaveMinimaNo; i <= tamanho + 1; i++) { //redistribuindo a raiz respeitando o limite de chaves
                    novoNo.dados.unshift(this.raiz.dados.pop());
                }
            }
            var novoPai = new No();
            let celulaP = new Celula();
            celulaP.chave = novoNo.dados[0].chave; //pego a chave da primeira posição do nó da direita
            novoNo.dados.shift(); //tiro a chave escolhida do novoNo
            celulaP.noMaior = novoNo;
            celulaP.noMenor = this.raiz; //arrumo os ponteiros
            novoPai.dados.push(celulaP);
            this.raiz = novoPai; //defino a nova raiz
        } 
    }
}

main = () => {
    const arvore = new Arvore(ORDEM);
    for (let i = 0; i < RODA; i++) {
        if (data[i][0] === '+') {
            data[i].splice(0, 1);
            const t = new Tupla();
            t.chave = data[i][0];
            data[i].shift();
            t.reg = data[i];
            arvore.insereRaiz(t);
        } else {
            arvore.removeRaiz(data[i][1]);
        }
    }
    let achar = 4783
    let a = arvore.buscaPorIgualdade(achar);
    let flag = 0;
    for (i of a.dados) {
        if (i.chave === achar) {
            flag++;
            console.log(i);
        }
    }
    if (flag === 0) {
        console.log("REGISTRO NÃO ENCONTRADO!");
    }
    let b = arvore.buscaPorIntervalo(13, 260, 0);
    console.log(b);
}

main()