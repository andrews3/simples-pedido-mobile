import {Component} from '@angular/core';
import {AlertController, ModalController, NavParams, ViewController} from "ionic-angular";
import {UtilProvider} from "../../providers/util/util";
import {ProdutoProvider} from "../../providers/produto/produto";
import {ModalVisualizaFotoComponent} from "../modal-visualiza-foto/modal-visualiza-foto";
import {AngularFireDatabase} from "angularfire2/database";
import {Http} from "@angular/http";
import * as lodash from 'lodash';

@Component({
  selector: 'modal-finaliza-pedido',
  templateUrl: 'modal-finaliza-pedido.html'
})
export class ModalFinalizaPedidoComponent {

  public lojaId = '';
  private shoppingId = '';
  public isFinalizar;

  constructor(public viewCtrl: ViewController,
              private navParams: NavParams,
              private util: UtilProvider,
              public produtoProvider: ProdutoProvider,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private fire: AngularFireDatabase,
              private http: Http) {
    this.lojaId = this.navParams.get('lojaId');
    this.shoppingId = this.navParams.get('shoppingId');
    this.isFinalizar = this.navParams.get('isFinalizar');
  }

  public abreFoto(produto) {
    let modal = this.modalCtrl.create(ModalVisualizaFotoComponent, {foto: produto.grade.foto});
    modal.present();
  }

  public getTotalPreco() {
    let total = 0;
    for (let produto of this.produtoProvider.getProdutosPedido(this.lojaId)) {
      for (let tamanho of produto.grade.tamanhos) {
        total = total + (tamanho.quantidade * produto.preco);
      }
    }
    return total.toFixed(2);
  }

  public verificaEnvio() {
    let alert = this.alertCtrl.create({
      title: 'Enviar Pedido',
      message: 'Montamos o seu pedido e estamos prestes a enviar, o valor total do pedido é de <b>R$' + this.getTotalPreco() + '</b>. Deseja enviar?',
      buttons: [{
        text: 'Cancelar'
      },
        {
          text: 'Enviar',
          handler: () => {
            this.finalizaPedido();
          }
        }]
    });
    alert.present();
  }

  private finalizaPedido() {
    let vendedorId;
    this.produtoProvider.canShowToast = false;
    for (let loja of this.util.getUsuario().lojas) {
      if (loja.lojaId === this.lojaId) {
        vendedorId = loja.vendedorId;
      }
    }
    let referenciaInicial = this.util.getFirebase().child('shoppings').child(this.shoppingId).child('lojas').child(this.lojaId);
    let pedido: any = {};
    pedido.referencia = {};
    pedido.referencia.shopping = this.shoppingId;
    pedido.referencia.loja = this.lojaId;
    pedido.referencia.vendedor = {};
    pedido.referencia.vendedor.id = vendedorId;
    pedido.cliente = {};
    pedido.cliente.id = this.util.getUsuario().uid;
    pedido.cliente.nome = this.util.getUsuario().nome;
    pedido.cliente.nomeLoja = this.util.getUsuario().nomeLoja;
    pedido.produtos = {};
    for (let produto of this.produtoProvider.getProdutosPedido(this.lojaId)) {
      let produtoPedido = lodash.cloneDeep(produto);
      produtoPedido.grade = {};
      let gradePedido = lodash.cloneDeep(produto.grade);
      gradePedido.tamanhos = {};
      for (let tamanho of produto.grade.tamanhos) {
        let referencia = referenciaInicial.child('produtos').child(produto.id).child('grade').child(produto.grade.id).child('tamanhos').child(tamanho.id).child('quantidade');
        referencia.once('value').then(snap => {
          let newVal = snap.val() - tamanho.quantidade;
          if (newVal >= 0) {
            referencia.set(newVal);
            gradePedido.tamanhos[tamanho.id] = tamanho;
          } else {
            tamanho.quantidade = 0;
            this.util.mostraToast("Houve um erro na hora de salvar o tamanho " + tamanho.tipo + " do produto " + produto.nome +
              ", alguém separou esse produto alguns segundos antes de você, sentimos muito por isso :'(", 7000);
          }
        });
      }
      console.log(gradePedido);
      if (pedido.produtos[produtoPedido.id]) {
        pedido.produtos[produtoPedido.id].grade[gradePedido.id] = gradePedido;
      } else {
        produtoPedido.grade[gradePedido.id] = gradePedido;
        pedido.produtos[produtoPedido.id] = produtoPedido;
      }
    }
    pedido.produtos = this.produtoProvider.getProdutosPedido(this.lojaId);
    this.util.getFirebase().child('solicitacaoPedido').push().set(lodash.cloneDeep(pedido));
    console.log(pedido);
    let alert = this.alertCtrl.create({
      title: "<b style='color: #260031'>Parabéns \\o/</b>",
      subTitle: '<b>Pedido enviado com sucesso!</b>',
      message: "<b>Enviamos o seu pedido para o vendedor!</b> Agora podemos enviar também uma mensagem padrão no chat avisando o vendedor.\n Deseja enviar? :D",
      buttons: [
        {
          text: "Agora não",
        },
        {
          text: 'Enviar!',
          handler: () => {
            let mens = {
              texto: "Oii, acabei de te enviar um pedido :)",
              tipo: 'texto',
              dono: window.localStorage.getItem('uid'),
              donoTipo: window.localStorage.getItem('userTipo'),
              pushId: this.fire.createPushId(),
              shoppingId: this.shoppingId,
              lojaId: this.lojaId,
              destinatarioId: vendedorId
            };
            this.util.getFirebase().child("solicitacaoMensagem").push().set(mens).catch(erro => {
              console.log(erro);
            });
            this.util.mostraToast("Mensagem enviada com sucesso!");

          }
        }
      ]
    });
    alert.onDidDismiss(() => {
      this.viewCtrl.dismiss(true);
    });
    alert.present();

  }
}
