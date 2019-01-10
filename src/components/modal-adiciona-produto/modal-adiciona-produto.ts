import {Component} from '@angular/core';
import {ModalController, NavParams, ViewController} from "ionic-angular";
import {ModalVisualizaFotoComponent} from "../modal-visualiza-foto/modal-visualiza-foto";
import {UtilProvider} from "../../providers/util/util";
import {ProdutoProvider} from "../../providers/produto/produto";
import * as lodash from 'lodash'

@Component({
  selector: 'modal-adiciona-produto',
  templateUrl: 'modal-adiciona-produto.html'
})
export class ModalAdicionaProdutoComponent {

  public produto: any = {};
  public gradeCarrinho: any = {};
  public defaultImage = 'assets/imgs/spin.svg';
  private listener;

  constructor(public viewCtrl: ViewController,
              private params: NavParams,
              private modalCtrl: ModalController,
              private util: UtilProvider,
              private produtoProvider: ProdutoProvider) {
    this.produto = lodash.cloneDeep(this.params.get('produto'));
    this.gradeCarrinho.grade = lodash.cloneDeep(this.params.get('gradeCarrinho'));
    this.produto.selectedCor = 0;
    this.produto.grade = [];
    this.startListener();
  }

  ionViewWillUnload() {
    this.listener.off();
  }

  private startListener() {
    this.listener = this.util.getFirebase().child('shoppings').child(this.params.get('shoppingId')).child('lojas')
      .child(this.params.get('lojaId')).child('produtos').child(this.produto.id).child('grade');

    this.listener.on('child_added', snapshot => {
      this.produto.grade.push(this.produtoProvider.getCor(snapshot));
    });
    this.listener.on('child_changed', snapshot => {
      let cor = this.produtoProvider.getCor(snapshot);
      for (let i = 0; i < this.produto.grade.length; i++) {
        if (this.produto.grade[i].id === cor.id) {
          this.produto.grade[i] = cor;
          this.verificaEstoque(cor);
        }
      }
    });
  }

  public getFoto() {
    return this.produtoProvider.getFoto(this.produto);
  }

  public toColor(numCor) {
    return this.produtoProvider.toColor(numCor);
  }

  public trocaFoto(cor) {
    this.produto.selectedCor = this.produto.grade.indexOf(cor);
  }

  public abreFoto() {
    let modal = this.modalCtrl.create(ModalVisualizaFotoComponent, {foto: this.getFoto()});
    modal.present();
  }

  public canShow(tamanho) {
    if (tamanho.quantidade < 1) {
      return 'none';
    }
  }

  public getProdutoCarrinhoQuantidade(tamanhoId) {
    if (!this.gradeCarrinho || !this.gradeCarrinho.grade || this.gradeCarrinho.grade.length < 1) {
      return 0
    }
    for (let cor of this.gradeCarrinho.grade) {
      if (cor.id === this.produto.grade[this.produto.selectedCor].id) {
        for (let tamanho of cor.tamanhos) {
          if (tamanhoId === tamanho.id) {
            return tamanho.quantidade;
          }
        }
      }
    }
    return 0;
  }

  public aumentaQuantidade(tamanho) {
    // Corrige possivel bug
    tamanho = lodash.cloneDeep(tamanho);
    if (!this.gradeCarrinho) {
      this.gradeCarrinho = {};
    }
    if (!this.gradeCarrinho.grade) {
      this.gradeCarrinho.grade = [];
    }
    //
    for (let corCarrinho of this.gradeCarrinho.grade) {
      if (corCarrinho.id === this.produto.grade[this.produto.selectedCor].id) {
        for (let tamCorCarrinho of corCarrinho.tamanhos) {
          if (tamCorCarrinho.id === tamanho.id) {
            if (tamCorCarrinho.quantidade < tamanho.quantidade) {
              tamCorCarrinho.quantidade += 1;
            }
            return;
          }
        }
        tamanho.quantidade = 1;
        corCarrinho.tamanhos.push(tamanho);
        return;
      }
    }
    let cor = lodash.cloneDeep(this.produto.grade[this.produto.selectedCor]);
    cor.tamanhos = [];
    tamanho.quantidade = 1;
    cor.tamanhos.push(tamanho);
    this.gradeCarrinho.grade.push(cor);
    return;
  }

  public diminuiQuantidade(tamanho) {
    if (this.gradeCarrinho && this.gradeCarrinho.grade && this.gradeCarrinho.grade.length > 0) {
      for (let corCarrinho of this.gradeCarrinho.grade) {
        if (corCarrinho.id === this.produto.grade[this.produto.selectedCor].id) {
          for (let tamCorCarrinho of corCarrinho.tamanhos) {
            if (tamCorCarrinho.id === tamanho.id) {
              if (tamCorCarrinho.quantidade > 0) {
                tamCorCarrinho.quantidade -= 1;
              }
              if (tamCorCarrinho.quantidade === 0) {
                corCarrinho.tamanhos.splice(corCarrinho.tamanhos.indexOf(tamCorCarrinho), 1);
              }
              return;
            }
          }
        }
      }
    }
  }

  public verificaQuantidade(tamanho) {
    return this.getProdutoCarrinhoQuantidade(tamanho.id) >= tamanho.quantidade;
  }

  private verificaEstoque(cor) {
    for (let corCarrinho of this.gradeCarrinho.grade) {
      if (corCarrinho.id === cor.id) {
        for (let tamCarrinho of corCarrinho.tamanhos) {
          for (let tam of cor.tamanhos) {
            if (tam.id === tamCarrinho.id) {
              if (tamCarrinho.quantidade > tam.quantidade) {
                this.util.mostraToast("Alguém separou o tamanho " + tam.tipo + " dessa peça antes de você, sobraram apenas " + tam.quantidade + " unidades :(", 5000);
                tamCarrinho.quantidade = tam.quantidade;
              }
            }
          }
        }
      }
    }
  }

  public adicionaProdutoCarrinho() {
    if (this.verificaTotal() > 0) {
      let produto = lodash.cloneDeep(this.produto);
      produto.grade = this.gradeCarrinho.grade;
      produto.selectedCor = null;
      this.viewCtrl.dismiss({produtoAdicionado: produto});
    } else {
      this.util.mostraToast("Nenhum tamanho foi adicionado :(");
      this.viewCtrl.dismiss({remove: true});
    }
  }

  public verificaTotal() {
    let total = 0;
    for (let cor of this.gradeCarrinho.grade) {
      for (let tamanho of cor.tamanhos) {
        total = total + tamanho.quantidade;
      }
    }
    return total
  }
}
