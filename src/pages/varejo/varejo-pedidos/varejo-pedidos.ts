import {Component} from '@angular/core';
import {IonicPage, ModalController, NavParams} from 'ionic-angular';
import {UtilProvider} from "../../../providers/util/util";
import {ModalVisualizaPedidoComponent} from "../../../components/modal-visualiza-pedido/modal-visualiza-pedido";

@IonicPage()
@Component({
  selector: 'page-pedidos',
  templateUrl: 'varejo-pedidos.html',
})
export class VarejoPedidosPage {

  private buttonHeight = 0;
  private contentHeight = 0;
  public isFinalizados = false;
  public pedidos = [];
  public pedidosFinalizados = [];
  private pListener;
  private pfListener;

  constructor(public modalCtrl: ModalController,
              public params: NavParams,
              private util: UtilProvider) {
    if (window.localStorage.getItem('userTipo') === 'cliente') {
      this.iniciaListenersCliente();
    }

  }

  ionViewDidLoad() {
    setTimeout(() => {
      let fixedContents = document.getElementsByClassName('fixed-content');
      this.buttonHeight = document.getElementById('div-imagens').offsetHeight;
      this.contentHeight = (fixedContents[fixedContents.length - 1].clientHeight);
    }, 500);
  }

  ionViewWillUnload() {
    this.pListener.off();
  }

  private iniciaListenersCliente() {
    let l = this.params.get('lojaId');
    let s = this.params.get('shoppingId');
    let v = this.params.get('vendedorId');
    let u = window.localStorage.getItem('uid');

    this.pListener = this.util.getLojaAtacadoPath(s, l).child('pedidos').child(v).child(u);
    this.pfListener = this.util.getLojaAtacadoPath(s, l).child('pedidosFinalizados').child(v).child(u);

    this.pListener.on('child_added', dataSnapshot => {
      this.pedidos.push(dataSnapshot.val());
    });
    this.pListener.on('child_changed', dataSnapshot => {
      for (let i = 0; i < this.pedidos.length; i++) {
        if (this.pedidos[i].id === dataSnapshot.key) {
          this.pedidos[i] = dataSnapshot.val();
        }
      }
    });
    this.pfListener.on('child_added', dataSnapshot => {
      this.pedidosFinalizados.push(dataSnapshot.val());
    });
    this.pfListener.on('child_changed', dataSnapshot => {
      for (let i = 0; i < this.pedidosFinalizados.length; i++) {
        if (this.pedidosFinalizados[i].id === dataSnapshot.key) {
          this.pedidosFinalizados[i] = dataSnapshot.val();
        }
      }
    });
  }

  public getListHeight() {
    if (this.buttonHeight > 0 && this.contentHeight > 0) {
      return this.contentHeight - this.buttonHeight;
    }
  }

  public getDataHora(timestamp) {
    return "Pedido feito no dia " + this.util.getData(timestamp) + ", às " + this.util.getHora(timestamp);
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

  public abrePedido(pedido) {
    this.modalCtrl.create(ModalVisualizaPedidoComponent, {pedido: pedido}).present();
  }
}
