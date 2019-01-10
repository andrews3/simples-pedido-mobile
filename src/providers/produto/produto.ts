import {Injectable} from '@angular/core';

@Injectable()
export class ProdutoProvider {

  private produtosPedido = [];
  public canShowToast = true;
  private lojaPedidoId = '';

  constructor() {
  }

  public getProduto(snapshot) {
    let produto: any;
    produto = snapshot.val();
    produto.grade = [];
    snapshot.child('grade').forEach(snapCor => {
      produto.grade.push(this.getCor(snapCor));
    });
    return produto;
  }

  public getCor(snapCor) {
    let cor: any;
    cor = snapCor.val();
    cor.tamanhos = [];
    snapCor.child('tamanhos').forEach(snapTam => {
      let tamanho: any;
      tamanho = snapTam.val();
      cor.tamanhos.push(tamanho);
    });
    return cor;
  }

  public getFoto(produto) {
    if (produto) {
      if (!produto.selectedCor) {
        return produto.grade[0].foto;
      }
      return produto.grade[produto.selectedCor].foto;
    }
  }

  public toColor(num) {
    num >>>= 0;
    let b = num & 0xFF,
      g = (num & 0xFF00) >>> 8,
      r = (num & 0xFF0000) >>> 16,
      a = ((num & 0xFF000000) >>> 24) / 255;
    return "rgba(" + [r, g, b, a].join(",") + ")";
  }

  public temEstoque(produto, isCounter?) {
    let temEstoque = false;
    let counter = 0;
    for (let cor of produto.grade) {
      for (let tam of cor.tamanhos) {
        if (tam.quantidade) {
          counter = counter + tam.quantidade;
          temEstoque = true;
        }
      }
    }
    if (isCounter)
      return counter;
    return temEstoque;
  }

  public getProdutosPedido(lojaId) {
    if (this.lojaPedidoId === lojaId) {
      return this.produtosPedido;
    }
  }

  public setProdutosPedido(produtosPedido, lojaId){
    this.lojaPedidoId = lojaId;
    this.produtosPedido = produtosPedido;
  }
}
