import {Component} from '@angular/core';
import {App, IonicPage, NavController, NavParams, PopoverController} from 'ionic-angular';
import {UtilProvider} from "../../../providers/util/util";
import {PopoverMenuVarejoComponent} from "../../../components/popover-menu-varejo/popover-menu-varejo";
import {VarejoMenuAtacadoPage} from "../varejo-menu-atacado/varejo-menu-atacado";

@IonicPage()
@Component({
  selector: 'page-varejo-seleciona-tabs-loja',
  templateUrl: 'varejo-seleciona-tabs-loja.html',
})
export class VarejoSelecionaTabsLojaPage {

  public shopping;
  public lojas = [];
  public loaded;
  private firebase;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private util: UtilProvider,
              private popoverCtrl: PopoverController,
              private app: App) {
    this.firebase = this.util.getFirebase();
    if (this.navParams.get('shopping')) {
      this.shopping = this.navParams.get('shopping');
      this.loadLojas();
    }
  }

  ionViewWillEnter() {
    if (!this.shopping) {
      this.lojas = [];
      this.loaded = false;
      this.loadLojas();
    }
  }

  private loadLojas() {
    if (!this.util.getUsuario().userTipo) {
      setTimeout(() => {
        this.loadLojas();
      }, 200);
    } else {
      let reference;
      if (this.shopping) {
        reference = this.firebase.child('shoppings').child(this.shopping.idShopping).child('lojas');
      } else {
        reference = this.firebase.child('shoppings').child('lojasIndependentes').child('lojas');
      }
      reference.once('value').then(dataSnapshot => {
        if (dataSnapshot && dataSnapshot.hasChildren()) {
          dataSnapshot.forEach(snapshotLoja => {
            for (let loja of this.util.getUsuario().lojas) {
              if (loja.lojaId === snapshotLoja.key) {
                let l = snapshotLoja.val();
                l.lojaId = snapshotLoja.key;
                this.lojas.push(l);
              }
            }
          });
        }
        this.loaded = true;
      }).catch(erro => {
        console.log(erro);
      });
    }
  }

  public selecionaLoja(loja) {
    let root: any = this.app.getRootNavById('n4');
    root.push(VarejoMenuAtacadoPage, {shopping: this.shopping, loja: loja});
  }

  public abreMenu(event) {
    let pop = this.popoverCtrl.create(PopoverMenuVarejoComponent);
    pop.present({
      ev: event
    });
  }
}
