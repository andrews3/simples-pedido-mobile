import {Component} from '@angular/core';
import {App, IonicPage, NavController, NavParams} from 'ionic-angular';
import {UtilProvider} from "../../../providers/util/util";
import {ChatPage} from "../../chat/chat";
import {VarejoSeparaPedidosPage} from "../varejo-separa-pedidos/varejo-separa-pedidos";
import {VarejoPedidosPage} from "../varejo-pedidos/varejo-pedidos";


@IonicPage()
@Component({
  selector: 'page-varejo-menu-atacado',
  templateUrl: 'varejo-menu-atacado.html',
})
export class VarejoMenuAtacadoPage {

  public loja;
  public shopping;
  public vendedorId

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private util: UtilProvider,
              private app: App) {
    this.loja = this.navParams.get('loja');
    this.shopping = this.navParams.get('shopping');
    for (let loja of this.util.getUsuario().lojas) {
      if (loja.lojaId === this.loja.lojaId) {
        this.vendedorId = loja.vendedorId;
      }
    }
  }

  public abreSepararPedidos() {
    if (this.loja.info.isDisponivel) {
      let root: any = this.app.getRootNavById('n4');
      root.push(VarejoSeparaPedidosPage, {
        shopping: this.shopping,
        loja: this.loja
      });
    } else {
      this.util.mostraToast("Infelizmente a loja não está recebendo pedidos no momento :(", 4000);
    }
  }

  public abreChat() {
    this.navCtrl.push(ChatPage, {
      destinatarioId: this.vendedorId,
      lojaId: this.loja.lojaId,
      shoppingId: this.shopping.idShopping
    });
  }

  public abrePedidos() {
    this.navCtrl.push(VarejoPedidosPage, {
      lojaId: this.loja.lojaId,
      shoppingId: this.shopping.idShopping,
      vendedorId: this.vendedorId
    });
  }
}
