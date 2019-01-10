import {Component, ViewChild} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {UtilProvider} from "../../../providers/util/util";
import {ModalVisualizaFotoComponent} from "../../../components/modal-visualiza-foto/modal-visualiza-foto";
import {ModalAdicionaProdutoComponent} from "../../../components/modal-adiciona-produto/modal-adiciona-produto";
import {ProdutoProvider} from "../../../providers/produto/produto";
import * as lodash from 'lodash';
import {ModalFinalizaPedidoComponent} from "../../../components/modal-finaliza-pedido/modal-finaliza-pedido";
import {Content} from "ionic-angular/navigation/nav-interfaces";
import {Http} from "@angular/http";

@IonicPage()
@Component({
  selector: 'page-varejo-separa-pedidos',
  templateUrl: 'varejo-separa-pedidos.html',
})
export class VarejoSeparaPedidosPage {
  @ViewChild('content') content: Content;

  private refListener;
  private shopping;
  private loja;
  private firebase;
  public produtos = [];
  private carrinho = [];
  public defaultImage = 'assets/imgs/spin.svg';
  private modalIsOpen = false;
  private modalFinalizaIsOpen = false;
  private modalProdutoId = '';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private util: UtilProvider,
              private modalCtrl: ModalController,
              public produtoProvider: ProdutoProvider,
              private http: Http) {
    this.shopping = this.navParams.get('shopping');
    this.loja = this.navParams.get('loja');
    this.firebase = this.util.getFirebase();

    this.iniciaListeners();
  }

  ionViewWillUnload() {
    this.refListener.off();
    this.produtoProvider.setProdutosPedido([], '');
  }

  private iniciaListeners() {
    this.refListener = this.firebase.child('shoppings').child(this.shopping.idShopping).child('lojas').child(this.loja.lojaId).child('produtos');
    this.refListener.on('child_added', snapshot => {
      let produto = this.produtoProvider.getProduto(snapshot);
      if (this.produtoProvider.temEstoque(produto)) {
        this.produtos.push(produto);
      }
    });
    this.refListener.on('child_changed', snapshot => {
      for (let i = 0; i < this.carrinho.length; i++) {
        if (this.carrinho[i].id === snapshot.key) {
          for (let corCarrinho of this.carrinho[i].grade) {
            snapshot.child('grade').forEach(snapCor => {
              if (corCarrinho.id === snapCor.key) {
                for (let tamCarrinho of corCarrinho.tamanhos) {
                  snapCor.child('tamanhos').forEach(snapTam => {
                    if (tamCarrinho.id === snapTam.key) {
                      if (snapTam.child('quantidade').val() < tamCarrinho.quantidade) {
                        tamCarrinho.quantidade = snapTam.child('quantidade').val();
                        if (snapshot.key !== this.modalProdutoId) {
                          if (this.produtoProvider.canShowToast) {
                            this.util.mostraToast('Alguém separou o tamanho ' + tamCarrinho.tipo + ' do produto ' + this.carrinho[i].nome + ' antes de você finalizar o seu pedido, sobraram ' +
                              'apenas ' + tamCarrinho.quantidade + ' unidades :(', 7000);
                          }
                          if (this.modalFinalizaIsOpen) {
                            this.produtoProvider.setProdutosPedido(this.geraProdutoPedido(), this.loja.lojaId);
                          }
                        }
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }
      let produto = this.produtoProvider.getProduto(snapshot);
      if (this.produtoProvider.temEstoque(produto)) {
        let canAdd = true;
        for (let prod of this.produtos) {
          if (produto.id === prod.id) {
            canAdd = false;
          }
        }
        if (canAdd) {
          this.produtos.push(produto);
        }
      }
    });
  }

  public trocaFoto(produto, cor) {
    produto.selectedCor = produto.grade.indexOf(cor);
  }

  public getFoto(produto) {
    return this.produtoProvider.getFoto(produto);
    // return "https://picsum.photos/200/300/?image=" + produto.i;
  }


  public toColor(num) {
    return this.produtoProvider.toColor(num);
  }

  public abreFoto(produto) {
    let modal = this.modalCtrl.create(ModalVisualizaFotoComponent, {foto: this.getFoto(produto)});
    modal.present();
  }

  public abreProduto(produto) {
    let gradeCarrinho = [];
    for (let prodCarrinho of this.carrinho) {
      if (produto.id === prodCarrinho.id) {
        gradeCarrinho = prodCarrinho.grade;
      }
    }
    let modal = this.modalCtrl.create(ModalAdicionaProdutoComponent, {
      produto: produto,
      shoppingId: this.shopping.idShopping,
      lojaId: this.loja.lojaId,
      gradeCarrinho: gradeCarrinho
    });
    modal.onDidDismiss(callback => {
      this.modalIsOpen = false;
      this.modalProdutoId = '';
      if (callback && callback.produtoAdicionado) {
        this.adicionaCarrinho(callback.produtoAdicionado);
      } else if (callback && callback.remove) {
        for (let i = 0; i < this.carrinho.length; i++) {
          if (this.carrinho[i].id === produto.id) {
            this.carrinho.splice(i, 1);
          }
        }
      }
    });
    this.modalIsOpen = true;
    this.modalProdutoId = produto.id;
    modal.present();
  }

  private adicionaCarrinho(produto) {
    // VERIFICA MESMO PRODUTO
    let shouldAddProduto = true;
    let mensagem = '';
    for (let produtoCarrinho of this.carrinho) {
      if (produtoCarrinho.id === produto.id) {
        shouldAddProduto = false;
        let qtCarrinho = this.produtoProvider.temEstoque(produtoCarrinho, true);
        let qtProduto = this.produtoProvider.temEstoque(produto, true);
        if (qtCarrinho === qtProduto) {
          mensagem = "Mantido os tamanhos do carrinho :)"
        } else if (qtCarrinho > qtProduto) {
          mensagem = "Diminuído as quantidades no carrinho :'("
        } else {
          mensagem = 'Tamanhos adicionados ao produto do carrinho :D'
        }
        produtoCarrinho.grade = produto.grade;
      }
    }
    if (shouldAddProduto) {
      this.carrinho.push(produto);
      this.util.mostraToast('Produto adicionado ao carrinho :D');
    } else {
      this.util.mostraToast(mensagem);
    }
  }

  public finalizaPedido() {
    let totalPrice = 0;
    let load = this.util.getLoad('Abrindo o carrinho...');
    for (let produto of this.carrinho) {
      let qtProduto: any = this.produtoProvider.temEstoque(produto, true);
      totalPrice = totalPrice + (qtProduto * produto.preco);
    }
    if (this.getQuantidadeCarrinho() < 1) {
      this.util.mostraToast('Seu carrinho ainda está vazio :(');
      load.dismiss();
      return;
    }
    this.firebase.child('shoppings').child(this.shopping.idShopping).child('lojas').child(this.loja.lojaId).child('info').child('pedidoMinimo').once('value')
      .then(minimoSnap => {
        if (totalPrice < minimoSnap.val()) {
          this.util.mostraToast('O pedido mínimo da loja é de R$' + minimoSnap.val().toFixed(2) + ', adicione mais R$' + (minimoSnap.val() - totalPrice).toFixed(2) + ' em produtos');
          load.dismiss();
          return;
        } else {
          this.produtoProvider.setProdutosPedido(this.geraProdutoPedido(), this.loja.lojaId);
          this.modalFinalizaIsOpen = true;
          let modal = this.modalCtrl.create(ModalFinalizaPedidoComponent, {
            lojaId: this.loja.lojaId,
            shoppingId: this.shopping.idShopping,
            isFinalizar: true
          });
          modal.onDidDismiss(finalizou => {
            this.modalFinalizaIsOpen = false;
            this.produtoProvider.canShowToast = true;
            this.produtoProvider.setProdutosPedido([], '');
            if (finalizou) {
              this.navCtrl.pop();
            }
          });
          modal.present();
          load.dismiss();
        }
      });
  }

  public getQuantidadeCarrinho() {
    let total: any = 0;
    for (let produto of this.carrinho) {
      total += this.produtoProvider.temEstoque(produto, true);
    }
    return total;
  }

  private geraProdutoPedido() {
    let produtosPedido = [];
    for (let produto of this.carrinho) {
      for (let corProduto of produto.grade) {
        let produtoPedido;
        produtoPedido = lodash.cloneDeep(produto);
        produtoPedido.grade = lodash.cloneDeep(corProduto);
        produtosPedido.push(produtoPedido);
      }
    }
    return produtosPedido;
  }

  public visualizaCarrinho() {
    if (this.getQuantidadeCarrinho() < 1) {
      this.util.mostraToast('Seu carrinho ainda está vazio :(');
      return;
    }
    this.produtoProvider.setProdutosPedido(this.geraProdutoPedido(), this.loja.lojaId);
    this.modalFinalizaIsOpen = true;
    let modal = this.modalCtrl.create(ModalFinalizaPedidoComponent, {
      lojaId: this.loja.lojaId
    });
    modal.onDidDismiss(() => {
      this.modalFinalizaIsOpen = false;
      this.produtoProvider.setProdutosPedido([], '');
    });
    modal.present();
  }

  log(produto) {
    console.log(produto.nome + ' loaded')
  }
}
