import {Component} from '@angular/core';
import {App, IonicPage, NavController, NavParams, PopoverController} from 'ionic-angular';
import {UtilProvider} from "../../../providers/util/util";
import {VarejoSelecionaTabsLojaPage} from "../varejo-seleciona-tabs-loja/varejo-seleciona-tabs-loja";
import {PopoverMenuVarejoComponent} from "../../../components/popover-menu-varejo/popover-menu-varejo";

@IonicPage()
@Component({
  selector: 'page-varejo-seleciona-tabs-shopping',
  templateUrl: 'varejo-seleciona-tabs-shopping.html',
})
export class VarejoSelecionaTabsShoppingPage {

  public shoppings = [];
  private firebase;
  private loaded: boolean;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private util: UtilProvider,
              private popoverCtrl: PopoverController,
              private app: App) {
    this.firebase = this.util.getFirebase();
  }

  ionViewWillEnter() {
    this.loaded = false;
    this.loadShoppings();
  }

  private loadShoppings() {
    if (!this.util.getUsuario().userTipo) {
      setTimeout(() => {
        this.loadShoppings();
      }, 400);
    } else {
      this.shoppings = [];
      this.firebase.child("shoppings").once('value').then(snapshot => {
        if (snapshot && snapshot.hasChildren()) {
          snapshot.forEach(snapshotShopping => {
            if (snapshotShopping.hasChild('lojas')) {
              snapshotShopping.child('lojas').forEach(snapshotShoppingLoja => {
                for (let loja of this.util.getUsuario().lojas) {
                  if (loja.lojaId === snapshotShoppingLoja.key) {
                    if (this.canAddShopping(snapshotShopping)) {
                      let shop = snapshotShopping.val();
                      shop.idShopping = snapshotShopping.key;
                      this.shoppings.push(shop);
                    }
                  }
                }
              })
            }
          });
        }
        this.loaded = true;
      }).catch(erro => {
        console.log(erro);
      });
    }
  }

  private canAddShopping(snapshotShopping) {
    for (let shopping of this.shoppings) {
      if (shopping.idShopping === snapshotShopping.key || snapshotShopping.key === 'lojasIndependentes') {
        return false;
      }
    }
    return true;
  }

  public selecionaShopping(shopping) {
    // this.navCtrl.push(VarejoSelecionaTabsLojaPage, {shopping: shopping});
    let root: any = this.app.getRootNavById('n4');
    root.push(VarejoSelecionaTabsLojaPage, {shopping: shopping});
  }

  public abreMenu(event) {
    let pop = this.popoverCtrl.create(PopoverMenuVarejoComponent);
    pop.present({
      ev: event
    });
  }
}
