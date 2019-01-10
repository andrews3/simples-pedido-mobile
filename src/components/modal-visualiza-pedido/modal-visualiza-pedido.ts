import {Component} from '@angular/core';
import {ModalController, NavParams, Platform, ViewController} from "ionic-angular";
import {ModalVisualizaFotoComponent} from "../modal-visualiza-foto/modal-visualiza-foto";

@Component({
  selector: 'modal-visualiza-pedido',
  templateUrl: 'modal-visualiza-pedido.html'
})
export class ModalVisualizaPedidoComponent {

  public pedido;

  constructor(public viewCtrl: ViewController,
              private modalCtrl: ModalController,
              private params: NavParams,
              public platform: Platform) {
    this.pedido = this.params.get('pedido');
  }

  public abreFoto(produto) {
    let modal = this.modalCtrl.create(ModalVisualizaFotoComponent, {foto: produto.grade.foto});
    modal.present();
  }

  public isCliente() {
    return window.localStorage.getItem('userTipo') === 'cliente';
  }

  public getTotalPreco(pedido) {
    let total = 0;
    for (let produto of pedido.produtos) {
      for (let tamanho of produto.grade.tamanhos) {
        total = total + (tamanho.quantidade * produto.preco);
      }
    }
    return total.toFixed(2);
  }

  public abreOpcoesPedido() {

  }
}
